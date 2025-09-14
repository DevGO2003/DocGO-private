@echo off
REM Docker Development Script - Batch
REM Chạy lệnh: docker dev
REM Tối ưu hóa cho development với hot reload và hybrid approach

setlocal enabledelayedexpansion

REM Parse arguments
set "new=false"
set "down=false"
set "logs=false"
set "status=false"
set "service="

:parse_args
if "%~1"=="" goto :main
if "%~1"=="--new" set "new=true"
if "%~1"=="--down" set "down=true"
if "%~1"=="--logs" set "logs=true"
if "%~1"=="--status" set "status=true"
if "%~1"=="--help" goto :show_help
if not "%~1"=="" set "service=%~1"
shift
goto :parse_args

:main
call :test_docker_compose
if errorlevel 1 exit /b 1

if "%down%"=="true" (
    call :stop_dev_environment
) else if "%logs%"=="true" (
    call :show_logs
) else if "%status%"=="true" (
    call :show_status
) else if "%new%"=="true" (
    call :start_dev_environment true
) else (
    call :start_dev_environment false
)
goto :eof

:show_help
echo.
echo ==========================================
echo   DocGO Development Environment
echo   Docker Compose Dev - Optimized
echo ==========================================
echo.
echo Cách sử dụng:
echo   docker dev              # Khởi động development environment
echo   docker dev --new        # Khởi động mới (xóa cache, rebuild)
echo   docker dev --down       # Dừng tất cả services
echo   docker dev --logs       # Xem logs tất cả services
echo   docker dev --logs ^<service^>  # Xem logs service cụ thể
echo   docker dev --status     # Xem trạng thái services
echo.
echo Ví dụ:
echo   docker dev --logs api-gateway-bff
echo   docker dev --logs ai-processing-service
echo.
goto :eof

:test_docker_compose
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker không được cài đặt!
    echo Vui lòng cài đặt Docker Desktop
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker Compose không được cài đặt!
    echo Vui lòng cài đặt Docker Desktop hoặc Docker Compose
    exit /b 1
)
goto :eof

:start_dev_environment
set "is_new=%~1"

echo.
echo ==========================================
echo   DocGO Development Environment
echo   Docker Compose Dev - Optimized
echo ==========================================
echo.

if "%is_new%"=="true" (
    echo 🔄 Khởi động mới - Xóa cache và rebuild...
    echo Dừng tất cả containers...
    docker-compose -f script/docker-compose.dev.yml down
    
    echo Xóa volumes cache cũ...
    docker volume prune -f
    
    echo Rebuild images...
    docker-compose -f script/docker-compose.dev.yml build --no-cache
) else (
    echo 🚀 Khởi động development environment...
)

echo Khởi động services với hot reload...
docker-compose -f script/docker-compose.dev.yml up -d

if errorlevel 1 (
    echo ❌ Có lỗi khi khởi động development environment!
    echo Kiểm tra logs: docker dev --logs
    exit /b 1
)

echo ✅ Development environment đã khởi động thành công!
echo.
call :show_service_status
echo.
echo 📋 Các service đang chạy:
echo   • API Gateway BFF:     http://localhost:8000
echo   • Auth Service:        http://localhost:8001
echo   • User Management:     http://localhost:8002
echo   • Contract Management: http://localhost:8003
echo   • Document History:    http://localhost:8004
echo   • Collaboration:       http://localhost:8005
echo   • Approval Workflow:   http://localhost:8006
echo   • Reminder Scheduler:  http://localhost:8007
echo   • eSignature:          http://localhost:8008
echo   • Notification:        http://localhost:8009
echo   • Reporting:           http://localhost:8010
echo   • OCR Extraction:      http://localhost:8011
echo   • File Storage:        http://localhost:8012
echo   • Integration:         http://localhost:8014
echo   • Batch ETL:           http://localhost:8015
echo   • Health Monitoring:   http://localhost:8016
echo   • AI Processing:       http://localhost:8017
echo   • General File Mgmt:   http://localhost:8018
echo   • Frontend Next.js:    http://localhost:3000
echo.
echo 🗄️  Databases:
echo   • MariaDB:             localhost:3307
echo   • MongoDB:             localhost:27017
echo   • Redis:               localhost:6379
echo   • Elasticsearch:       localhost:9200
echo   • Kafka:               localhost:9092
echo.
echo 💡 Tips:
echo   • Xem logs: docker dev --logs
echo   • Dừng services: docker dev --down
echo   • Restart mới: docker dev --new
goto :eof

:stop_dev_environment
echo.
echo ==========================================
echo   DocGO Development Environment
echo   Docker Compose Dev - Optimized
echo ==========================================
echo.
echo 🛑 Dừng development environment...
docker-compose -f script/docker-compose.dev.yml down
echo ✅ Đã dừng tất cả services!
goto :eof

:show_logs
echo.
echo ==========================================
echo   DocGO Development Environment
echo   Docker Compose Dev - Optimized
echo ==========================================
echo.

if not "%service%"=="" (
    echo 📋 Logs của service: %service%
    docker-compose -f script/docker-compose.dev.yml logs -f %service%
) else (
    echo 📋 Logs của tất cả services:
    docker-compose -f script/docker-compose.dev.yml logs -f
)
goto :eof

:show_service_status
echo 📊 Trạng thái services:
docker-compose -f script/docker-compose.dev.yml ps
goto :eof

:show_status
echo.
echo ==========================================
echo   DocGO Development Environment
echo   Docker Compose Dev - Optimized
echo ==========================================
echo.
call :show_service_status
echo.
echo 📈 Thống kê containers:
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
goto :eof
