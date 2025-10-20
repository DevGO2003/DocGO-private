# Test upload hop-dong-day-du.txt and get one
$filePath = "hop-dong-day-du.txt"
$url = "http://localhost:8003/api/v1/automation-service/files"

Write-Host "Testing upload hop-dong-day-du.txt to automation-service..."
Write-Host "File: $filePath"
Write-Host "URL: $url"

# Upload file
$response = Invoke-RestMethod -Uri $url -Method Post -InFile $filePath -ContentType "text/plain"
Write-Host "Upload response:"
$response | ConvertTo-Json -Depth 3

# Wait for processing
Start-Sleep -Seconds 5

# Get the file ID from response
$fileId = $response.data.fileId
Write-Host "File ID: $fileId"

# Test get one API
Write-Host "Testing GET ONE API..."
$getUrl = "http://localhost:8003/api/v1/automation-service/files/" + $fileId
Write-Host "GET URL: $getUrl"

try {
    $getResponse = Invoke-RestMethod -Uri $getUrl -Method Get
    Write-Host "GET ONE response:"
    $getResponse | ConvertTo-Json -Depth 3
} catch {
    Write-Host "GET ONE error: $($_.Exception.Message)"
}

# Check logs
Write-Host "`n=== AUTOMATION SERVICE LOGS ==="
docker-compose logs --tail=10 automation-service

Write-Host "`n=== REPOSITORY MANAGEMENT SERVICE LOGS ==="
docker-compose logs --tail=10 repository-management-service
