Write-Host "========================================" -ForegroundColor Green
Write-Host "Building Contract Management Service" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Set-Location backend\contract-management-service

Write-Host ""
Write-Host "Building Docker image..." -ForegroundColor Yellow
docker build -t docgo-contract-service:latest .

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Failed to build Docker image" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Docker image built successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "To run the service with docker-compose:" -ForegroundColor Cyan
Write-Host "  cd autofiles" -ForegroundColor White
Write-Host "  docker-compose -f docker-compose.dev.yml up contract-management-service" -ForegroundColor White
Write-Host ""
Write-Host "Or to run standalone:" -ForegroundColor Cyan
Write-Host "  docker run -p 8003:8003 --name contract-service docgo-contract-service:latest" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
