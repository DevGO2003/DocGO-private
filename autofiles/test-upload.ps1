# Test Upload Script for AI Processing Service
Write-Host "Testing File Upload and AI Processing..." -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green

# Test classify API with text
Write-Host "`nTesting Classify API with text..." -ForegroundColor Yellow
try {
    $body = @{
        text = "HỢP ĐỒNG CUNG CẤP DỊCH VỤ PHẦN MỀM

Điều 1: Nội dung hợp tác
Các bên thỏa thuận về việc cung cấp và sử dụng dịch vụ phát triển phần mềm quản lý nhà thuốc.

Điều 2: Thời hạn hợp đồng
Hợp đồng có hiệu lực từ ngày 01/01/2024 và kéo dài 6 năm, tự động gia hạn các năm tiếp theo.

Điều 3: Giá trị hợp đồng
Tổng giá trị: 4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)

Điều 4: Phương thức thanh toán
Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu bằng chuyển khoản ngân hàng."
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
        text = "HỢP ĐỒNG CUNG CẤP DỊCH VỤ PHẦN MỀM

Điều 1: Nội dung hợp tác
Các bên thỏa thuận về việc cung cấp và sử dụng dịch vụ phát triển phần mềm quản lý nhà thuốc.

Điều 2: Thời hạn hợp đồng
Hợp đồng có hiệu lực từ ngày 01/01/2024 và kéo dài 6 năm, tự động gia hạn các năm tiếp theo.

Điều 3: Giá trị hợp đồng
Tổng giá trị: 4.000.000 VND (phí khởi tạo một lần) + 500.000 VND (phát sinh)

Điều 4: Phương thức thanh toán
Thanh toán 100% giá trị hợp đồng sau khi ký biên bản nghiệm thu bằng chuyển khoản ngân hàng."
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/summarize" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 60 -UseBasicParsing
    Write-Host "Summarize API: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Summarize API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nUpload and AI Processing Testing completed!" -ForegroundColor Green
