Write-Host "=== Finding Update Logs ===" -ForegroundColor Cyan

docker-compose logs repository-management-service 2>&1 | Select-String -Pattern "86ecf255|Updated contract|Updated content|Built contract" -Context 2 | Out-String
