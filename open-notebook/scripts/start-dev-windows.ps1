#Requires -Version 5.1
<#
.SYNOPSIS
  Start Open Notebook local dev stack (SurrealDB + API + worker + frontend).

.DESCRIPTION
  Mirrors docs_zh/spec/windows-deployment.zh.md section 4.3. Press Ctrl+C to stop all
  processes started by this script. If the terminal is closed abruptly, run
  .\stop-dev.ps1 to clean up orphaned processes.

.PARAMETER SkipInstall
  Skip `uv sync` and `npm install` (faster restarts).

.PARAMETER KeepDatabase
  Leave SurrealDB, Speaches, and SearXNG Docker containers running when the script exits.

.PARAMETER SkipSpeaches
  Do not start the local Speaches TTS/STT container.

.PARAMETER SkipSpeachesModels
  Skip pre-downloading Speaches speech models on first run (models may download on first use).

.PARAMETER SkipSearxng
  Do not start the local SearXNG container (internet keyword search).

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File .\scripts\start-dev-windows.ps1
#>
[CmdletBinding()]
param(
    [switch]$SkipInstall,
    [switch]$KeepDatabase,
    [switch]$SkipSpeaches,
    [switch]$SkipSpeachesModels,
    [switch]$SkipSearxng
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $Root

. (Join-Path $PSScriptRoot 'dev-services.ps1')

$LogDir = Join-Path $Root '.dev-logs'
$script:StartedSurreal = $false
$script:StartedSpeaches = $false
$script:StartedSearxng = $false
$script:ManagedPids = [System.Collections.Generic.List[int]]::new()

$script:SpeachesTtsModel = 'speaches-ai/Kokoro-82M-v1.0-ONNX'
$script:SpeachesSttModel = 'Systran/faster-whisper-large-v3'

function Write-Step([string]$Message) {
    Write-Host "`n==> $Message" -ForegroundColor Cyan
}

function Write-Warn([string]$Message) {
    Write-Host "    $Message" -ForegroundColor Yellow
}

function Assert-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command not found: $Name. Install it and ensure it is on PATH."
    }
}

function Ensure-EnvFile {
    $envPath = Join-Path $Root '.env'
    $examplePath = Join-Path $Root '.env.example'

    if (-not (Test-Path $envPath)) {
        if (-not (Test-Path $examplePath)) {
            throw "Missing .env and .env.example in $Root"
        }
        Copy-Item $examplePath $envPath
        $content = Get-Content $envPath -Raw
        $content = $content -replace 'ws://surrealdb:8000/rpc', 'ws://127.0.0.1:8000/rpc'
        $content = $content -replace 'ws://localhost:8000/rpc', 'ws://127.0.0.1:8000/rpc'
        Set-Content -Path $envPath -Value $content -NoNewline
        Write-Ok "Created .env from .env.example (SURREAL_URL set to ws://127.0.0.1:8000/rpc)"
    }

    $envText = Get-Content $envPath -Raw
    if ($envText -match 'SURREAL_URL=ws://surrealdb:8000/rpc') {
        Write-Warn '.env still points at Docker hostname "surrealdb". For local API, use ws://127.0.0.1:8000/rpc'
    }
    if ($envText -match 'OPEN_NOTEBOOK_ENCRYPTION_KEY=change-me-to-a-secret-string') {
        Write-Warn 'Set OPEN_NOTEBOOK_ENCRYPTION_KEY in .env before storing API keys in production.'
    }
}

function Test-EnvSearxngEnabled {
    param([string]$EnvPath)

    if (-not (Test-Path $EnvPath)) { return $false }
    foreach ($line in Get-Content $EnvPath) {
        $trimmed = $line.Trim()
        if ($trimmed -match '^\s*#' -or $trimmed -eq '') { continue }
        if ($trimmed -match '^SEARXNG_ENABLED\s*=\s*(.+)$') {
            $value = $Matches[1].Trim().Trim('"').Trim("'").ToLower()
            return $value -in @('1', 'true', 'yes', 'on')
        }
    }
    return $false
}

