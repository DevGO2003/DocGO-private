@echo off
echo ========================================
echo DocGO - Docker Development Mode
echo ========================================
echo.
echo Chay toan bo service backend voi volume mount
echo Code se duoc sync truc tiep tu may host
echo.
echo Ports:
echo - API Gateway BFF: http://localhost:8000
echo - Auth Service: http://localhost:8001
echo - User Management: http://localhost:8002
echo - Contract Management: http://localhost:8003
echo - AI Processing: http://localhost:8017
echo - File Storage: http://localhost:8012
echo - Frontend: http://localhost:3000
echo - Database: localhost:3306
echo - Redis: localhost:6379
echo.

echo Kiem tra Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker khong duoc cai dat hoac khong chay
    echo Hay cai dat Docker Desktop va khoi dong lai
    pause
    exit /b 1
)

echo Kiem tra Docker Compose...
docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker Compose khong duoc cai dat
    pause
    exit /b 1
)

echo.
echo Bat dau chay cac service...
echo.

REM Dung cac container cu neu co
echo Dung cac container cu...
docker-compose -f autofiles/docker-compose.dev.yml down

REM Xoa cac container va network cu
echo Xoa cac container va network cu...
docker system prune -f

REM Chay cac service
echo Chay cac service...
docker-compose -f autofiles/docker-compose.dev.yml up -d

echo.
echo ========================================
echo Da chay xong! Kiem tra trang thai:
echo ========================================
docker-compose -f autofiles/docker-compose.dev.yml ps

echo.
echo ========================================
echo Logs cua cac service:
echo ========================================
echo Xem logs: docker-compose -f autofiles/docker-compose.dev.yml logs -f [service-name]
echo Dung tat ca: docker-compose -f autofiles/docker-compose.dev.yml down
echo.

echo Nhan phim bat ky de xem logs...
pause >nul

echo.
echo Hien thi logs cua tat ca service...
docker-compose -f autofiles/docker-compose.dev.yml logs -f
