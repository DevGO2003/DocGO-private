@echo off
echo ========================================
echo Building Contract Management Service
echo ========================================

cd backend\contract-management-service

echo.
echo Building Docker image...
docker build -t docgo-contract-service:latest .

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to build Docker image
    pause
    exit /b 1
)

echo.
echo ========================================
echo Docker image built successfully!
echo ========================================
echo.
echo To run the service with docker-compose:
echo   cd autofiles
echo   docker-compose -f docker-compose.dev.yml up contract-management-service
echo.
echo Or to run standalone:
echo   docker run -p 8003:8003 --name contract-service docgo-contract-service:latest
echo.

pause