function Test-PortInUse {
    param([int]$Port)
    return [bool](Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Assert-PortFree {
    param(
        [int]$Port,
        [string]$ServiceName
    )
    if (Test-PortInUse -Port $Port) {
        throw "Port $Port is already in use ($ServiceName). Stop the existing process or run: .\stop-dev.ps1"
    }
}

function Wait-ForTcpPort {
    param(
        [int]$Port,
        [string]$HostName = '127.0.0.1',
        [int]$TimeoutSeconds = 90
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $client = New-Object System.Net.Sockets.TcpClient
        try {
            $client.Connect($HostName, $Port)
            $client.Close()
            return $true
        }
        catch {
            Start-Sleep -Seconds 1
        }
        finally {
            if ($client.Connected) { $client.Close() }
        }
    }
    return $false
}

function Test-LocalHttpOk {
    param(
        [string]$Uri,
        [int]$TimeoutMs = 3000
    )

    # Bypass system HTTP proxy (common cause of failed localhost health checks on Windows).
    try {
        $request = [System.Net.HttpWebRequest]::Create($Uri)
        $request.Proxy = $null
        $request.Timeout = $TimeoutMs
        $response = $request.GetResponse()
        $status = [int]$response.StatusCode
        $response.Close()
        return $status -eq 200
    }
    catch {
        return $false
    }
}

function Wait-ForApiHealth {
    param([int]$TimeoutSeconds = 120)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-LocalHttpOk -Uri 'http://127.0.0.1:5055/health') {
            return $true
        }
        Start-Sleep -Seconds 2
    }
    return $false
}

function Start-ManagedProcess {
    param(
        [string]$Name,
        [string]$FilePath,
        [string[]]$ArgumentList,
        [string]$WorkingDirectory = $Root,
        [hashtable]$Environment = @{}
    )

    New-Item -ItemType Directory -Force -Path $LogDir | Out-Null
    $stdout = Join-Path $LogDir "$Name.out.log"
    $stderr = Join-Path $LogDir "$Name.err.log"

    $savedEnv = @{}
    foreach ($key in $Environment.Keys) {
        # Use .NET API: Get-Item Env: returns $null when unset; .Value then fails under StrictMode.
        $savedEnv[$key] = [Environment]::GetEnvironmentVariable($key, 'Process')
        Set-Item -Path "Env:$key" -Value $Environment[$key]
    }

    try {
        $proc = Start-Process `
            -FilePath $FilePath `
            -ArgumentList $ArgumentList `
            -WorkingDirectory $WorkingDirectory `
            -RedirectStandardOutput $stdout `
            -RedirectStandardError $stderr `
            -PassThru `
            -WindowStyle Hidden

        if (-not $proc) {
            throw "Failed to start $Name"
        }

        [void]$script:ManagedPids.Add($proc.Id)
        Write-Ok "$Name started (PID $($proc.Id), logs in .dev-logs\$Name.*.log)"
        return $proc
    }
    finally {
        foreach ($key in $Environment.Keys) {
            if ($null -eq $savedEnv[$key]) {
                Remove-Item -Path "Env:$key" -ErrorAction SilentlyContinue
            }
            else {
                Set-Item -Path "Env:$key" -Value $savedEnv[$key]
            }
        }
    }
}

function Start-SpeachesService {
    if (Test-PortInUse -Port 8969) {
        Write-Ok 'Port 8969 is already in use; using existing Speaches (skipping docker compose)'
        return $true
    }

    Ensure-DockerDaemon

    $speachesWasRunning = Test-SpeachesContainerRunning
    $result = Invoke-DockerCompose -ComposeArgs @('up', '-d', 'speaches')
    if ($result.ExitCode -ne 0) {
        $lines = Get-DockerOutputLines $result.Output
        $detail = if (@($lines).Count -gt 0) { $lines -join [Environment]::NewLine } else { '(no output)' }
        throw "docker compose up speaches failed (exit $($result.ExitCode)).`n$detail"
    }

    if ($speachesWasRunning) {
        Write-Ok 'Speaches was already running; leaving it up when this script exits'
        return $true
    }

    return $false
}

function Ensure-SpeachesModels {
    param([string]$RepoRoot)

    if ($SkipSpeachesModels) {
        Write-Warn 'Skipping Speaches model download (-SkipSpeachesModels). Models may download on first use.'
        return
    }

    $marker = Join-Path $RepoRoot '.dev-logs\speaches-models.ok'
    if (Test-Path $marker) {
        Write-Ok 'Speaches models already downloaded (.dev-logs\speaches-models.ok exists; delete to re-fetch)'
        return
    }

    Write-Step 'Downloading Speaches speech models (first run only; may take several minutes)'
    foreach ($model in @($script:SpeachesTtsModel, $script:SpeachesSttModel)) {
        Write-Host "    $model" -ForegroundColor DarkGray
        $result = Invoke-DockerCompose -ComposeArgs @(
            'exec', '-T', 'speaches',
            'uv', 'tool', 'run', 'speaches-cli', 'model', 'download', $model
        )
        if ($result.ExitCode -ne 0) {
            $lines = Get-DockerOutputLines $result.Output
            $detail = if (@($lines).Count -gt 0) { ($lines | Select-Object -Last 3) -join '; ' } else { 'unknown error' }
            Write-Warn "Model download failed for $model ($detail). Retry: docker compose exec speaches uv tool run speaches-cli model download $model"
            return
        }
    }

    New-Item -ItemType Directory -Force -Path (Split-Path $marker) | Out-Null
    Set-Content -Path $marker -Value @(
        "tts=$($script:SpeachesTtsModel)"
        "stt=$($script:SpeachesSttModel)"
        "downloaded_at=$(Get-Date -Format 'o')"
    )
    Write-Ok 'Speaches TTS/STT models ready'
}

