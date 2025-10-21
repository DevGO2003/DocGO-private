Write-Host "=== REPOSITORY SERVICE - CONTRACT EVENT PROCESSING ===" -ForegroundColor Cyan

docker-compose logs repository-management-service --since 5m 2>&1 | Where-Object { $_ -match "9589f945" }

Write-Host "`n=== KAFKA CONSUMER STATUS ===" -ForegroundColor Yellow
docker-compose logs repository-management-service --since 5m 2>&1 | Where-Object { $_ -match "contract" } | Select-Object -Last 10
