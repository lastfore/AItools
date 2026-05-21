#Requires -Version 5.1
<#
.SYNOPSIS
  Stop Open Notebook local dev services started by start-dev-windows.ps1.

.PARAMETER KeepDatabase
  Do not stop the SurrealDB and Speaches containers even if this session started them.
#>
[CmdletBinding()]
param(
    [switch]$KeepDatabase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
. (Join-Path $PSScriptRoot 'dev-services.ps1')

Stop-DevServices -RepoRoot $Root -KeepDatabase:$KeepDatabase -Force
