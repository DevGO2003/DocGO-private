# Test Event Flow
Write-Host "======== DocGO Event Flow Test ========" -ForegroundColor Green

$fileToUpload = "test-upload-file.txt"
$automationUrl = "http://localhost:8003/api/v1/automation-service/files"
$repositoryUrl = "http://localhost:8002/api/v1/repository-management-service/files"

# Step 1: Upload file using curl via docker
Write-Host "`nStep 1: Uploading file..." -ForegroundColor Cyan
try {
    # Use docker exec to run curl inside automation-service container
    $uploadCmd = "docker exec automation-service curl -X POST -F `"file=@/app/test-upload-file.txt`" http://localhost:8003/api/v1/automation-service/files 2>/dev/null"
    $uploadResult = Invoke-Expression $uploadCmd
    
    if ($uploadResult -match '"documentId":"([^"]*)"') {
        $fileId = $matches[1]
        Write-Host "Upload Status: SUCCESS" -ForegroundColor Green
        Write-Host "File ID: $fileId" -ForegroundColor Green
        Write-Host "`nUpload Response:" -ForegroundColor Yellow
        Write-Host $uploadResult.Substring(0, [Math]::Min(500, $uploadResult.Length)) -ForegroundColor White
    } else {
        Write-Host "Upload FAILED: No documentId in response" -ForegroundColor Red
        Write-Host "Response: $uploadResult" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Upload FAILED: $_" -ForegroundColor Red
    exit 1
}

# Step 2: Wait for Kafka events
Write-Host "`nStep 2: Waiting 5 seconds for event processing..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# Step 3: Get file from repository
Write-Host "`nStep 3: Fetching file from repository-management-service..." -ForegroundColor Cyan
try {
    $getResp = Invoke-RestMethod -Uri "$repositoryUrl/$fileId" -Method GET -TimeoutSec 30
    Write-Host "Fetch Status: SUCCESS" -ForegroundColor Green
    Write-Host "`nFile Details:" -ForegroundColor Yellow
    Write-Host ($getResp | ConvertTo-Json -Depth 3).Substring(0, [Math]::Min(500, ($getResp | ConvertTo-Json -Depth 3).Length)) -ForegroundColor White
    Write-Host "`n✓ EVENT FLOW WORKS!" -ForegroundColor Green
}
catch {
    Write-Host "Fetch FAILED: $_" -ForegroundColor Red
    Write-Host "This means events were not consumed properly" -ForegroundColor Yellow
}

Write-Host "`n======== Test Complete ========" -ForegroundColor Green