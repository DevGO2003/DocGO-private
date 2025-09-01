# Simple test script
Write-Host "=== STARTING API TEST ===" -ForegroundColor Green

# Test 1: Check application
Write-Host "`n=== TEST 1: Check application ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/actuator/health" -Method GET
    Write-Host "SUCCESS: Application is running: $($response.status)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Application not responding" -ForegroundColor Red
    exit 1
}

# Test 2: Generate test data
Write-Host "`n=== TEST 2: Generate test data ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/test/generate-data" -Method POST
    Write-Host "SUCCESS: Data generated: $($response.message)" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Failed to generate data" -ForegroundColor Red
}

# Test 3: Test getAll API
Write-Host "`n=== TEST 3: Test getAll API ===" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8003/api/v1/contract-management-service/contracts" -Method GET
    Write-Host "SUCCESS: GetAll worked!" -ForegroundColor Green
    Write-Host "Total contracts: $($response.data.resultInfo.totalElements)" -ForegroundColor Yellow
    
    Write-Host "`nContract list:" -ForegroundColor Cyan
    foreach ($contract in $response.data.content) {
        Write-Host "- $($contract.contractNumber): $($contract.title) ($($contract.status))" -ForegroundColor White
    }
} catch {
    Write-Host "ERROR: GetAll failed" -ForegroundColor Red
}

Write-Host "`n=== TEST COMPLETED ===" -ForegroundColor Green

