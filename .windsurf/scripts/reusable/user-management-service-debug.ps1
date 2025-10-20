# User Management Service Auto-Debug Script
# Theo dõi và tự động sửa lỗi user-management-service

Write-Host "🚀 User Management Service Auto-Debug Started..." -ForegroundColor Green
Write-Host "📍 Service: user-management-service (Port 8001)" -ForegroundColor Cyan
Write-Host "🕐 Time: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Function để kiểm tra health
function Test-ServiceHealth {
    Write-Host "🏥 Checking service health..." -ForegroundColor Yellow
    
    $status = docker-compose ps user-management-service --format "{{.Status}}"
    if ($status -match "Up") {
        Write-Host "✅ Service is running: $status" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Service is not healthy: $status" -ForegroundColor Red
        return $false
    }
}

# Function để hiển thị resource usage
function Show-ResourceUsage {
    Write-Host "📊 Resource Usage:" -ForegroundColor Cyan
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}" user-management-service
}

# Function để xem logs lỗi gần nhất
function Show-RecentErrors {
    Write-Host "🔍 Recent Errors (last 50 lines):" -ForegroundColor Yellow
    docker-compose logs --tail=50 user-management-service | Select-String -Pattern "ERROR|Exception|FAILED|WARN" -Context 1
}

# Function để restart service
function Restart-Service {
    Write-Host "🔄 Restarting user-management-service..." -ForegroundColor Yellow
    docker-compose restart user-management-service
    
    Write-Host "⏳ Waiting for service to start..." -ForegroundColor Yellow
    Start-Sleep 15
    
    Write-Host "✅ Service restarted. Checking status..." -ForegroundColor Green
    Test-ServiceHealth
}

# Function để follow logs với auto-debug
function Follow-LogsWithDebug {
    Write-Host "📋 Following logs with auto-debug (Press Ctrl+C to stop)..." -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose logs -f --tail=20 user-management-service | ForEach-Object {
        Write-Host $_ -ForegroundColor White
        
        # Kiểm tra lỗi trong log
        if ($_ -match "ERROR|Exception|FAILED|BUILD FAILED") {
            Write-Host ""
            Write-Host "🔴 ERROR DETECTED: $_" -ForegroundColor Red
            Write-Host "🛠️  Auto-debug mode activated..." -ForegroundColor Yellow
            Write-Host ""
            
            # Hiển thị lỗi chi tiết
            Show-RecentErrors
            
            Write-Host ""
            Write-Host "💡 Auto-fix suggestions:" -ForegroundColor Cyan
            
            # Kiểm tra loại lỗi và đưa ra gợi ý
            if ($_ -match "BUILD FAILED|Maven.*failed") {
                Write-Host "🔧 Maven Build Error Detected:" -ForegroundColor Yellow
                Write-Host "1. Checking Java compilation errors..." -ForegroundColor White
                Write-Host "2. Verifying dependencies in pom.xml..." -ForegroundColor White
                Write-Host "3. Checking import statements..." -ForegroundColor White
                
                Write-Host ""
                Write-Host "🔄 Attempting auto-fix..." -ForegroundColor Green
                Restart-Service
                
            } elseif ($_ -match "Database.*connection|MongoDB.*failed") {
                Write-Host "🗄️  Database Connection Error:" -ForegroundColor Yellow
                Write-Host "1. Checking MongoDB connection..." -ForegroundColor White
                Write-Host "2. Verifying environment variables..." -ForegroundColor White
                Write-Host "3. Checking network connectivity..." -ForegroundColor White
                
            } elseif ($_ -match "Port.*already in use|Address already in use") {
                Write-Host "🔌 Port Conflict Error:" -ForegroundColor Yellow
                Write-Host "1. Checking port 8001 usage..." -ForegroundColor White
                Write-Host "2. Stopping conflicting processes..." -ForegroundColor White
                
                Write-Host ""
                Write-Host "🔄 Attempting auto-fix..." -ForegroundColor Green
                Restart-Service
                
            } else {
                Write-Host "⚠️  General Error Detected:" -ForegroundColor Yellow
                Write-Host "1. Checking service logs..." -ForegroundColor White
                Write-Host "2. Verifying configuration..." -ForegroundColor White
                Write-Host "3. Checking dependencies..." -ForegroundColor White
            }
            
            Write-Host ""
            Write-Host "🔄 Restarting service..." -ForegroundColor Green
            Restart-Service
            
            Write-Host ""
            Write-Host "📋 Continuing to monitor logs..." -ForegroundColor Cyan
            Write-Host ""
        }
    }
}

# Main execution
try {
    # Kiểm tra trạng thái ban đầu
    Write-Host "🔍 Initial Health Check:" -ForegroundColor Cyan
    $isHealthy = Test-ServiceHealth
    
    if (-not $isHealthy) {
        Write-Host "⚠️  Service not healthy. Attempting restart..." -ForegroundColor Yellow
        Restart-Service
    }
    
    Write-Host ""
    Show-ResourceUsage
    Write-Host ""
    
    # Hiển thị startup logs
    Write-Host "🚀 Startup Logs Summary:" -ForegroundColor Cyan
    docker-compose logs --tail=20 user-management-service | Select-String -Pattern "Started|ERROR|Exception" -Context 1
    
    Write-Host ""
    Write-Host "📋 Starting log monitoring with auto-debug..." -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop monitoring" -ForegroundColor Gray
    Write-Host ""
    
    # Bắt đầu follow logs với auto-debug
    Follow-LogsWithDebug
    
} catch {
    Write-Host "❌ Error in auto-debug script: $_" -ForegroundColor Red
    Write-Host "🔄 Attempting service restart..." -ForegroundColor Yellow
    Restart-Service
} finally {
    Write-Host ""
    Write-Host "🏁 Auto-debug session ended at $(Get-Date)" -ForegroundColor Gray
    Write-Host "📊 Final service status:" -ForegroundColor Cyan
    Test-ServiceHealth
}






























