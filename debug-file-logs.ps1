$fileId = "70a28a6e"

Write-Host "=== CHECKING LOGS FOR FILE: $fileId ===" -ForegroundColor Cyan

Write-Host "`n1. All logs mentioning file:" -ForegroundColor Yellow
docker-compose logs automation-service --since 10m 2>&1 | Where-Object { $_ -match $fileId }

Write-Host "`n2. Contract summary preparation:" -ForegroundColor Yellow
docker-compose logs automation-service --since 10m 2>&1 | Where-Object { $_ -match "Preparing publish.*contract.summary.generated" } | Select-Object -Last 3

Write-Host "`n3. Any errors/warnings:" -ForegroundColor Yellow
docker-compose logs automation-service --since 10m 2>&1 | Where-Object { $_ -match "ERROR|WARNING|Failed" } | Select-Object -Last 10
