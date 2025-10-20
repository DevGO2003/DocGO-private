# Test upload file to automation-service
$filePath = "test-upload-file.txt"
$url = "http://localhost:8003/api/v1/automation-service/files"

Write-Host "Testing file upload to automation-service..."
Write-Host "File: $filePath"
Write-Host "URL: $url"

# Upload file
$response = Invoke-RestMethod -Uri $url -Method Post -InFile $filePath -ContentType "text/plain"
Write-Host "Upload response: $response"

# Wait a bit for processing
Start-Sleep -Seconds 5

# Check automation-service logs
Write-Host "`n=== AUTOMATION SERVICE LOGS ==="
docker-compose logs --tail=20 automation-service

# Check repository-management-service logs
Write-Host "`n=== REPOSITORY MANAGEMENT SERVICE LOGS ==="
docker-compose logs --tail=20 repository-management-service
