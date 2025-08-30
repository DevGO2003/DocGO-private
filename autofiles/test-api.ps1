# Test API Script for AI Processing Service
Write-Host "Testing AI Processing Service APIs..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test health endpoint
Write-Host "`nTesting Health Endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8017/health" -TimeoutSec 10 -UseBasicParsing
    Write-Host "Health Endpoint: $($response.StatusCode) - $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Health Endpoint: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test classify API
Write-Host "`nTesting Classify API..." -ForegroundColor Yellow
try {
    $body = @{
        text = "This is a sample contract document for testing purposes."
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/classify" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 30 -UseBasicParsing
    Write-Host "Classify API: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Classify API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Test extract API
Write-Host "`nTesting Extract API..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8017/api/v1/ai-processing-service/extract" -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "Extract API: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Extract API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI Testing completed!" -ForegroundColor Green
