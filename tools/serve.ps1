param([int]$Port = 8765)
$ErrorActionPreference = 'Stop'
$tcarsRoot = Split-Path $PSScriptRoot -Parent
Write-Host "In DarkRide Running Scripts, load http://127.0.0.1:$Port/launch-tcars.js"
Write-Host 'Keep this terminal running. Ctrl+C stops the local server.'
python -m http.server $Port --bind 127.0.0.1 --directory $tcarsRoot
