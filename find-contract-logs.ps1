Write-Host "Searching for contract processing logs..." -ForegroundColor Cyan

docker-compose logs repository-management-service 2>&1 | Select-String -Pattern "a0d0432c" -Context 3 | Out-String
