@echo off
echo ========================================
echo Docker Local - Backend Services with Hot Reload
echo ========================================

echo.
echo Starting backend microservices with hot-reload...
echo - Volume mounting enabled for backend services
echo - Development mode with auto-reload
echo - Infrastructure services (DB, Redis) running normally
echo.

cd /d "%~dp0"

echo Building and starting services...
docker compose -f docker-compose.local.yml up --build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to start services!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo Backend Services (Hot Reload Enabled):
echo   - API Gateway BFF: http://localhost:8000
echo   - Contract Management: http://localhost:8003
echo   - AI Processing: http://localhost:8017
echo   - File Storage: http://localhost:8012
echo.
echo Services Temporarily Disabled:
echo   - Auth Service: http://localhost:8001 (commented out)
echo   - User Management: http://localhost:8002 (commented out)
echo.
echo Infrastructure Services:
echo   - MariaDB: localhost:3306
echo   - Redis: localhost:6379
echo.
echo API Documentation:
echo   - Contract Management: http://localhost:8003/docs
echo   - AI Processing: http://localhost:8017/docs
echo   - File Storage: http://localhost:8012/docs
echo.
echo Management Commands:
echo   - View logs: docker compose -f docker-compose.local.yml logs -f
echo   - Stop services: docker compose -f docker-compose.local.yml down
echo   - Restart: docker compose -f docker-compose.local.yml restart
echo.

pause
