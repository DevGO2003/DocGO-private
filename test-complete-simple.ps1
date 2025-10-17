# Complete test: Upload file and get one document
Write-Host "=== DOCGO UPLOAD & GET ONE TEST ===" -ForegroundColor Green

# Test 1: Upload file directly to file-management-service
Write-Host "1. Testing upload directly to file-management-service..." -ForegroundColor Yellow
$filePath = "test-upload.txt"
$uploadUri = "http://localhost:8002/api/v1/file-management-service/files"

try {
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test-upload.txt`"",
        "Content-Type: text/plain",
        "",
        [System.Text.Encoding]::UTF8.GetString($fileBytes),
        "--$boundary",
        "Content-Disposition: form-data; name=`"userId`"",
        "",
        "test-user-complete",
        "--$boundary--",
        ""
    ) -join $LF
    
    $uploadResponse = Invoke-WebRequest -Uri $uploadUri -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "Upload Status: $($uploadResponse.StatusCode)" -ForegroundColor Green
    $uploadData = $uploadResponse.Content | ConvertFrom-Json
    $fileId = $uploadData.data.fileId
    Write-Host "File ID: $fileId" -ForegroundColor Cyan
    
    # Test 2: Get one document
    Write-Host "2. Testing get one document..." -ForegroundColor Yellow
    $getUri = "http://localhost:8002/api/v1/file-management-service/files/$fileId"
    $getResponse = Invoke-WebRequest -Uri $getUri -Method GET
    
    Write-Host "Get Status: $($getResponse.StatusCode)" -ForegroundColor Green
    $getData = $getResponse.Content | ConvertFrom-Json
    Write-Host "Document Title: $($getData.data.overview.title)" -ForegroundColor Cyan
    Write-Host "Owner: $($getData.data.overview.ownerUserId)" -ForegroundColor Cyan
    
    # Test 3: Get one document via API Gateway
    Write-Host "3. Testing get one document via API Gateway..." -ForegroundColor Yellow
    $gatewayGetUri = "http://localhost:8000/api/v1/file-management-service/files/$fileId"
    $gatewayGetResponse = Invoke-WebRequest -Uri $gatewayGetUri -Method GET
    
    Write-Host "Gateway Get Status: $($gatewayGetResponse.StatusCode)" -ForegroundColor Green
    $gatewayGetData = $gatewayGetResponse.Content | ConvertFrom-Json
    Write-Host "Gateway Document Title: $($gatewayGetData.data.overview.title)" -ForegroundColor Cyan
    
    Write-Host "=== ALL TESTS PASSED! ===" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody" -ForegroundColor Red
    }
}
