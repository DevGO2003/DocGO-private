# Docker Local - Backend Services with Hot Reload
# PowerShell Script

Write-Host "========================================" -ForegroundColor Green
Write-Host "Docker Local - Backend Services with Hot Reload" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host ""
Write-Host "Starting backend microservices with hot-reload..." -ForegroundColor Yellow
Write-Host "- Volume mounting enabled for backend services" -ForegroundColor White
Write-Host "- Development mode with auto-reload" -ForegroundColor White
Write-Host "- Infrastructure services (DB, Redis) running normally" -ForegroundColor White
Write-Host ""

# Change to autofiles directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "Building and starting services..." -ForegroundColor Yellow
docker compose -f docker-compose.local.yml up --build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to start services!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend Services (Hot Reload Enabled):" -ForegroundColor Cyan
Write-Host "  - API Gateway BFF: http://localhost:8000" -ForegroundColor White
Write-Host "  - Contract Management: http://localhost:8003" -ForegroundColor White
Write-Host "  - AI Processing: http://localhost:8017" -ForegroundColor White
Write-Host "  - File Storage: http://localhost:8012" -ForegroundColor White
Write-Host ""
Write-Host "Services Temporarily Disabled:" -ForegroundColor Yellow
Write-Host "  - Auth Service: http://localhost:8001 (commented out)" -ForegroundColor White
Write-Host "  - User Management: http://localhost:8002 (commented out)" -ForegroundColor White
Write-Host ""
Write-Host "Infrastructure Services:" -ForegroundColor Cyan
Write-Host "  - MariaDB: localhost:3306" -ForegroundColor White
Write-Host "  - Redis: localhost:6379" -ForegroundColor White
Write-Host ""
Write-Host "API Documentation:" -ForegroundColor Cyan
Write-Host "  - Contract Management: http://localhost:8003/docs" -ForegroundColor White
Write-Host "  - AI Processing: http://localhost:8017/docs" -ForegroundColor White
Write-Host "  - File Storage: http://localhost:8012/docs" -ForegroundColor White
Write-Host ""
Write-Host "Management Commands:" -ForegroundColor Cyan
Write-Host "  - View logs: docker compose -f docker-compose.local.yml logs -f" -ForegroundColor White
Write-Host "  - Stop services: docker compose -f docker-compose.local.yml down" -ForegroundColor White
Write-Host "  - Restart: docker compose -f docker-compose.local.yml restart" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
