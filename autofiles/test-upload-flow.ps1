# Test Upload Flow Script - Kiểm tra luồng upload file và lưu database
Write-Host "Testing Upload Flow and Database Storage..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Step 1: Test AI Processing Service - Classify
Write-Host "`nStep 1: Testing AI Processing - Classify..." -ForegroundColor Yellow
try {
    $body = @{
        text = "HOP DONG CUNG CAP DICH VU PHAN MEM. Dieu 1: Noi dung hop tac. Cac ben thoa thuan ve viec cung cap va su dung dich vu phat trien phan mem quan ly nha thuoc. Dieu 2: Thoi han hop dong. Hop dong co hieu luc tu ngay 01/01/2024 va keo dai 6 nam, tu dong gia han cac nam tiep theo."
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/classify" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30 -UseBasicParsing
    Write-Host "Classify API: $($response.StatusCode)" -ForegroundColor Green
    $classifyResult = $response.Content | ConvertFrom-Json
    Write-Host "Document Type: $($classifyResult.data.documentType)" -ForegroundColor White
    Write-Host "Is Contract: $($classifyResult.data.isContract)" -ForegroundColor White
} catch {
    Write-Host "Classify API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Test AI Processing Service - Summarize
Write-Host "`nStep 2: Testing AI Processing - Summarize..." -ForegroundColor Yellow
try {
    $body = @{
        text = "HOP DONG CUNG CAP DICH VU PHAN MEM. Dieu 1: Noi dung hop tac. Cac ben thoa thuan ve viec cung cap va su dung dich vu phat trien phan mem quan ly nha thuoc. Dieu 2: Thoi han hop dong. Hop dong co hieu luc tu ngay 01/01/2024 va keo dai 6 nam, tu dong gia han cac nam tiep theo. Dieu 3: Gia tri hop dong. Tong gia tri: 4.000.000 VND (phi khoi tao mot lan) + 500.000 VND (phat sinh). Dieu 4: Phuong thuc thanh toan. Thanh toan 100% gia tri hop dong sau khi ky bien ban nghiem thu bang chuyen khoan ngan hang."
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/summarize" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60 -UseBasicParsing
    Write-Host "Summarize API: $($response.StatusCode)" -ForegroundColor Green
    $summarizeResult = $response.Content | ConvertFrom-Json
    Write-Host "Summary Title: $($summarizeResult.data.title)" -ForegroundColor White
    Write-Host "Summary Object: $($summarizeResult.data.object)" -ForegroundColor White
} catch {
    Write-Host "Summarize API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Check Contract Management Service - Get Contracts
Write-Host "`nStep 3: Checking Contract Management Service..." -ForegroundColor Yellow
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
    }
} catch {
    Write-Host "Get Contracts API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 4: Check Database Connection
Write-Host "`nStep 4: Checking Database Connection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/api/v1/contract-management-service/contracts/1" -UseBasicParsing
    Write-Host "Get Contract by ID API: $($response.StatusCode)" -ForegroundColor Green
    $contractDetail = $response.Content | ConvertFrom-Json
    Write-Host "Contract Details:" -ForegroundColor Cyan
    Write-Host "  Contract Number: $($contractDetail.data.contractNumber)" -ForegroundColor White
    Write-Host "  Created At: $($contractDetail.data.createdAt)" -ForegroundColor White
    Write-Host "  Processing Status: $($contractDetail.data.processingStatus)" -ForegroundColor White
} catch {
    Write-Host "Get Contract by ID API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nUpload Flow Testing completed!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
