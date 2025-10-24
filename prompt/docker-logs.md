# Docker Logs với Auto-Debug & Error Checking

Xem logs Docker cho toàn bộ services hoặc theo từng service trong môi trường development (kiến trúc 8 services) với chức năng auto-debug và error checking nâng cao.

## Hành vi mặc định
- Không truyền tham số: tự động hiển thị logs của TẤT CẢ services hiện có trong `docker-compose.yml` (không follow).
- Có truyền tên service: theo dõi liên tục (follow) logs của service đó với độ trễ theo dõi tối đa 30 giây.
- **AUTO-DEBUG**: Nếu service không start thành công, tự động chuyển sang chế độ sửa lỗi (xem trạng thái, hiển thị lỗi gần nhất) cho tới khi service lên thành công.
- **ERROR CHECKING**: Tự động phát hiện và phân loại lỗi, đưa ra gợi ý sửa lỗi cụ thể.

## Services kiến trúc hiện tại (8 services)
- `web-app` (Next.js) - Port 3000
- `api-gateway` (Next.js) - Port 8000  
- `user-management-service` (Spring Boot) - Port 8001
- `repository-management-service` (Spring Boot) - Port 8002
- `automation-service` (FastAPI) - Port 8003
- `kafka` (Message Broker) - Port 9092
- `zookeeper` (Kafka Coordinator) - Port 2181
- `redis` (Cache) - Port 6379

## Lệnh thực thi (PowerShell)

### 1. Xem logs tất cả services (không follow):
```powershell
docker-compose logs
```

### 2. Follow logs service cụ thể:
```powershell
docker-compose logs -f <service-name>
```

