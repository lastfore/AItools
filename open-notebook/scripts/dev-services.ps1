# Shared helpers for Windows dev start/stop scripts.

$script:DevServicesStopping = $false

function Invoke-DockerCommand {
    param(
        [Parameter(Mandatory)]
        [string[]]$Arguments
    )

    # Native docker.exe writes errors to stderr; with $ErrorActionPreference = 'Stop'
    # that becomes a terminating ErrorRecord unless we use Continue here.
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $output = & docker @Arguments 2>&1
        return @{
            ExitCode = $LASTEXITCODE
            Output   = @($output)
        }
    }
    finally {
        $ErrorActionPreference = $prev
    }
}

function Invoke-DockerCompose {
    param([Parameter(Mandatory)][string[]]$ComposeArgs)
    return Invoke-DockerCommand -Arguments (@('compose') + $ComposeArgs)
}

function Get-DockerOutputLines {
    param($RawOutput)
    if ($null -eq $RawOutput) { return @() }
    return ,@($RawOutput | ForEach-Object {
            if ($_ -is [System.Management.Automation.ErrorRecord]) { $_.ToString() }
            else { "$_" }
        } | Where-Object { $_ -match '\S' })
}

function Test-DockerDaemon {
    $result = Invoke-DockerCommand -Arguments @('info')
    return $result.ExitCode -eq 0
}

function Test-SurrealContainerRunning {
    $result = Invoke-DockerCompose -ComposeArgs @('ps', '-q', '--status', 'running', 'surrealdb')
    if ($result.ExitCode -ne 0) { return $false }
    return (@(Get-DockerOutputLines $result.Output)).Count -gt 0
}

function Test-SpeachesContainerRunning {
    $result = Invoke-DockerCompose -ComposeArgs @('ps', '-q', '--status', 'running', 'speaches')
    if ($result.ExitCode -ne 0) { return $false }
    return (@(Get-DockerOutputLines $result.Output)).Count -gt 0
}

function Test-SearxngContainerRunning {
    $result = Invoke-DockerCompose -ComposeArgs @('ps', '-q', '--status', 'running', 'searxng')
    if ($result.ExitCode -ne 0) { return $false }
    return (@(Get-DockerOutputLines $result.Output)).Count -gt 0
}

function Get-DockerDesktopPath {
    $candidates = @(
        (Join-Path ${env:ProgramFiles} 'Docker\Docker\Docker Desktop.exe'),
        (Join-Path ${env:ProgramFiles(x86)} 'Docker\Docker\Docker Desktop.exe'),
        (Join-Path $env:LOCALAPPDATA 'Docker\Docker Desktop.exe')
    )
    foreach ($path in $candidates) {
        if ($path -and (Test-Path $path)) { return $path }
    }
    return $null
}

function Wait-ForDockerDaemon {
    param([int]$TimeoutSeconds = 180)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (Test-DockerDaemon) { return $true }
        Start-Sleep -Seconds 2
    }
    return $false
}

function Ensure-DockerDaemon {
    param([int]$TimeoutSeconds = 180)

    if (Test-DockerDaemon) { return }

    $desktop = Get-DockerDesktopPath
    if (-not $desktop) {
        throw @"
Docker is installed but the daemon is not running, and Docker Desktop was not found.
  - Install Docker Desktop: https://www.docker.com/products/docker-desktop/
  - Or run SurrealDB on port 8000 yourself (the script will detect it and skip Docker).
"@
    }

    Write-Host '    Docker daemon is not running. Starting Docker Desktop...' -ForegroundColor Yellow
    Start-Process -FilePath $desktop | Out-Null
    Write-Host "    Waiting for Docker to become ready (up to $TimeoutSeconds seconds)..." -ForegroundColor Yellow

    if (-not (Wait-ForDockerDaemon -TimeoutSeconds $TimeoutSeconds)) {
        throw "Docker did not become ready within $TimeoutSeconds seconds. Open Docker Desktop manually and retry."
    }

    Write-Host '    Docker is ready.' -ForegroundColor Green
}

function Write-Ok([string]$Message) {
    Write-Host "    $Message" -ForegroundColor Green
}

function Stop-ProcessTree {
    param([int]$ProcessId)

    if ($ProcessId -le 0) { return }
    $prev = $ErrorActionPreference
    $ErrorActionPreference = 'SilentlyContinue'
    try {
        & taskkill.exe /PID $ProcessId /T /F 2>&1 | Out-Null
    }
    finally {
        $ErrorActionPreference = $prev
    }
}

function Stop-ProcessesMatching {
    param([string]$Pattern)

    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object { $_.CommandLine -and ($_.CommandLine -match $Pattern) } |
        ForEach-Object { Stop-ProcessTree -ProcessId $_.ProcessId }
}

function Stop-PortListeners {
    param([int[]]$Ports)

    foreach ($port in $Ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($connection in $connections) {
            Stop-ProcessTree -ProcessId $connection.OwningProcess
        }
    }
}

function Get-DevStatePath {
    param([string]$RepoRoot)
    return Join-Path $RepoRoot '.dev-logs\state.json'
}

