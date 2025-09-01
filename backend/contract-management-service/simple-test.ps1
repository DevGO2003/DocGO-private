# Simple PowerShell script để test API
Write-Host "=== BẮT ĐẦU TEST API ===" -ForegroundColor Green

# Test 1: Kiểm tra ứng dụng
Write-Host "`n=== TEST 1: Kiểm tra ứng dụng ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/actuator/health" -Method GET
    Write-Host "✅ Ứng dụng đang chạy: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Ứng dụng không phản hồi" -ForegroundColor Red
    exit 1
}

# Test 2: Tạo dữ liệu test
Write-Host "`n=== TEST 2: Tạo dữ liệu test ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/test/generate-data" -Method POST
    Write-Host "✅ Tạo dữ liệu thành công: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Lỗi tạo dữ liệu" -ForegroundColor Red
}

# Test 3: Test getAll API
Write-Host "`n=== TEST 3: Test getAll API ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/contracts" -Method GET
    Write-Host "✅ GetAll thành công!" -ForegroundColor Green
    Write-Host "Tổng số hợp đồng: $($response.data.resultInfo.totalElements)" -ForegroundColor Yellow
    
    Write-Host "`nDanh sách hợp đồng:" -ForegroundColor Cyan
    foreach ($contract in $response.data.content) {
        Write-Host "- $($contract.contractNumber): $($contract.title) ($($contract.status))" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Lỗi getAll" -ForegroundColor Red
}

Write-Host "`n=== HOÀN THÀNH TEST ===" -ForegroundColor Green