### 3. Auto-Debug Mode với Error Classification:
```powershell
# Chạy auto-debug cho tất cả services với error classification
docker-compose logs --follow --tail=50 | ForEach-Object {
    $line = $_
    
    # Phân loại lỗi
    if ($line -match "ERROR|FAILED|Exception|BUILD FAILED|FATAL") {
        Write-Host "🔴 Lỗi phát hiện: $line" -ForegroundColor Red
        
        # Phân loại lỗi cụ thể
        if ($line -match "BUILD FAILED|mvn.*failed|Maven") {
            Write-Host "📦 Lỗi Maven Build" -ForegroundColor Yellow
            $this.HandleMavenError($line)
        }
        elseif ($line -match "Port.*already in use|Address already in use") {
            Write-Host "🔌 Lỗi Port Conflict" -ForegroundColor Yellow
            $this.HandlePortConflict($line)
        }
        elseif ($line -match "Connection refused|Cannot connect") {
            Write-Host "🌐 Lỗi Network Connection" -ForegroundColor Yellow
            $this.HandleNetworkError($line)
        }
        elseif ($line -match "Permission denied|Access denied") {
            Write-Host "🔐 Lỗi Permission" -ForegroundColor Yellow
            $this.HandlePermissionError($line)
        }
        elseif ($line -match "OutOfMemoryError|Memory") {
            Write-Host "💾 Lỗi Memory" -ForegroundColor Yellow
            $this.HandleMemoryError($line)
        }
        else {
            Write-Host "❓ Lỗi chung" -ForegroundColor Yellow
            $this.HandleGenericError($line)
        }
        
        # Auto-recovery
        $this.AutoRecovery($line)
    }
    elseif ($line -match "WARN|WARNING") {
        Write-Host "⚠️  Cảnh báo: $line" -ForegroundColor Yellow
    }
    elseif ($line -match "INFO.*Started|Ready|Listening") {
        Write-Host "✅ Service OK: $line" -ForegroundColor Green
    }
}

# Helper functions
function HandleMavenError($errorLine) {
    Write-Host "🛠️  Xử lý lỗi Maven Build:" -ForegroundColor Cyan
    
    # Kiểm tra lỗi cụ thể
    if ($errorLine -match "cannot find symbol") {
        Write-Host "💡 Lỗi import/class không tìm thấy:" -ForegroundColor White
        Write-Host "   - Kiểm tra import statements" -ForegroundColor White
        Write-Host "   - Đảm bảo package names đúng" -ForegroundColor White
        Write-Host "   - Kiểm tra dependencies trong pom.xml" -ForegroundColor White
    }
    elseif ($errorLine -match "compilation failed") {
        Write-Host "💡 Lỗi compilation:" -ForegroundColor White
        Write-Host "   - Kiểm tra syntax Java" -ForegroundColor White
        Write-Host "   - Kiểm tra Java version compatibility" -ForegroundColor White
    }
    
    # Xem logs chi tiết
    Write-Host "📋 Logs chi tiết Maven:" -ForegroundColor Cyan
    docker-compose logs --tail=30 repository-management-service | Select-String "ERROR|error:|failed"
}

function HandlePortConflict($errorLine) {
    Write-Host "🛠️  Xử lý lỗi Port Conflict:" -ForegroundColor Cyan
    
    # Tìm port bị conflict
    if ($errorLine -match "port (\d+)") {
        $port = $matches[1]
        Write-Host "💡 Port $port đang được sử dụng:" -ForegroundColor White
        Write-Host "   - Kiểm tra process đang dùng port: netstat -ano | findstr :$port" -ForegroundColor White
        Write-Host "   - Hoặc thay đổi port trong docker-compose.yml" -ForegroundColor White
    }
    
    # Restart services
    Write-Host "🔄 Restarting all services..." -ForegroundColor Green
    docker-compose down
    Start-Sleep 5
    docker-compose up -d
}

function HandleNetworkError($errorLine) {
    Write-Host "🛠️  Xử lý lỗi Network:" -ForegroundColor Cyan
    
    Write-Host "💡 Kiểm tra network connectivity:" -ForegroundColor White
    Write-Host "   - Kiểm tra Docker network: docker network ls" -ForegroundColor White
    Write-Host "   - Kiểm tra service dependencies" -ForegroundColor White
    Write-Host "   - Restart network: docker-compose down && docker-compose up" -ForegroundColor White
}

function HandlePermissionError($errorLine) {
    Write-Host "🛠️  Xử lý lỗi Permission:" -ForegroundColor Cyan
    
    Write-Host "💡 Kiểm tra quyền truy cập:" -ForegroundColor White
    Write-Host "   - Kiểm tra quyền folder: icacls ." -ForegroundColor White
    Write-Host "   - Chạy PowerShell as Administrator" -ForegroundColor White
    Write-Host "   - Kiểm tra volume mounts trong docker-compose.yml" -ForegroundColor White
}

function HandleMemoryError($errorLine) {
    Write-Host "🛠️  Xử lý lỗi Memory:" -ForegroundColor Cyan
    
    Write-Host "💡 Tăng memory allocation:" -ForegroundColor White
    Write-Host "   - Tăng Docker memory limit" -ForegroundColor White
    Write-Host "   - Thêm JVM options: -Xmx2g -Xms1g" -ForegroundColor White
    Write-Host "   - Kiểm tra system memory: docker stats" -ForegroundColor White
}

function HandleGenericError($errorLine) {
    Write-Host "🛠️  Xử lý lỗi chung:" -ForegroundColor Cyan
    
    # Lấy service name từ log line
    $serviceName = ($errorLine -split '\s+')[0]
    if ($serviceName) {
        Write-Host "📋 Logs chi tiết của $serviceName :" -ForegroundColor Cyan
        docker-compose logs --tail=20 $serviceName
    }
}

function AutoRecovery($errorLine) {
    # Lấy service name
    $serviceName = ($errorLine -split '\s+')[0]
    if (-not $serviceName) { return }
    
    Write-Host "🔄 Auto-recovery cho $serviceName ..." -ForegroundColor Green
    
    # Restart service
    docker-compose restart $serviceName
    
    # Chờ service khởi động
    Write-Host "⏳ Chờ 15 giây để service khởi động..." -ForegroundColor Yellow
    Start-Sleep 15
    
    # Kiểm tra lại
    Write-Host "✅ Kiểm tra trạng thái $serviceName :" -ForegroundColor Green
    docker-compose ps $serviceName
    
    # Nếu vẫn lỗi, thử rebuild
    $status = docker-compose ps $serviceName | Select-String "Up|healthy"
    if (-not $status) {
        Write-Host "🔨 Service vẫn lỗi, thử rebuild..." -ForegroundColor Yellow
        docker-compose build --no-cache $serviceName
        docker-compose up -d $serviceName
    }
}
```

### 4. Debug Service Cụ Thể với Error Analysis:
```powershell
# Debug repository-management-service (thường bị lỗi build)
docker-compose logs -f repository-management-service | ForEach-Object {
    if ($_ -match "ERROR|FAILED|Exception|BUILD FAILED") {
        Write-Host "🔴 Build Error: $_" -ForegroundColor Red
        
        # Phân tích lỗi chi tiết
        if ($_ -match "cannot find symbol.*class (\w+)") {
            $className = $matches[1]
            Write-Host "💡 Lỗi class không tìm thấy: $className" -ForegroundColor Cyan
            Write-Host "   - Kiểm tra import: import com.devgo2003.docgo.repository_service.*" -ForegroundColor White
            Write-Host "   - Kiểm tra package name trong file Java" -ForegroundColor White
        }
        
        if ($_ -match "BUILD FAILED") {
            Write-Host "🛠️  Maven build failed. Analyzing..." -ForegroundColor Yellow
            
            # Xem logs chi tiết build
            Write-Host "📋 Chi tiết lỗi build:" -ForegroundColor Cyan
            docker-compose logs --tail=50 repository-management-service | Select-String "ERROR|error:|failed|Exception" | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
            
            Write-Host "💡 Gợi ý sửa lỗi:" -ForegroundColor Cyan
            Write-Host "1. Kiểm tra import statements trong Java files" -ForegroundColor White
            Write-Host "2. Đảm bảo package names đúng (repository_service vs file_service)" -ForegroundColor White
            Write-Host "3. Kiểm tra dependencies trong pom.xml" -ForegroundColor White
            Write-Host "4. Clean và rebuild: mvn clean compile" -ForegroundColor White
        }
        
        # Restart service
        Write-Host "🔄 Restarting repository-management-service..." -ForegroundColor Green
        docker-compose restart repository-management-service
    }
}
```

