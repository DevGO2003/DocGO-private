# Test File Upload Script - Upload file thực tế và kiểm tra database
Write-Host "Testing File Upload and Database Storage..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Step 1: Create a test file
Write-Host "`nStep 1: Creating test file..." -ForegroundColor Yellow
$testContent = @"
HOP DONG CUNG CAP DICH VU PHAN MEM

Dieu 1: Noi dung hop tac
Cac ben thoa thuan ve viec cung cap va su dung dich vu phat trien phan mem quan ly nha thuoc.

Dieu 2: Thoi han hop dong
Hop dong co hieu luc tu ngay 01/01/2024 va keo dai 6 nam, tu dong gia han cac nam tiep theo.

Dieu 3: Gia tri hop dong
Tong gia tri: 4.000.000 VND (phi khoi tao mot lan) + 500.000 VND (phat sinh)

Dieu 4: Phuong thuc thanh toan
Thanh toan 100% gia tri hop dong sau khi ky bien ban nghiem thu bang chuyen khoan ngan hang.
"@

$testFilePath = "test-contract.txt"
$testContent | Out-File -FilePath $testFilePath -Encoding UTF8
Write-Host "Test file created: $testFilePath" -ForegroundColor Green

# Step 2: Test File Storage Service - Upload file
Write-Host "`nStep 2: Testing File Storage Service..." -ForegroundColor Yellow
try {
    $fileBytes = [System.IO.File]::ReadAllBytes($testFilePath)
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$testFilePath`"",
        "Content-Type: text/plain",
        "",
        [System.Text.Encoding]::UTF8.GetString($fileBytes),
        "--$boundary--"
    ) -join $LF
    
    $response = Invoke-WebRequest -Uri "http://localhost:8012/api/v1/file-storage-service/upload" -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 30 -UseBasicParsing
    Write-Host "File Upload API: $($response.StatusCode)" -ForegroundColor Green
    $uploadResult = $response.Content | ConvertFrom-Json
    Write-Host "File ID: $($uploadResult.data.fileId)" -ForegroundColor White
    Write-Host "File Name: $($uploadResult.data.filename)" -ForegroundColor White
} catch {
    Write-Host "File Upload API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Test AI Processing Service - Extract content
Write-Host "`nStep 3: Testing AI Processing - Extract..." -ForegroundColor Yellow
try {
    $fileBytes = [System.IO.File]::ReadAllBytes($testFilePath)
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$testFilePath`"",
        "Content-Type: text/plain",
        "",
        [System.Text.Encoding]::UTF8.GetString($fileBytes),
        "--$boundary--"
    ) -join $LF
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/extract" -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary" -TimeoutSec 30 -UseBasicParsing
    Write-Host "Extract API: $($response.StatusCode)" -ForegroundColor Green
    $extractResult = $response.Content | ConvertFrom-Json
    Write-Host "Extracted Content Length: $($extractResult.data.Length)" -ForegroundColor White
} catch {
    Write-Host "Extract API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Test AI Processing Service - Classify
Write-Host "`nStep 4: Testing AI Processing - Classify..." -ForegroundColor Yellow
try {
    $body = @{
        text = $testContent
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/classify" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30 -UseBasicParsing
    Write-Host "Classify API: $($response.StatusCode)" -ForegroundColor Green
    $classifyResult = $response.Content | ConvertFrom-Json
    Write-Host "Document Type: $($classifyResult.data.documentType)" -ForegroundColor White
    Write-Host "Is Contract: $($classifyResult.data.isContract)" -ForegroundColor White
    Write-Host "Confidence: $($classifyResult.data.confidence)" -ForegroundColor White
} catch {
    Write-Host "Classify API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test AI Processing Service - Summarize
Write-Host "`nStep 5: Testing AI Processing - Summarize..." -ForegroundColor Yellow
try {
    $body = @{
        text = $testContent
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/summarize" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60 -UseBasicParsing
    Write-Host "Summarize API: $($response.StatusCode)" -ForegroundColor Green
    $summarizeResult = $response.Content | ConvertFrom-Json
    Write-Host "Summary Title: $($summarizeResult.data.title)" -ForegroundColor White
    Write-Host "Summary Object: $($summarizeResult.data.object)" -ForegroundColor White
    Write-Host "Effective Date: $($summarizeResult.data.effectiveDate)" -ForegroundColor White
    Write-Host "Term: $($summarizeResult.data.term)" -ForegroundColor White
} catch {
    Write-Host "Summarize API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 6: Check Contract Management Service - Get Contracts
Write-Host "`nStep 6: Checking Contract Management Service..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/api/v1/contract-management-service/contracts" -UseBasicParsing
    Write-Host "Get Contracts API: $($response.StatusCode)" -ForegroundColor Green
    $contractsResult = $response.Content | ConvertFrom-Json
    Write-Host "Total Contracts: $($contractsResult.data.Count)" -ForegroundColor White
    
    if ($contractsResult.data.Count -gt 0) {
        Write-Host "Latest Contract:" -ForegroundColor Cyan
        $latestContract = $contractsResult.data[0]
        Write-Host "  ID: $($latestContract.id)" -ForegroundColor White
        Write-Host "  Title: $($latestContract.title)" -ForegroundColor White
        Write-Host "  Status: $($latestContract.status)" -ForegroundColor White
        Write-Host "  AI Processed: $($latestContract.aiProcessed)" -ForegroundColor White
        Write-Host "  Processing Status: $($latestContract.processingStatus)" -ForegroundColor White
    }
} catch {
    Write-Host "Get Contracts API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Cleanup
Write-Host "`nCleaning up..." -ForegroundColor Yellow
if (Test-Path $testFilePath) {
    Remove-Item $testFilePath
    Write-Host "Test file removed" -ForegroundColor Green
}

Write-Host "`nFile Upload Flow Testing completed!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
