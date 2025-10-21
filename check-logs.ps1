$fileId = "70a28a6e-6af2-44bb-a969-edbb03a54621"

Write-Host "=== AUTOMATION SERVICE LOGS ===" -ForegroundColor Cyan
docker-compose logs automation-service 2>&1 | Select-String $fileId | Out-String

Write-Host "`n=== REPOSITORY SERVICE LOGS ===" -ForegroundColor Cyan
docker-compose logs repository-management-service 2>&1 | Select-String $fileId | Out-String

Write-Host "`n=== KAFKA PUBLISH LOGS ===" -ForegroundColor Cyan
docker-compose logs automation-service 2>&1 | Select-String "Published.*contract.summary.generated" -Context 2 | Select-Object -Last 5 | Out-String
