# test/health-check.ps1
Write-Host "Testing DocGO Simplified Architecture Health..." -ForegroundColor Green

$services = @(
    @{Name="API Gateway"; Url="http://localhost:8000/api/health"},
    @{Name="Auth Service"; Url="http://localhost:8001/health"},
    @{Name="Contract Service"; Url="http://localhost:8002/health"},
    @{Name="AI Service"; Url="http://localhost:8003/health"},
    @{Name="File Service"; Url="http://localhost:8004/health"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "$($service.Name): OK" -ForegroundColor Green
        } else {
            Write-Host "$($service.Name): FAILED (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "$($service.Name): FAILED (Error: $($_.Exception.Message))" -ForegroundColor Red
    }
}

Write-Host "Health check completed!" -ForegroundColor Yellow