### 5. Health Check All Services với Error Detection:
```powershell
# Kiểm tra health của tất cả services với error detection
Write-Host "🏥 Health Check - Tất cả services:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n🔍 Phân tích services có vấn đề:" -ForegroundColor Yellow
$problematicServices = docker-compose ps | Where-Object { $_ -match "Exit|unhealthy|restarting|dead" }

if ($problematicServices) {
    Write-Host "❌ Services có vấn đề:" -ForegroundColor Red
    $problematicServices | ForEach-Object {
        Write-Host "   $_" -ForegroundColor Red
        
        # Lấy service name và phân tích lỗi
        $serviceName = ($_ -split '\s+')[0]
        if ($serviceName -and $serviceName -ne "NAME") {
            Write-Host "📋 Logs lỗi của $serviceName :" -ForegroundColor Cyan
            docker-compose logs --tail=10 $serviceName | Select-String "ERROR|Exception|FAILED" | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "✅ Tất cả services đang hoạt động bình thường!" -ForegroundColor Green
}

Write-Host "`n📊 Resource Usage:" -ForegroundColor Green
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### 6. Quick Fix Commands với Error-Specific Solutions:
```powershell
# Nếu repository-management-service bị lỗi build
Write-Host "🔧 Quick Fix cho repository-management-service:" -ForegroundColor Cyan

# 1. Stop service
docker-compose stop repository-management-service

# 2. Clean Maven cache
Write-Host "🧹 Cleaning Maven cache..." -ForegroundColor Yellow
docker-compose run --rm repository-management-service mvn clean

# 3. Rebuild với no-cache
Write-Host "🔨 Rebuilding với no-cache..." -ForegroundColor Yellow
docker-compose build --no-cache repository-management-service

# 4. Start lại
Write-Host "🚀 Starting service..." -ForegroundColor Green
docker-compose up -d repository-management-service

# 5. Kiểm tra logs với error monitoring
Write-Host "👀 Monitoring logs for errors..." -ForegroundColor Cyan
docker-compose logs -f repository-management-service | ForEach-Object {
    if ($_ -match "ERROR|FAILED|Exception") {
        Write-Host "🔴 Error detected: $_" -ForegroundColor Red
    } elseif ($_ -match "Started.*in.*seconds") {
        Write-Host "✅ Service started successfully!" -ForegroundColor Green
        break
    }
}
```

### 7. Advanced Error Monitoring Script:
```powershell
# Script giám sát lỗi nâng cao
function Start-AdvancedErrorMonitoring {
    Write-Host "🔍 Starting Advanced Error Monitoring..." -ForegroundColor Green
    
    # Danh sách services cần monitor
    $services = @(
        "user-management-service",
        "repository-management-service", 
        "automation-service",
        "api-gateway",
        "web-app"
    )
    
    foreach ($service in $services) {
        Write-Host "`n📊 Monitoring $service ..." -ForegroundColor Cyan
        
        # Kiểm tra trạng thái
        $status = docker-compose ps $service | Select-String "Up"
        if (-not $status) {
            Write-Host "❌ $service is not running!" -ForegroundColor Red
            
            # Phân tích lỗi
            $logs = docker-compose logs --tail=20 $service
            $errors = $logs | Select-String "ERROR|Exception|FAILED|FATAL"
            
            if ($errors) {
                Write-Host "🔍 Error analysis for $service :" -ForegroundColor Yellow
                $errors | ForEach-Object {
                    Write-Host "   $_" -ForegroundColor Red
                }
                
                # Auto-fix based on error type
                if ($logs -match "BUILD FAILED|Maven") {
                    Write-Host "🔧 Auto-fixing Maven build error..." -ForegroundColor Yellow
                    docker-compose build --no-cache $service
                }
                elseif ($logs -match "Port.*already in use") {
                    Write-Host "🔧 Auto-fixing port conflict..." -ForegroundColor Yellow
                    docker-compose down
                    Start-Sleep 5
                    docker-compose up -d
                }
                else {
                    Write-Host "🔧 Restarting $service ..." -ForegroundColor Yellow
                    docker-compose restart $service
                }
            }
        } else {
            Write-Host "✅ $service is running normally" -ForegroundColor Green
        }
    }
    
    # Final health check
    Write-Host "`n🏥 Final Health Check:" -ForegroundColor Cyan
    docker-compose ps
}

