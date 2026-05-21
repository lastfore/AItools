# Quick launcher — run from repo root:
#   .\start-dev.ps1
#   .\start-dev.ps1 -SkipInstall
#   .\start-dev.ps1 -KeepDatabase          # leave SurrealDB + Speaches running on exit
#   .\start-dev.ps1 -SkipSpeachesModels    # skip first-run model download (~3GB)
#   .\start-dev.ps1 -SkipSpeaches          # no local TTS/STT container
& "$PSScriptRoot\scripts\start-dev-windows.ps1" @args
