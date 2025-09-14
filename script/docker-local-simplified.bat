@echo off
echo ========================================
echo DocGO Simplified Architecture (5 Services)
echo ========================================
echo.
echo Services:
echo - API Gateway: http://localhost:8000
echo - Auth Service: http://localhost:8001
echo - Contract Service: http://localhost:8002
echo - AI Service: http://localhost:8003
echo - File Service: http://localhost:8004
echo.
echo Infrastructure:
echo - MongoDB: localhost:27017
echo - Redis: localhost:6379
echo - Kafka: localhost:9092
echo.
echo Starting services...
echo.

docker-compose -f script/docker-compose.local.yml up -d

echo.
echo ========================================
echo Services started successfully!
echo ========================================
echo.
echo Health Check:
timeout /t 10 /nobreak >nul
curl -f http://localhost:8000/api/health 2>nul && echo API Gateway: OK || echo API Gateway: FAILED
curl -f http://localhost:8001/health 2>nul && echo Auth Service: OK || echo Auth Service: FAILED
curl -f http://localhost:8002/health 2>nul && echo Contract Service: OK || echo Contract Service: FAILED
curl -f http://localhost:8003/health 2>nul && echo AI Service: OK || echo AI Service: FAILED
curl -f http://localhost:8004/health 2>nul && echo File Service: OK || echo File Service: FAILED
echo.
echo Press any key to stop services...
pause >nul

echo.
echo Stopping services...
docker-compose -f script/docker-compose.local.yml down

echo.
echo Services stopped!
pause
