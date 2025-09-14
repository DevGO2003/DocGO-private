# DocGO Simplified Architecture (5 Services)
# PowerShell script to run simplified architecture

Write-Host "========================================" -ForegroundColor Green
Write-Host "DocGO Simplified Architecture (5 Services)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "- API Gateway: http://localhost:8000" -ForegroundColor Cyan
Write-Host "- Auth Service: http://localhost:8001" -ForegroundColor Cyan
Write-Host "- Contract Service: http://localhost:8002" -ForegroundColor Cyan
Write-Host "- AI Service: http://localhost:8003" -ForegroundColor Cyan
Write-Host "- File Service: http://localhost:8004" -ForegroundColor Cyan
Write-Host ""
Write-Host "Infrastructure:" -ForegroundColor Yellow
Write-Host "- MongoDB: localhost:27017" -ForegroundColor Cyan
Write-Host "- Redis: localhost:6379" -ForegroundColor Cyan
Write-Host "- Kafka: localhost:9092" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting services..." -ForegroundColor Green
Write-Host ""

# Start services
docker-compose -f script/docker-compose.local.yml up -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Services started successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Health check
Write-Host "Health Check:" -ForegroundColor Yellow
Start-Sleep -Seconds 10

$services = @(
    @{Name="API Gateway"; Url="http://localhost:8000/api/health"},
    @{Name="Auth Service"; Url="http://localhost:8001/health"},
    @{Name="Contract Service"; Url="http://localhost:8002/health"},
    @{Name="AI Service"; Url="http://localhost:8003/health"},
    @{Name="File Service"; Url="http://localhost:8004/health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "$($service.Name): OK" -ForegroundColor Green
        } else {
            Write-Host "$($service.Name): FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "$($service.Name): FAILED (Error: $($_.Exception.Message))" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Press any key to stop services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Stopping services..." -ForegroundColor Green
docker-compose -f script/docker-compose.local.yml down

Write-Host ""
Write-Host "Services stopped!" -ForegroundColor Green
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
