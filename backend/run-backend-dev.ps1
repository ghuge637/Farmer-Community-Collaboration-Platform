# Run backend in dev mode (H2 in-memory DB)
# Usage: Open PowerShell, cd to project root, then: \n#   ./backend/run-backend-dev.ps1

$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $PSCommandPath
Push-Location $here

Write-Host "Starting backend in dev profile (H2 in-memory). Requires Java 17 and Maven on PATH." -ForegroundColor Cyan

# check for mvn
try {
    & mvn -v > $null 2>&1
} catch {
    Write-Host "Error: 'mvn' not found on PATH. Install Maven and ensure it's on PATH." -ForegroundColor Red
    Pop-Location
    exit 1
}

# run with dev profile
Write-Host "Running: mvn -Dspring-boot.run.profiles=dev spring-boot:run" -ForegroundColor Green
& mvn -Dspring-boot.run.profiles=dev spring-boot:run

Pop-Location
