Write-Host "=== REBUILDING AUTOMATION SERVICE ===" -ForegroundColor Cyan
docker-compose build automation-service

Write-Host "`n=== STARTING SERVICES ===" -ForegroundColor Cyan
docker-compose up -d automation-service repository-management-service

Write-Host "`n=== WAITING FOR SERVICES TO START ===" -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`n=== UPLOADING TEST FILE ===" -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File test-upload-hop-dong-day-du.ps1

Write-Host "`n=== WAITING FOR KAFKA PROCESSING ===" -ForegroundColor Yellow
Start-Sleep -Seconds 40

Write-Host "`n=== DONE! Check logs or API response ===" -ForegroundColor Green
