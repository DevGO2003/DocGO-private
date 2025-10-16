# Test script for Document Management Service APIs

Write-Host "Testing Document Management Service APIs..." -ForegroundColor Green

# Test 1: Get document by ID
Write-Host "`n1. Testing GET /documents/DOC-2024-004" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8002/api/v1/file-management-service/v1/documents/DOC-2024-004" -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get comments for document
Write-Host "`n2. Testing GET /documents/DOC-2024-004/comments" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8002/api/v1/file-management-service/v1/documents/DOC-2024-004/comments" -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get all documents
Write-Host "`n3. Testing GET /documents" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8002/api/v1/file-management-service/v1/documents" -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))..." -ForegroundColor Cyan
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nAPI testing completed!" -ForegroundColor Green

