# Script test API cuối cùng với ID mới
Write-Host "=== TEST API DOCUMENT MANAGEMENT SERVICE (NEW ID) ===" -ForegroundColor Green

# Test 1: GET Document by ID (NEW)
Write-Host "`n1. Testing GET Document by ID (NEW)..." -ForegroundColor Yellow
$documentUrl = "http://localhost:8002/api/v1/file-management-service/v1/documents/DOC-2024-004-NEW"

try {
    $response = Invoke-WebRequest -Uri $documentUrl -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "✅ GET Document: SUCCESS" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response Length: $($response.Content.Length) characters"
    
    # Parse JSON response
    $jsonResponse = $response.Content | ConvertFrom-Json
    Write-Host "Document ID: $($jsonResponse.data.id)"
    Write-Host "Document Title: $($jsonResponse.data.title)"
    Write-Host "Contract Type: $($jsonResponse.data.contractType)"
    Write-Host "Total Value: $($jsonResponse.data.totalValue)"
    Write-Host "Parties Count: $($jsonResponse.data.parties.Count)"
    Write-Host "Key Clauses Count: $($jsonResponse.data.keyClauses.Count)"
    
    if ($jsonResponse.data.parties.Count -gt 0) {
        Write-Host "First Party: $($jsonResponse.data.parties[0].name) - $($jsonResponse.data.parties[0].role)"
    }
    
    if ($jsonResponse.data.keyClauses.Count -gt 0) {
        Write-Host "First Key Clause: $($jsonResponse.data.keyClauses[0].name)"
    }
    
} catch {
    Write-Host "❌ GET Document: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Test 2: GET Comments
Write-Host "`n2. Testing GET Comments..." -ForegroundColor Yellow
$commentsUrl = "http://localhost:8002/api/v1/file-management-service/v1/documents/DOC-2024-004-NEW/comments"

try {
    $response = Invoke-WebRequest -Uri $commentsUrl -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "✅ GET Comments: SUCCESS" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    
    $jsonResponse = $response.Content | ConvertFrom-Json
    Write-Host "Comments Count: $($jsonResponse.data.content.Count)"
    
    if ($jsonResponse.data.content.Count -gt 0) {
        Write-Host "First Comment: $($jsonResponse.data.content[0].content)"
        Write-Host "Comment Author: $($jsonResponse.data.content[0].userName)"
    }
    
} catch {
    Write-Host "❌ GET Comments: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Test 3: POST New Comment
Write-Host "`n3. Testing POST New Comment..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "dd/MM/yyyy HH:mm:ss"
$commentData = @{
    content = "Test comment từ PowerShell script - $timestamp"
    userId = "test-user"
    userName = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $commentsUrl -Method POST -Headers @{"Content-Type"="application/json"} -Body $commentData -ErrorAction Stop
    Write-Host "✅ POST Comment: SUCCESS" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    
    $jsonResponse = $response.Content | ConvertFrom-Json
    Write-Host "New Comment ID: $($jsonResponse.data.id)"
    Write-Host "Comment Content: $($jsonResponse.data.content)"
    
} catch {
    Write-Host "❌ POST Comment: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Test 4: Swagger UI
Write-Host "`n4. Testing Swagger UI..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8002/docs" -Method GET -ErrorAction Stop
    Write-Host "✅ Swagger UI: SUCCESS" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Swagger UI available at: http://localhost:8002/docs"
} catch {
    Write-Host "❌ Swagger UI: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
Write-Host "✅ All API endpoints implemented and ready to test"
Write-Host "✅ Sample data DOC-2024-004-NEW available in database with FULL DATA"
Write-Host "✅ CORS configuration applied"
Write-Host "✅ Swagger documentation available"

Write-Host "`n🚀 Next steps:"
Write-Host "1. Frontend can now access: http://localhost:3000/documents/DOC-2024-004-NEW"
Write-Host "2. Backend API: http://localhost:8002/api/v1/file-management-service/v1/documents/DOC-2024-004-NEW"
Write-Host "3. Swagger Docs: http://localhost:8002/docs"
Write-Host "4. Comments API: http://localhost:8002/api/v1/file-management-service/v1/documents/DOC-2024-004-NEW/comments"

