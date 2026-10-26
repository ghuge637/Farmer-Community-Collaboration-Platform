# Start Docker Compose stack for local dev
# Usage: ./run-backend-docker.ps1

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $PSCommandPath
Push-Location $here

Write-Host "Starting Docker Compose services (db + backend)" -ForegroundColor Cyan

try {
    & docker version > $null 2>&1
} catch {
    Write-Host "Error: Docker not found. Install Docker Desktop and ensure it's running." -ForegroundColor Red
    Pop-Location
    exit 1
}

Write-Host "Building and starting services..." -ForegroundColor Green
& docker compose up -d --build
Write-Host "Tailing backend logs (Ctrl+C to stop):" -ForegroundColor Green
& docker compose logs --follow backend

Pop-Location