function Start-SearxngService {
    if (Test-PortInUse -Port 8080) {
        Write-Ok 'Port 8080 is already in use; using existing SearXNG (skipping docker compose)'
        return $true
    }

    Ensure-DockerDaemon

    $searxngWasRunning = Test-SearxngContainerRunning
    $result = Invoke-DockerCompose -ComposeArgs @('up', '-d', 'searxng')
    if ($result.ExitCode -ne 0) {
        $lines = Get-DockerOutputLines $result.Output
        $detail = if (@($lines).Count -gt 0) { $lines -join [Environment]::NewLine } else { '(no output)' }
        throw "docker compose up searxng failed (exit $($result.ExitCode)).`n$detail"
    }

    if ($searxngWasRunning) {
        Write-Ok 'SearXNG was already running; leaving it up when this script exits'
        return $true
    }

    return $false
}

function Start-SurrealDatabase {
    if (Test-PortInUse -Port 8000) {
        Write-Ok 'Port 8000 is already in use; using existing SurrealDB (skipping docker compose)'
        return $true
    }

    Ensure-DockerDaemon

    $surrealWasRunning = Test-SurrealContainerRunning
    $result = Invoke-DockerCompose -ComposeArgs @('up', '-d', 'surrealdb')
    if ($result.ExitCode -ne 0) {
        $lines = Get-DockerOutputLines $result.Output
        $detail = if (@($lines).Count -gt 0) { $lines -join [Environment]::NewLine } else { '(no output)' }
        throw "docker compose up surrealdb failed (exit $($result.ExitCode)).`n$detail"
    }

    if ($surrealWasRunning) {
        Write-Ok 'SurrealDB was already running; leaving it up when this script exits'
        return $true
    }

    return $false
}

