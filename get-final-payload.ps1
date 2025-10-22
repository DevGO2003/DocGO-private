$fileId = "db7b6c28-b759-4086-948c-167dad3d08c2"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Write-Host "Fetching payload from Repository Service..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri $uri -Method Get

Write-Host "Saving to final-event-payload.json..." -ForegroundColor Yellow
$response | ConvertTo-Json -Depth 20 | Out-File "final-event-payload.json" -Encoding UTF8

Write-Host "✅ Done! File saved." -ForegroundColor Green