function Write-DevState {
    param(
        [string]$RepoRoot,
        [bool]$StartedSurreal,
        [bool]$StartedSpeaches = $false,
        [bool]$StartedSearxng = $false,
        [int[]]$ManagedPids = @()
    )

    $logDir = Join-Path $RepoRoot '.dev-logs'
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    @{
        started_surreal   = $StartedSurreal
        started_speaches  = $StartedSpeaches
        started_searxng   = $StartedSearxng
        managed_pids      = @($ManagedPids)
    } | ConvertTo-Json | Set-Content (Get-DevStatePath -RepoRoot $RepoRoot)
}

function Read-DevState {
    param([string]$RepoRoot)

    $path = Get-DevStatePath -RepoRoot $RepoRoot
    if (-not (Test-Path $path)) { return $null }
    return Get-Content $path -Raw | ConvertFrom-Json
}

function Get-DevStateBool {
    param(
        $State,
        [string]$Name,
        [bool]$Default = $false
    )

    if (-not $State) { return $Default }
    if ($State.PSObject.Properties.Name -notcontains $Name) { return $Default }
    return [bool]$State.$Name
}

function Remove-DevState {
    param([string]$RepoRoot)

    $path = Get-DevStatePath -RepoRoot $RepoRoot
    if (Test-Path $path) { Remove-Item $path -Force }
}

function Stop-DevServices {
    param(
        [string]$RepoRoot,
        [switch]$KeepDatabase,
        [int[]]$ManagedPids = @(),
        [switch]$Force
    )

    if ($script:DevServicesStopping -eq $true) { return }
    $script:DevServicesStopping = $true

    Push-Location $RepoRoot
    try {
        $state = Read-DevState -RepoRoot $RepoRoot
        $stopSurreal = (Get-DevStateBool -State $state -Name 'started_surreal') -and -not $KeepDatabase
        $stopSpeaches = (Get-DevStateBool -State $state -Name 'started_speaches') -and -not $KeepDatabase
        $stopSearxng = (Get-DevStateBool -State $state -Name 'started_searxng') -and -not $KeepDatabase
        $hasManaged = @($ManagedPids).Count -gt 0
        $hasDevPorts = @(
            @(3000, 5055) | Where-Object {
                Get-NetTCPConnection -LocalPort $_ -State Listen -ErrorAction SilentlyContinue
            }
        ).Count -gt 0

        if (-not $Force -and -not $hasManaged -and -not $stopSurreal -and -not $stopSpeaches -and -not $stopSearxng -and -not $hasDevPorts) {
            Remove-DevState -RepoRoot $RepoRoot
            return
        }

        Write-Host "`nStopping Open Notebook dev services..." -ForegroundColor Yellow

        $pidsToStop = [System.Collections.Generic.List[int]]::new()
        foreach ($procId in @($ManagedPids)) {
            if ($procId -gt 0) { [void]$pidsToStop.Add($procId) }
        }
        if ($state -and $state.managed_pids) {
            foreach ($procId in @($state.managed_pids)) {
                if ($procId -gt 0 -and -not $pidsToStop.Contains($procId)) {
                    [void]$pidsToStop.Add($procId)
                }
            }
        }

        foreach ($procId in $pidsToStop) {
            Stop-ProcessTree -ProcessId $procId
        }

        Stop-PortListeners -Ports @(3000, 5055)
        Stop-ProcessesMatching -Pattern 'next(\.exe)?(\s|").*dev|next dev'
        Stop-ProcessesMatching -Pattern 'uvicorn api\.main:app|run_api\.py'
        Stop-ProcessesMatching -Pattern 'surreal-commands-worker'

        if ($stopSurreal) {
            Write-Ok 'Stopping SurrealDB container...'
            $null = Invoke-DockerCompose -ComposeArgs @('stop', 'surrealdb')
        }

        if ($stopSpeaches) {
            Write-Ok 'Stopping Speaches container...'
            $null = Invoke-DockerCompose -ComposeArgs @('stop', 'speaches')
        }

        if ($stopSearxng) {
            Write-Ok 'Stopping SearXNG container...'
            $null = Invoke-DockerCompose -ComposeArgs @('stop', 'searxng')
        }

        Remove-DevState -RepoRoot $RepoRoot
        Write-Host "Done. Logs remain in .dev-logs/" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

function Register-DevCleanupHandlers {
    param(
        [string]$RepoRoot,
        [int[]]$ManagedPids,
        [switch]$KeepDatabase
    )

    $onStop = {
        Stop-DevServices -RepoRoot $RepoRoot -KeepDatabase:$KeepDatabase -ManagedPids $ManagedPids
    }

    try {
        [Console]::TreatControlCAsInput = $false
        [void][Console]::CancelKeyPress.Add({
            param($sender, $e)
            $e.Cancel = $true
            & $onStop
            [Environment]::Exit(0)
        })
    }
    catch {
        # Non-interactive hosts (e.g. CI) cannot register console handlers.
    }

    Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action $onStop | Out-Null
}
