<#
Start full dev environment: backend (dev or Docker) and frontend
Usage:
  ./run-dev-all.ps1        # starts backend in dev (H2) and opens frontend in new window
  ./run-dev-all.ps1 -UseDocker  # starts docker compose (db + backend) and opens frontend
#>

param(
  [switch]$UseDocker
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSCommandPath

function Start-Backend-Dev {
  $script = Join-Path $root 'backend/run-backend-dev.ps1'
  if (-Not (Test-Path $script)) { Write-Host "Backend dev script not found: $script" -ForegroundColor Red; exit 1 }
  Write-Host "Starting backend (dev profile) in background..." -ForegroundColor Cyan
  Start-Process -FilePath 'powershell' -ArgumentList "-NoExit","-Command","& '$script'" -WindowStyle Normal
}

function Start-Backend-Docker {
  $script = Join-Path $root 'run-backend-docker.ps1'
  if (-Not (Test-Path $script)) { Write-Host "Docker helper not found: $script" -ForegroundColor Red; exit 1 }
  Write-Host "Starting backend via Docker Compose in background..." -ForegroundColor Cyan
  Start-Process -FilePath 'powershell' -ArgumentList "-NoExit","-Command","& '$script'" -WindowStyle Normal
}

function Start-Frontend {
  $cwd = Join-Path $root ''
  $cmds = "cd '$cwd' ; npm install ; npm run dev"
  Write-Host "Opening frontend (Vite) in a new terminal window..." -ForegroundColor Green
  Start-Process -FilePath 'powershell' -ArgumentList "-NoExit","-Command","$cmds" -WindowStyle Normal
}

if ($UseDocker) {
  Start-Backend-Docker
} else {
  Start-Backend-Dev
}

Start-Frontend

Write-Host "Dev environment launched. Check the opened terminal windows for logs." -ForegroundColor Green
