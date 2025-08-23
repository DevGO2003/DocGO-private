@echo off
echo ========================================
echo DocGO - Docker Build and Run Script
echo ========================================
echo.

echo Building all Docker images...
echo.

echo [1/7] Building API Gateway BFF...
docker build -t docgo/api-gateway-bff:latest ./backend/api-gateway-bff
if %errorlevel% neq 0 (
    echo Error building API Gateway BFF
    pause
    exit /b 1
)

echo [2/7] Building Authentication Identity Service...
docker build -t docgo/auth-service:latest ./backend/authentication-identity-service
if %errorlevel% neq 0 (
    echo Error building Authentication Identity Service
    pause
    exit /b 1
)

echo [3/7] Building User Management Service...
docker build -t docgo/user-management-service:latest ./backend/user-management-service
if %errorlevel% neq 0 (
    echo Error building User Management Service
    pause
    exit /b 1
)

echo [4/7] Building Contract Management Service...
docker build -t docgo/contract-service:latest ./backend/contract-management-service
if %errorlevel% neq 0 (
    echo Error building Contract Management Service
    pause
    exit /b 1
)

echo [5/7] Building AI Processing Service...
docker build -t docgo/ai-processing-service:latest ./backend/ai-processing-service
if %errorlevel% neq 0 (
    echo Error building AI Processing Service
    pause
    exit /b 1
)

echo [6/7] Building File Storage Asset Service...
docker build -t docgo/file-storage-service:latest ./backend/file-storage-asset-service
if %errorlevel% neq 0 (
    echo Error building File Storage Asset Service
    pause
    exit /b 1
)

echo [7/7] Building Frontend Web...
docker build -t docgo/frontend-web:latest ./frontend/web
if %errorlevel% neq 0 (
    echo Error building Frontend Web
    pause
    exit /b 1
)

echo.
echo All Docker images built successfully!
echo.

echo Starting services with Docker Compose...
docker-compose -f autofiles/docker-compose.yml up -d

echo.
echo ========================================
echo DocGO is starting up...
echo ========================================
echo.
echo Services will be available at:
echo - Frontend Web: http://localhost:3000
echo - API Gateway BFF: http://localhost:8000
echo - Authentication Service: http://localhost:8001
echo - User Management Service: http://localhost:8002
echo - Contract Management Service: http://localhost:8003
echo - AI Processing Service: http://localhost:8017
echo - File Storage Service: http://localhost:8012
echo - MariaDB: localhost:3306
echo - Redis: localhost:6379
echo.
echo To view logs: docker-compose logs -f
echo To stop services: docker-compose down
echo.
pause
