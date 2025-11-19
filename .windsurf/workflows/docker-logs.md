---
description: 
auto_execution_mode: 3
---

# Docker Logs với Auto-Debug

Xem logs Docker cho toàn bộ services hoặc theo từng service trong môi trường development (kiến trúc 5 services) với chức năng auto-debug.

## Hành vi mặc định
- Không truyền tham số: tự động hiển thị logs của TẤT CẢ services hiện có trong `docker-compose.yml` (không follow).
- Có truyền tên service: theo dõi liên tục (follow) logs của service đó với độ trễ theo dõi tối đa 20 giây.
- **AUTO-DEBUG**: Nếu service không start thành công, tự động chuyển sang chế độ sửa lỗi (xem trạng thái, hiển thị lỗi gần nhất) cho tới khi service lên thành công.

## Services kiến trúc mới (5 services)
- `web-app` (Next.js) - Port 3000
- `api-gateway` (Next.js) - Port 8000
- `user-management-service` (Spring Boot) - Port 8001
- `repository-management-service` (Spring Boot) - Port 8002 (renamed from file-management-service)
- `automation-service` (FastAPI) - Port 8003

## Lệnh thực thi (PowerShell)

### 1. Xem logs tất cả services (không follow):
```powershell
docker-compose logs
```

### 2. Follow logs service cụ thể:
```powershell
docker-compose logs -f <service-name>
```

### 3. Auto-Debug Mode (Tự động sửa lỗi):
```powershell
# Chạy auto-debug cho tất cả services
docker-compose logs --follow --tail=50 | ForEach-Object {
    if ($_ -match "ERROR|FAILED|Exception") {
        Write-Host "🔴 Lỗi phát hiện: $_" -ForegroundColor Red
        Write-Host "🛠️  Đang kiểm tra trạng thái services..." -ForegroundColor Yellow
        
        # Kiểm tra trạng thái tất cả services
        docker-compose ps
        
        # Hiển thị lỗi chi tiết của service bị lỗi
        $errorService = ($_ -split '\s+')[0]
        if ($errorService) {
            Write-Host "📋 Logs chi tiết của $errorService :" -ForegroundColor Cyan
            docker-compose logs --tail=20 $errorService
        }
        
        Write-Host "🔄 Đang restart service..." -ForegroundColor Green
        docker-compose restart $errorService
        
        Write-Host "⏳ Chờ 10 giây để service khởi động..." -ForegroundColor Yellow
        Start-Sleep 10
        
        Write-Host "✅ Kiểm tra lại trạng thái:" -ForegroundColor Green
        docker-compose ps $errorService
    }
}
```

### 4. Debug Service Cụ Thể:
```powershell
# Debug repository-management-service (thường bị lỗi build)
docker-compose logs -f repository-management-service | ForEach-Object {
    if ($_ -match "ERROR|FAILED|Exception|BUILD FAILED") {
        Write-Host "🔴 Build Error: $_" -ForegroundColor Red
        
        # Kiểm tra lỗi Maven
        if ($_ -match "mvn.*failed|BUILD FAILED") {
            Write-Host "🛠️  Maven build failed. Checking Java compilation errors..." -ForegroundColor Yellow
            
            # Xem logs chi tiết build
            docker-compose logs --tail=50 repository-management-service | Select-String "ERROR|error:"
            
            Write-Host "💡 Gợi ý sửa lỗi:" -ForegroundColor Cyan
            Write-Host "1. Kiểm tra import statements trong Java files" -ForegroundColor White
            Write-Host "2. Đảm bảo package names đúng (file_service vs repository_service)" -ForegroundColor White
            Write-Host "3. Kiểm tra dependencies trong pom.xml" -ForegroundColor White
        }
        
        # Restart service
        Write-Host "🔄 Restarting repository-management-service..." -ForegroundColor Green
        docker-compose restart repository-management-service
    }
}
```

### 5. Health Check All Services:
```powershell
# Kiểm tra health của tất cả services
Write-Host "🏥 Health Check - Tất cả services:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n🔍 Chi tiết services có vấn đề:" -ForegroundColor Yellow
docker-compose ps | Where-Object { $_ -match "Exit|unhealthy|restarting" }

Write-Host "`n📊 Resource Usage:" -ForegroundColor Green
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### 6. Quick Fix Commands:
```powershell
# Nếu repository-management-service bị lỗi build
Write-Host "🔧 Quick Fix cho repository-management-service:" -ForegroundColor Cyan

# 1. Stop service
docker-compose stop repository-management-service

# 2. Rebuild với no-cache
docker-compose build --no-cache repository-management-service

# 3. Start lại
docker-compose up -d repository-management-service

# 4. Kiểm tra logs
docker-compose logs -f repository-management-service
```

## Troubleshooting Common Issues

### 1. Repository Management Service Build Errors
- **Lỗi**: `cannot find symbol: class RestResponse`
- **Nguyên nhân**: Import sai package (repository_service thay vì file_service)
- **Giải pháp**: Sửa import statements trong controller files

### 2. Port Conflicts
- **Lỗi**: `Port already in use`
- **Giải pháp**: `docker-compose down` rồi `docker-compose up`

### 3. Volume Mount Issues
- **Lỗi**: `Permission denied` hoặc `No such file`
- **Giải pháp**: Kiểm tra quyền folder và volume paths trong docker-compose.yml

### 4. Network Issues
- **Lỗi**: Services không kết nối được với nhau
- **Giải pháp**: Kiểm tra network configuration và service names

## Auto-Recovery Script
```powershell
# Script tự động sửa lỗi và restart
function Start-DocGOServices {
    Write-Host "🚀 Starting DocGO Services with Auto-Recovery..." -ForegroundColor Green
    
    # Start services
    docker-compose up -d
    
    # Wait for services to start
    Start-Sleep 15
    
    # Check health
    $unhealthy = docker-compose ps | Where-Object { $_ -match "Exit|unhealthy" }
    
    if ($unhealthy) {
        Write-Host "⚠️  Một số services chưa healthy. Đang sửa lỗi..." -ForegroundColor Yellow
        
        # Restart unhealthy services
        docker-compose restart
        
        # Wait and check again
        Start-Sleep 10
        docker-compose ps
    } else {
        Write-Host "✅ Tất cả services đã khởi động thành công!" -ForegroundColor Green
    }
}

# Chạy auto-recovery
Start-DocGOServices
```
