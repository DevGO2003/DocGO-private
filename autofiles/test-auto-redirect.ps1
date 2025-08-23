Write-Host "========================================" -ForegroundColor Green
Write-Host "Testing Auto-Redirect for Microservices" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Danh sach cac microservices va port tuong ung
$services = @(
    @{Name="API Gateway BFF"; Port=8000; Type="Next.js"},
    @{Name="Authentication Identity Service"; Port=8001; Type="Spring Boot"},
    @{Name="User Management Service"; Port=8002; Type="FastAPI"},
    @{Name="Contract Management Service"; Port=8003; Type="Spring Boot"},
    @{Name="AI Processing Service"; Port=8017; Type="FastAPI"},
    @{Name="File Storage Asset Service"; Port=8012; Type="FastAPI"}
)

Write-Host ""
Write-Host "Testing auto-redirect from root (/) to /docs for each service:" -ForegroundColor Yellow
Write-Host ""

foreach ($service in $services) {
    $url = "http://localhost:$($service.Port)/"
    $docsUrl = "http://localhost:$($service.Port)/docs"
    
    Write-Host "Testing $($service.Name) ($($service.Type))" -ForegroundColor Cyan
    Write-Host "   Root URL: $url" -ForegroundColor Gray
    Write-Host "   Expected redirect to: $docsUrl" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $url -MaximumRedirection 0 -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq 302 -or $response.StatusCode -eq 301) {
            $redirectUrl = $response.Headers.Location
            if ($redirectUrl -eq "/docs" -or $redirectUrl -eq $docsUrl) {
                Write-Host "   SUCCESS: Redirect to /docs working correctly" -ForegroundColor Green
            } else {
                Write-Host "   WARNING: Redirect to unexpected URL: $redirectUrl" -ForegroundColor Yellow
            }
        } else {
            Write-Host "   FAILED: No redirect found (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            if ($statusCode -eq 302 -or $statusCode -eq 301) {
                Write-Host "   SUCCESS: Redirect detected (Status: $statusCode)" -ForegroundColor Green
            } else {
                Write-Host "   FAILED: Service not responding correctly (Status: $statusCode)" -ForegroundColor Red
            }
        } else {
            Write-Host "   FAILED: Service not available or not running" -ForegroundColor Red
        }
    }
    
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Green
Write-Host "Test completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Expected behavior:" -ForegroundColor Yellow
Write-Host "• All backend microservices should redirect from / to /docs" -ForegroundColor White
Write-Host "• Frontend services should NOT redirect to /docs" -ForegroundColor White
Write-Host "• Status code 302 (Found) indicates successful redirect" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to continue"
