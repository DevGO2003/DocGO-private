# PowerShell script để test API
Write-Host "=== BẮT ĐẦU TEST API ===" -ForegroundColor Green

# Đợi ứng dụng khởi động
Write-Host "Đợi ứng dụng khởi động..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Test 1: Kiểm tra ứng dụng có đang chạy không
Write-Host "`n=== TEST 1: Kiểm tra ứng dụng ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/actuator/health" -Method GET
    Write-Host "✅ Ứng dụng đang chạy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Ứng dụng không phản hồi: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Tạo dữ liệu test
Write-Host "`n=== TEST 2: Tạo dữ liệu test ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/test/generate-data" -Method POST
    Write-Host "✅ Tạo dữ liệu thành công: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Lỗi tạo dữ liệu: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tiếp tục test các phần khác..." -ForegroundColor Yellow
}

# Test 3: Test getAll API
Write-Host "`n=== TEST 3: Test getAll API ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/contracts" -Method GET
    Write-Host "✅ GetAll thành công!" -ForegroundColor Green
    Write-Host "Tổng số hợp đồng: $($response.data.resultInfo.totalElements)" -ForegroundColor Yellow
    Write-Host "Số hợp đồng trong trang: $($response.data.resultInfo.numberOfElements)" -ForegroundColor Yellow
    Write-Host "Trang hiện tại: $($response.data.resultInfo.page + 1)" -ForegroundColor Yellow
    Write-Host "Tổng số trang: $($response.data.resultInfo.totalPages)" -ForegroundColor Yellow
    
    Write-Host "`nDanh sách hợp đồng:" -ForegroundColor Cyan
    foreach ($contract in $response.data.content) {
        Write-Host "- $($contract.contractNumber): $($contract.title) ($($contract.status))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Lỗi getAll: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tiếp tục test các phần khác..." -ForegroundColor Yellow
}

# Test 4: Test getAll với pagination
Write-Host "`n=== TEST 4: Test getAll với pagination ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/contracts?pageNumber=0&pageSize=2" -Method GET
    Write-Host "✅ GetAll với pagination thành công!" -ForegroundColor Green
    Write-Host "Kích thước trang: $($response.data.resultInfo.size)" -ForegroundColor Yellow
    Write-Host "Số hợp đồng trong trang: $($response.data.resultInfo.numberOfElements)" -ForegroundColor Yellow
    
    Write-Host "`nDanh sách hợp đồng (trang 1):" -ForegroundColor Cyan
    foreach ($contract in $response.data.content) {
        Write-Host "- $($contract.contractNumber): $($contract.title)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Lỗi getAll với pagination: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tiếp tục test các phần khác..." -ForegroundColor Yellow
}

# Test 5: Test getAll với sorting
Write-Host "`n=== TEST 5: Test getAll với sorting ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/contracts?pageNumber=0&pageSize=5&sortBy=contractNumber&sortDirection=ASC" -Method GET
    Write-Host "✅ GetAll với sorting thành công!" -ForegroundColor Green
    
    Write-Host "`nDanh sách hợp đồng (sắp xếp theo contractNumber):" -ForegroundColor Cyan
    foreach ($contract in $response.data.content) {
        Write-Host "- $($contract.contractNumber): $($contract.title)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Lỗi getAll với sorting: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tiếp tục test các phần khác..." -ForegroundColor Yellow
}

# Test 6: Test thống kê dữ liệu
Write-Host "`n=== TEST 6: Test thống kê dữ liệu ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/test/stats" -Method GET
    Write-Host "✅ Thống kê thành công: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Lỗi thống kê: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Tiếp tục test các phần khác..." -ForegroundColor Yellow
}

Write-Host "`n=== HOÀN THÀNH TEST ===" -ForegroundColor Green
