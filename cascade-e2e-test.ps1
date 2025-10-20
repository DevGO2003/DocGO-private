# End-to-End test for the complete file upload and retrieval flow.
# 1. Uploads a file to the Automation Service.
# 2. Waits for Kafka events to be processed.
# 3. Retrieves the final, structured data from the Repository Management Service.

$filePath = "hop-dong-day-du.txt"
$automationUrl = "http://localhost:8003/api/v1/automation-service/files"

Write-Host "STEP 1: Uploading '$filePath' to Automation Service..." -ForegroundColor Green

# Use curl.exe for a reliable multipart/form-data request.
# The -F flag correctly formats the file and metadata fields.
$metadataJson = '{"ownerUserId":"test-user","language":"vi","region":"VN"}'
$uploadResponseJson = curl.exe -s -X POST $automationUrl -F "file=@$filePath" -F "metadata=$metadataJson"

# Parse the JSON response string from curl.exe
$uploadResponse = $uploadResponseJson | ConvertFrom-Json

Write-Host "Upload Response from Automation Service:"
Write-Host ($uploadResponse | ConvertTo-Json -Depth 5)

# Extract fileId from the response data
$fileId = $uploadResponse.data.documentId
if (-not $fileId) {
    $fileId = $uploadResponse.data.fileId # Fallback for older response format
}

if (-not $fileId) {
    Write-Host "FATAL: Could not get fileId from upload response. Aborting test." -ForegroundColor Red
    return
}

Write-Host "Successfully uploaded. File ID: $fileId" -ForegroundColor Cyan

Write-Host "`nSTEP 2: Waiting 10 seconds for Kafka event processing..." -ForegroundColor Green
Start-Sleep -Seconds 10

Write-Host "`nSTEP 3: Retrieving final processed data from Repository Management Service..." -ForegroundColor Green
$repositoryUrl = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Write-Host "GET URL: $repositoryUrl"

try {
    $finalResponse = Invoke-RestMethod -Uri $repositoryUrl -Method Get
    Write-Host "`n=== FINAL RESPONSE FROM REPOSITORY SERVICE ===" -ForegroundColor Yellow
    Write-Host ($finalResponse | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "`nERROR retrieving file from Repository Service: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== RECENT REPOSITORY MANAGEMENT SERVICE LOGS ===" -ForegroundColor Yellow
docker logs repository-management-service --tail 30

