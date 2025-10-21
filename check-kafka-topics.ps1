Write-Host "=== Checking Kafka Consumer Topics ===" -ForegroundColor Cyan

docker-compose logs repository-management-service 2>&1 | Select-String -Pattern "topic|Subscribed|partition" -Context 1 | Select-Object -First 50
