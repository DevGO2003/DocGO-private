# DocGO - Docker Build and Run Script (PowerShell)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DocGO - Docker Build and Run Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Building all Docker images..." -ForegroundColor Yellow
Write-Host ""

try {
    # Build API Gateway BFF
    Write-Host "[1/7] Building API Gateway BFF..." -ForegroundColor Green
    docker build -t docgo/api-gateway-bff:latest ./backend/api-gateway-bff
    if ($LASTEXITCODE -ne 0) { throw "Error building API Gateway BFF" }

    # Build Authentication Identity Service
    Write-Host "[2/7] Building Authentication Identity Service..." -ForegroundColor Green
    docker build -t docgo/auth-service:latest ./backend/authentication-identity-service
    if ($LASTEXITCODE -ne 0) { throw "Error building Authentication Identity Service" }

    # Build User Management Service
    Write-Host "[3/7] Building User Management Service..." -ForegroundColor Green
    docker build -t docgo/user-management-service:latest ./backend/user-management-service
    if ($LASTEXITCODE -ne 0) { throw "Error building User Management Service" }

    # Build Contract Management Service
    Write-Host "[4/7] Building Contract Management Service..." -ForegroundColor Green
    docker build -t docgo/contract-service:latest ./backend/contract-management-service
    if ($LASTEXITCODE -ne 0) { throw "Error building Contract Management Service" }

    # Build AI Processing Service
    Write-Host "[5/7] Building AI Processing Service..." -ForegroundColor Green
    docker build -t docgo/ai-processing-service:latest ./backend/ai-processing-service
    if ($LASTEXITCODE -ne 0) { throw "Error building AI Processing Service" }

    # Build File Storage Asset Service
    Write-Host "[6/7] Building File Storage Asset Service..." -ForegroundColor Green
    docker build -t docgo/file-storage-service:latest ./backend/file-storage-asset-service
    if ($LASTEXITCODE -ne 0) { throw "Error building File Storage Asset Service" }

    # Build Frontend Web
    Write-Host "[7/7] Building Frontend Web..." -ForegroundColor Green
    docker build -t docgo/frontend-web:latest ./frontend/web
    if ($LASTEXITCODE -ne 0) { throw "Error building Frontend Web" }

    Write-Host ""
    Write-Host "All Docker images built successfully!" -ForegroundColor Green
    Write-Host ""

    # Start services with Docker Compose
    Write-Host "Starting services with Docker Compose..." -ForegroundColor Yellow
    docker-compose up -d

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "DocGO is starting up..." -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Services will be available at:" -ForegroundColor White
    Write-Host "- Frontend Web: http://localhost:3000" -ForegroundColor White
    Write-Host "- API Gateway BFF: http://localhost:8000" -ForegroundColor White
    Write-Host "- Authentication Service: http://localhost:8001" -ForegroundColor White
    Write-Host "- User Management Service: http://localhost:8002" -ForegroundColor White
    Write-Host "- Contract Management Service: http://localhost:8003" -ForegroundColor White
    Write-Host "- AI Processing Service: http://localhost:8017" -ForegroundColor White
    Write-Host "- File Storage Service: http://localhost:8012" -ForegroundColor White
    Write-Host "- MariaDB: localhost:3306" -ForegroundColor White
    Write-Host "- Redis: localhost:6379" -ForegroundColor White
    Write-Host ""
    Write-Host "To view logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "To stop services: docker-compose down" -ForegroundColor Yellow
    Write-Host ""

} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Build failed. Please check the error above." -ForegroundColor Red
    Read-Host "Press Enter to continue..."
    exit 1
}

Read-Host "Press Enter to continue..."
