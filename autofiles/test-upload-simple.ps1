# Test Upload Script for AI Processing Service
Write-Host "Testing File Upload and AI Processing..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Test classify API with text
Write-Host "`nTesting Classify API with text..." -ForegroundColor Yellow
try {
    $body = @{
        text = "HOP DONG CUNG CAP DICH VU PHAN MEM. Dieu 1: Noi dung hop tac. Cac ben thoa thuan ve viec cung cap va su dung dich vu phat trien phan mem quan ly nha thuoc. Dieu 2: Thoi han hop dong. Hop dong co hieu luc tu ngay 01/01/2024 va keo dai 6 nam, tu dong gia han cac nam tiep theo."
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/classify" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30 -UseBasicParsing
    Write-Host "Classify API: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Classify API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test summarize API with text
Write-Host "`nTesting Summarize API with text..." -ForegroundColor Yellow
try {
    $body = @{
        text = "HOP DONG CUNG CAP DICH VU PHAN MEM. Dieu 1: Noi dung hop tac. Cac ben thoa thuan ve viec cung cap va su dung dich vu phat trien phan mem quan ly nha thuoc. Dieu 2: Thoi han hop dong. Hop dong co hieu luc tu ngay 01/01/2024 va keo dai 6 nam, tu dong gia han cac nam tiep theo. Dieu 3: Gia tri hop dong. Tong gia tri: 4.000.000 VND (phi khoi tao mot lan) + 500.000 VND (phat sinh). Dieu 4: Phuong thuc thanh toan. Thanh toan 100% gia tri hop dong sau khi ky bien ban nghiem thu bang chuyen khoan ngan hang."
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/summarize" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60 -UseBasicParsing
    Write-Host "Summarize API: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Summarize API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nUpload and AI Processing Testing completed!" -ForegroundColor Green
