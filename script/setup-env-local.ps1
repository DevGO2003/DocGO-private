# Script tự động tạo env.local cho tất cả microservices
# Chạy script này để copy env_exmaple.txt thành env.local

Write-Host "🚀 Bắt đầu setup env.local cho tất cả microservices..." -ForegroundColor Green

# Danh sách các microservices
$services = @(
    "ai-processing-service",
    "contract-management-service", 
    "general-file-management-service",
    "user-management-service",
    "api-gateway-bff",
    "file-storage-asset-service",
    "authentication-identity-service"
)

$backendPath = "backend"
$successCount = 0
$errorCount = 0

foreach ($service in $services) {
    $servicePath = Join-Path $backendPath $service
    $envPath = Join-Path $servicePath "env"
    $envExamplePath = Join-Path $envPath ".env.example"
    $envLocalPath = Join-Path $envPath ".env.local"
    
    if (Test-Path $envExamplePath) {
        try {
            # Copy .env.example thành .env.local
            Copy-Item -Path $envExamplePath -Destination $envLocalPath -Force
            Write-Host "✅ Đã tạo .env.local cho $service" -ForegroundColor Green
            $successCount++
        }
        catch {
            Write-Host "❌ Lỗi khi tạo env.local cho $service : $($_.Exception.Message)" -ForegroundColor Red
            $errorCount++
        }
    }
    else {
        Write-Host "⚠️ Không tìm thấy .env.example trong $service" -ForegroundColor Yellow
    }
}

Write-Host "`n📊 Kết quả setup:" -ForegroundColor Cyan
Write-Host "✅ Thành công: $successCount services" -ForegroundColor Green
Write-Host "❌ Lỗi: $errorCount services" -ForegroundColor Red

if ($successCount -gt 0) {
    Write-Host "`n🎉 Setup hoàn tất! Bây giờ bạn có thể:" -ForegroundColor Green
    Write-Host "1. Chỉnh sửa env.local của từng service theo nhu cầu" -ForegroundColor White
    Write-Host "2. Sử dụng env_file trong docker-compose.local.yml" -ForegroundColor White
    Write-Host "3. Không cần sửa trực tiếp docker-compose.local.yml" -ForegroundColor White
}

Write-Host "`n📚 Xem hướng dẫn chi tiết tại: .cursor/rules/environment-git-standards.mdc" -ForegroundColor Cyan




