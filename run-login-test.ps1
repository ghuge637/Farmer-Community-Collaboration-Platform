param(
  [string]$Email = "test@example.com",
  [string]$Password = "pass123",
  [string]$BaseUrl = "http://localhost:8080"
)

$ErrorActionPreference = 'Stop'
Write-Host "Logging in to $BaseUrl with $Email" -ForegroundColor Cyan

$body = @{ email = $Email; password = $Password } | ConvertTo-Json
try {
  $res = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" -Method Post -Body $body -ContentType 'application/json' -ErrorAction Stop
  Write-Host "Login successful. Token received:" -ForegroundColor Green
  Write-Host $res.token

  Write-Host "Calling /api/auth/me with token..." -ForegroundColor Cyan
  $headers = @{ Authorization = "Bearer $($res.token)" }
  $me = Invoke-RestMethod -Uri "$BaseUrl/api/auth/me" -Method Get -Headers $headers -ErrorAction Stop
  Write-Host "User info:" -ForegroundColor Green
  $me | Format-List
} catch {
  Write-Host "Request failed:" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Red
  if ($_.Exception.Response) {
    try { $text = $_.Exception.Response.GetResponseStream() | % { $_ } | Out-String; Write-Host $text } catch {}
  }
  exit 1
}
