# Docker Development Script for DocGO
# Chạy tất cả microservices với volume mount

Write-Host "🚀 Khởi động DocGO Development Environment..." -ForegroundColor Green

# Kiểm tra Docker
try {
    docker --version | Out-Null
    Write-Host "✅ Docker đã được cài đặt" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker chưa được cài đặt hoặc không chạy" -ForegroundColor Red
    exit 1
}

# Dừng và xóa containers cũ
Write-Host "🛑 Dừng containers cũ..." -ForegroundColor Yellow
docker-compose -f autofiles/docker-compose.dev.yml down

# Xóa images cũ (tùy chọn)
$cleanImages = Read-Host "Bạn có muốn xóa images cũ không? (y/N)"
if ($cleanImages -eq "y" -or $cleanImages -eq "Y") {
    Write-Host "🗑️ Xóa images cũ..." -ForegroundColor Yellow
    docker system prune -f
}

# Build và khởi động services
Write-Host "🔨 Build và khởi động services..." -ForegroundColor Yellow

# Khởi động database services trước
Write-Host "📊 Khởi động database services..." -ForegroundColor Cyan
docker-compose -f autofiles/docker-compose.dev.yml up -d mysql mongodb redis elasticsearch

# Đợi database khởi động
Write-Host "⏳ Đợi database khởi động..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Khởi động tất cả microservices
Write-Host "🚀 Khởi động microservices..." -ForegroundColor Cyan
docker-compose -f autofiles/docker-compose.dev.yml up -d

# Kiểm tra trạng thái
Write-Host "📋 Kiểm tra trạng thái services..." -ForegroundColor Green
Start-Sleep -Seconds 5
docker-compose -f autofiles/docker-compose.dev.yml ps

Write-Host ""
Write-Host "🎉 DocGO Development Environment đã khởi động thành công!" -ForegroundColor Green
Write-Host ""
Write-Host "📚 API Documentation:" -ForegroundColor Cyan
Write-Host "  • API Gateway BFF: http://localhost:8000/docs" -ForegroundColor White
Write-Host "  • Authentication Service: http://localhost:8001/docs" -ForegroundColor White
Write-Host "  • User Management: http://localhost:8002/docs" -ForegroundColor White
Write-Host "  • Contract Management: http://localhost:8003/docs" -ForegroundColor White
Write-Host "  • Versioning Service: http://localhost:8004/docs" -ForegroundColor White
Write-Host "  • Commenting Service: http://localhost:8005/docs" -ForegroundColor White
Write-Host "  • Approval Workflow: http://localhost:8006/docs" -ForegroundColor White
Write-Host "  • Reminder Scheduler: http://localhost:8007/docs" -ForegroundColor White
Write-Host "  • E-Signature: http://localhost:8008/docs" -ForegroundColor White
Write-Host "  • Notification: http://localhost:8009/docs" -ForegroundColor White
Write-Host "  • Reporting Analytics: http://localhost:8010/docs" -ForegroundColor White
Write-Host "  • OCR Service: http://localhost:8011/docs" -ForegroundColor White
Write-Host "  • File Storage: http://localhost:8012/docs" -ForegroundColor White
Write-Host "  • Audit Log: http://localhost:8013/docs" -ForegroundColor White
Write-Host "  • Integration: http://localhost:8014/docs" -ForegroundColor White
Write-Host "  • Batch ETL: http://localhost:8015/docs" -ForegroundColor White
Write-Host "  • Health Monitoring: http://localhost:8016/docs" -ForegroundColor White
Write-Host "  • AI Processing: http://localhost:8017/docs" -ForegroundColor White
Write-Host "  • General File Management: http://localhost:8018/docs" -ForegroundColor White
Write-Host ""
Write-Host "🗄️ Database Services:" -ForegroundColor Cyan
Write-Host "  • MariaDB: localhost:3306" -ForegroundColor White
Write-Host "  • MongoDB: localhost:27017" -ForegroundColor White
Write-Host "  • Redis: localhost:6379" -ForegroundColor White
Write-Host "  • Elasticsearch: localhost:9200" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Lệnh hữu ích:" -ForegroundColor Cyan
Write-Host "  • Xem logs: docker-compose -f autofiles/docker-compose.dev.yml logs -f" -ForegroundColor White
Write-Host "  • Dừng services: docker-compose -f autofiles/docker-compose.dev.yml down" -ForegroundColor White
Write-Host "  • Restart service: docker-compose -f autofiles/docker-compose.dev.yml restart <service-name>" -ForegroundColor White
Write-Host ""

# Hỏi người dùng có muốn xem logs không
$showLogs = Read-Host "Bạn có muốn xem logs không? (y/N)"
if ($showLogs -eq "y" -or $showLogs -eq "Y") {
    Write-Host "📋 Hiển thị logs..." -ForegroundColor Yellow
    docker-compose -f autofiles/docker-compose.dev.yml logs -f
}
