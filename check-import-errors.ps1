Write-Host "=== CHECKING IMPORT ERRORS ===" -ForegroundColor Cyan

docker-compose logs automation-service --tail 30 2>&1 | Where-Object { $_ -match "ERROR|ImportError|ModuleNotFoundError|started|Application startup" }

Write-Host "`n=== SERVICE STATUS ===" -ForegroundColor Green
docker-compose ps automation-service