try {
    Write-Host @"

  Open Notebook - local dev launcher (Windows)
  Repo: $Root

"@ -ForegroundColor White

    Assert-Command 'uv'
    Assert-Command 'npm'
    Assert-Command 'docker'

    Ensure-EnvFile

    if (-not $SkipInstall) {
        Write-Step 'Installing Python dependencies (uv sync)'
        & uv sync
        if ($LASTEXITCODE -ne 0) { throw "uv sync failed with exit code $LASTEXITCODE" }

        Write-Step 'Installing frontend dependencies (npm install)'
        Push-Location (Join-Path $Root 'frontend')
        try {
            & npm install
            if ($LASTEXITCODE -ne 0) { throw "npm install failed with exit code $LASTEXITCODE" }
        }
        finally {
            Pop-Location
        }
    }

    Write-Step 'Starting SurrealDB (docker compose)'
    $surrealAlreadyUp = Start-SurrealDatabase
    if (-not $surrealAlreadyUp) {
        $script:StartedSurreal = $true
    }

    Write-DevState -RepoRoot $Root -StartedSurreal $script:StartedSurreal -StartedSpeaches $script:StartedSpeaches -StartedSearxng $script:StartedSearxng

    if (-not (Wait-ForTcpPort -Port 8000)) {
        throw 'SurrealDB did not become reachable on port 8000'
    }
    Write-Ok 'SurrealDB is listening on port 8000'

    if (-not $SkipSpeaches) {
        Write-Step 'Starting Speaches TTS/STT (docker compose, port 8969)'
        $speachesAlreadyUp = Start-SpeachesService
        if (-not $speachesAlreadyUp) {
            $script:StartedSpeaches = $true
        }

        Write-DevState -RepoRoot $Root -StartedSurreal $script:StartedSurreal -StartedSpeaches $script:StartedSpeaches -StartedSearxng $script:StartedSearxng

        if (-not (Wait-ForTcpPort -Port 8969 -TimeoutSeconds 120)) {
            throw 'Speaches did not become reachable on port 8969 — check: docker compose logs speaches'
        }
        Write-Ok 'Speaches is listening on port 8969'

        Ensure-SpeachesModels -RepoRoot $Root
    }
    else {
        Write-Warn 'Speaches skipped (-SkipSpeaches). Use local/cloud TTS/STT only if already configured.'
    }

    $envPath = Join-Path $Root '.env'
    $searxngEnabledInEnv = Test-EnvSearxngEnabled -EnvPath $envPath
    if (-not $SkipSearxng -and $searxngEnabledInEnv) {
        Write-Step 'Starting SearXNG (docker compose, port 8080)'
        $searxngAlreadyUp = Start-SearxngService
        if (-not $searxngAlreadyUp) {
            $script:StartedSearxng = $true
        }

        if (-not (Wait-ForTcpPort -Port 8080 -TimeoutSeconds 120)) {
            throw 'SearXNG did not become reachable on port 8080 — check: docker compose logs searxng'
        }
        if (-not (Test-LocalHttpOk -Uri 'http://127.0.0.1:8080')) {
            throw 'SearXNG health check failed at http://127.0.0.1:8080 — check: docker compose logs searxng'
        }
        Write-Ok 'SearXNG is listening on port 8080'
    }
    elseif ($SkipSearxng) {
        Write-Warn 'SearXNG skipped (-SkipSearxng). Internet keyword search needs a running SearXNG instance.'
    }
    elseif (-not $searxngEnabledInEnv) {
        Write-Warn 'SearXNG skipped (SEARXNG_ENABLED is not true in .env). Set SEARXNG_ENABLED=true to enable web search.'
    }

    Write-DevState -RepoRoot $Root -StartedSurreal $script:StartedSurreal -StartedSpeaches $script:StartedSpeaches -StartedSearxng $script:StartedSearxng
    Register-DevCleanupHandlers -RepoRoot $Root -ManagedPids $script:ManagedPids -KeepDatabase:$KeepDatabase

    Write-Step 'Starting API (port 5055)'
    Assert-PortFree -Port 5055 -ServiceName 'API'
    $prevApiReload = $env:API_RELOAD
    $env:API_RELOAD = 'false'
    try {
        Start-ManagedProcess `
            -Name 'api' `
            -FilePath 'uv' `
            -ArgumentList @('run', '--env-file', '.env', 'run_api.py')
    }
    finally {
        if ($null -ne $prevApiReload) { $env:API_RELOAD = $prevApiReload }
        else { Remove-Item Env:API_RELOAD -ErrorAction SilentlyContinue }
    }

    if (-not (Wait-ForTcpPort -Port 5055 -TimeoutSeconds 90)) {
        throw 'API did not open port 5055 in time — see .dev-logs/api.err.log'
    }
    if (-not (Wait-ForApiHealth)) {
        throw 'API health check failed at http://127.0.0.1:5055/health — see .dev-logs/api.err.log'
    }
    Write-Ok 'API is healthy'

    Write-Step 'Starting background worker (surreal-commands)'
    # UTF-8 console on Chinese Windows: surreal-commands uses Rich with Unicode (e.g. checkmarks).
    Start-ManagedProcess `
        -Name 'worker' `
        -FilePath 'uv' `
        -ArgumentList @(
            'run', '--env-file', '.env',
            'surreal-commands-worker', '--import-modules', 'commands'
        ) `
        -Environment @{
            PYTHONUTF8         = '1'
            PYTHONIOENCODING   = 'utf-8'
        }

    Write-DevState -RepoRoot $Root -StartedSurreal $script:StartedSurreal -StartedSpeaches $script:StartedSpeaches -StartedSearxng $script:StartedSearxng -ManagedPids @($script:ManagedPids)

    $speachesLine = if ($SkipSpeaches) {
        '    Speaches : (skipped — use -SkipSpeaches only if you run TTS/STT elsewhere)'
    } else {
        "    Speaches : http://localhost:8969  (TTS: $($script:SpeachesTtsModel))"
    }

    $searxngLine = if ($SkipSearxng -or -not $searxngEnabledInEnv) {
        '    SearXNG  : (skipped — set SEARXNG_ENABLED=true in .env or omit -SkipSearxng)'
    } else {
        '    SearXNG  : http://localhost:8080  (internet keyword search)'
    }

    Write-Host @"

  Services ready:
    Frontend : http://localhost:3000
    API      : http://localhost:5055
    API docs : http://localhost:5055/docs
    SurrealDB: http://localhost:8000
$speachesLine
$searxngLine

  Configure speech in UI: Settings → API Keys → OpenAI Compatible
  Press Ctrl+C to stop (add -KeepDatabase to leave Docker containers running).

"@ -ForegroundColor White

    Assert-PortFree -Port 3000 -ServiceName 'frontend'
    Push-Location (Join-Path $Root 'frontend')
    try {
        & npm run dev
    }
    finally {
        Pop-Location
    }
}
finally {
    Stop-DevServices -RepoRoot $Root -KeepDatabase:$KeepDatabase -ManagedPids $script:ManagedPids
}