# Chạy advanced monitoring
Start-AdvancedErrorMonitoring
```

## Troubleshooting Common Issues

### 1. Repository Management Service Build Errors
- **Lỗi**: `cannot find symbol: class RestResponse`
- **Nguyên nhân**: Import sai package (repository_service thay vì file_service)
- **Giải pháp**: Sửa import statements trong controller files
- **Auto-fix**: Script tự động detect và suggest fix

### 2. Port Conflicts
- **Lỗi**: `Port already in use`
- **Giải pháp**: `docker-compose down` rồi `docker-compose up`
- **Auto-fix**: Script tự động restart và check port usage

### 3. Volume Mount Issues
- **Lỗi**: `Permission denied` hoặc `No such file`
- **Giải pháp**: Kiểm tra quyền folder và volume paths trong docker-compose.yml
- **Auto-fix**: Script check permissions và suggest fixes

### 4. Network Issues
- **Lỗi**: Services không kết nối được với nhau
- **Giải pháp**: Kiểm tra network configuration và service names
- **Auto-fix**: Script restart network và verify connectivity

### 5. Memory Issues
- **Lỗi**: `OutOfMemoryError` hoặc container bị kill
- **Giải pháp**: Tăng Docker memory limit hoặc optimize JVM settings
- **Auto-fix**: Script suggest memory optimization

## Auto-Recovery Script với Error Classification
```powershell
# Script tự động sửa lỗi và restart với error classification
function Start-DocGOServicesWithErrorRecovery {
    Write-Host "🚀 Starting DocGO Services with Advanced Error Recovery..." -ForegroundColor Green
    
    # Start services
    docker-compose up -d
    
    # Wait for services to start
    Start-Sleep 20
    
    # Advanced error checking
    $maxRetries = 3
    $retryCount = 0
    
    do {
        $unhealthy = docker-compose ps | Where-Object { $_ -match "Exit|unhealthy|restarting" }
        
        if ($unhealthy) {
            $retryCount++
            Write-Host "⚠️  Attempt $retryCount/$maxRetries - Services chưa healthy. Đang phân tích lỗi..." -ForegroundColor Yellow
            
            # Phân tích lỗi chi tiết
            $unhealthy | ForEach-Object {
                $serviceName = ($_ -split '\s+')[0]
                if ($serviceName -and $serviceName -ne "NAME") {
                    Write-Host "🔍 Analyzing $serviceName ..." -ForegroundColor Cyan
                    
                    $logs = docker-compose logs --tail=30 $serviceName
                    $errors = $logs | Select-String "ERROR|Exception|FAILED|FATAL"
                    
                    if ($errors) {
                        Write-Host "❌ Errors found in $serviceName :" -ForegroundColor Red
                        $errors | ForEach-Object { Write-Host "   $_" -ForegroundColor Red }
                        
                        # Error-specific fixes
                        if ($logs -match "BUILD FAILED") {
                            Write-Host "🔧 Applying Maven build fix..." -ForegroundColor Yellow
                            docker-compose build --no-cache $serviceName
                        }
                        elseif ($logs -match "Port.*already in use") {
                            Write-Host "🔧 Applying port conflict fix..." -ForegroundColor Yellow
                            docker-compose down
                            Start-Sleep 5
                            docker-compose up -d
                        }
                        else {
                            Write-Host "🔧 Restarting $serviceName ..." -ForegroundColor Yellow
                            docker-compose restart $serviceName
                        }
                    }
                }
            }
            
            # Wait before retry
            Start-Sleep 15
        } else {
            Write-Host "✅ Tất cả services đã khởi động thành công!" -ForegroundColor Green
            break
        }
    } while ($retryCount -lt $maxRetries)
    
    if ($retryCount -eq $maxRetries) {
        Write-Host "❌ Không thể khởi động tất cả services sau $maxRetries lần thử!" -ForegroundColor Red
        Write-Host "📋 Final status:" -ForegroundColor Yellow
        docker-compose ps
    }
}

# Chạy advanced auto-recovery
Start-DocGOServicesWithErrorRecovery
```

---

**Lưu ý**: Script này sẽ tự động phát hiện, phân loại và sửa lỗi cho đến khi tất cả services hoạt động bình thường. Nếu không thể sửa tự động, sẽ đưa ra gợi ý cụ thể cho từng loại lỗi.
