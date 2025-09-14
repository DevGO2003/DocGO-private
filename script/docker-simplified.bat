@echo off
echo Starting DocGO Simplified Architecture...
docker-compose -f script/docker-compose.simplified.yml --env-file script/env.simplified up -d
echo DocGO Simplified Architecture started!
echo.
echo Services:
echo - API Gateway: http://localhost:8000
echo - Auth Service: http://localhost:8001
echo - Contract Service: http://localhost:8002
echo - AI Service: http://localhost:8003
echo - File Service: http://localhost:8004
echo.
echo Press any key to stop services...
pause
docker-compose -f script/docker-compose.simplified.yml down
