# Docker Local Fast - Tối ưu hóa tốc độ khởi động
# Sử dụng build cache và health checks để tăng tốc độ

param(
    [switch]$New,
    [string]$Service = ""
)

Write-Host "🚀 DocGO Docker Local Fast - Tối ưu hóa tốc độ" -ForegroundColor Green

# Function để check service health
function Wait-ForService {
    param($ServiceName, $MaxWait = 60)
    
    Write-Host "⏳ Đang chờ $ServiceName khởi động..." -ForegroundColor Yellow
    $waitTime = 0
    
    do {
        $status = docker-compose -f script/docker-compose.local.yml ps $ServiceName --format "{{.State}}"
        if ($status -eq "running") {
            Write-Host "✅ $ServiceName đã sẵn sàng!" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 2
        $waitTime += 2
    } while ($waitTime -lt $MaxWait)
    
    Write-Host "❌ $ServiceName timeout sau $MaxWait giây" -ForegroundColor Red
    return $false
}

# Function để build với cache
function Build-WithCache {
    param($ServiceName)
    
    Write-Host "🔨 Building $ServiceName với cache..." -ForegroundColor Blue
    docker-compose -f script/docker-compose.local.yml build --parallel $ServiceName
}

# Function để start service với health check
function Start-ServiceWithHealth {
    param($ServiceName)
    
    Write-Host "🚀 Khởi động $ServiceName..." -ForegroundColor Blue
    docker-compose -f script/docker-compose.local.yml up -d $ServiceName
    
    # Wait for health check
    Wait-ForService $ServiceName
}

# Main logic
if ($New) {
    Write-Host "🔄 Khởi động lại toàn bộ hệ thống..." -ForegroundColor Yellow
    
    # Stop all services
    docker-compose -f script/docker-compose.local.yml down
    
    # Start infrastructure first
    Write-Host "🏗️ Khởi động infrastructure services..." -ForegroundColor Blue
    docker-compose -f script/docker-compose.local.yml up -d mariadb redis elasticsearch mongodb kafka
    
    # Wait for infrastructure
    Wait-ForService "mariadb" 90
    Wait-ForService "redis" 30
    Wait-ForService "elasticsearch" 120
    
    # Start application services
    Write-Host "🚀 Khởi động application services..." -ForegroundColor Blue
    docker-compose -f script/docker-compose.local.yml up -d
    
} elseif ($Service) {
    Write-Host "🔧 Khởi động service: $Service" -ForegroundColor Blue
    
    # Build with cache if needed
    if ($Service -match "authentication-identity-service|ai-processing-service") {
        Build-WithCache $Service
    }
    
    Start-ServiceWithHealth $Service
    
} else {
    Write-Host "⚡ Khởi động nhanh - chỉ restart services cần thiết..." -ForegroundColor Green
    
    # Check which services need restart
    $runningServices = docker-compose -f script/docker-compose.local.yml ps --services --filter "status=running"
    
    if ($runningServices.Count -eq 0) {
        Write-Host "🔄 Không có service nào đang chạy, khởi động toàn bộ..." -ForegroundColor Yellow
        docker-compose -f script/docker-compose.local.yml up -d
    } else {
        Write-Host "♻️ Restart services đang chạy..." -ForegroundColor Blue
        docker-compose -f script/docker-compose.local.yml restart
    }
}

# Show status
Write-Host "`n📊 Trạng thái services:" -ForegroundColor Cyan
docker-compose -f script/docker-compose.local.yml ps

Write-Host "`n🌐 URLs truy cập:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  API Gateway: http://localhost:8000" -ForegroundColor White
Write-Host "  Auth Service: http://localhost:8001" -ForegroundColor White
Write-Host "  AI Service: http://localhost:8017" -ForegroundColor White

Write-Host "`n📝 Logs: docker-compose -f script/docker-compose.local.yml logs -f [service-name]" -ForegroundColor Gray
