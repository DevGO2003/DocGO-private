Write-Host "DocGO Event Flow Test" -ForegroundColor Green

# Upload file
Write-Host "Uploading file..." -ForegroundColor Cyan
$uploadResult = docker exec automation-service curl -X POST -F "file=@/app/test-upload-file.txt" http://localhost:8003/api/v1/automation-service/files

if ($uploadResult -match '"documentId":"([^"]*)"') {
    $fileId = $matches[1]
    Write-Host "Upload SUCCESS - File ID: $fileId" -ForegroundColor Green
    
    # Wait
    Write-Host "Waiting 5 seconds..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    # Get file
    Write-Host "Fetching from repository..." -ForegroundColor Cyan
    try {
        $getResult = Invoke-RestMethod -Uri "http://localhost:8002/api/v1/repository-management-service/files/$fileId" -Method GET
        Write-Host "Fetch SUCCESS!" -ForegroundColor Green
        Write-Host "File found in repository - Events processed correctly!" -ForegroundColor Green
    }
    catch {
        Write-Host "Fetch FAILED: $_" -ForegroundColor Red
        Write-Host "Events were not consumed properly" -ForegroundColor Yellow
    }
} else {
    Write-Host "Upload FAILED" -ForegroundColor Red
    Write-Host $uploadResult -ForegroundColor Red
}

Write-Host "Test Complete" -ForegroundColor Green
