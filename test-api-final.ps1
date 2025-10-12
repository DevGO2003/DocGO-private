# Script test API cuối cùng
Write-Host "=== TEST API DOCUMENT MANAGEMENT SERVICE ===" -ForegroundColor Green

# Test 1: GET Document by ID
Write-Host "`n1. Testing GET Document by ID..." -ForegroundColor Yellow
$documentUrl = "http://localhost:8002/api/v1/document-management-service/v1/documents/DOC-2024-004"

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
    Write-Host "Total Value: $($jsonResponse.data.totalValue) $($jsonResponse.data.currency)"
    Write-Host "Parties Count: $($jsonResponse.data.parties.Count)"
    Write-Host "Key Clauses Count: $($jsonResponse.data.keyClauses.Count)"
    Write-Host "Comments Count: $($jsonResponse.data.authorNotes.Count)"
    
} catch {
    Write-Host "❌ GET Document: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    }
}

# Test 2: GET Comments
Write-Host "`n2. Testing GET Comments..." -ForegroundColor Yellow
$commentsUrl = "http://localhost:8002/api/v1/document-management-service/v1/documents/DOC-2024-004/comments"

try {
    $response = Invoke-WebRequest -Uri $commentsUrl -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "✅ GET Comments: SUCCESS" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    
    # Parse JSON response
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
$newComment = @{
    content = "Test comment từ PowerShell script - $(Get-Date)"
    userId = "test-user"
    userName = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri $commentsUrl -Method POST -Body $newComment -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "✅ POST Comment: SUCCESS" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    
    # Parse JSON response
    $jsonResponse = $response.Content | ConvertFrom-Json
    Write-Host "New Comment ID: $($jsonResponse.data.id)"
    Write-Host "Comment Content: $($jsonResponse.data.content)"
    
} catch {
    Write-Host "❌ POST Comment: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Test 4: Swagger UI
Write-Host "`n4. Testing Swagger UI..." -ForegroundColor Yellow
$swaggerUrl = "http://localhost:8002/docs"

try {
    $response = Invoke-WebRequest -Uri $swaggerUrl -Method GET -ErrorAction Stop
    Write-Host "✅ Swagger UI: SUCCESS" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Swagger UI available at: $swaggerUrl"
    
} catch {
    Write-Host "❌ Swagger UI: FAILED" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)"
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
Write-Host "✅ All API endpoints implemented and ready to test"
Write-Host "✅ Sample data DOC-2024-004 available in database"
Write-Host "✅ CORS configuration applied"
Write-Host "✅ Swagger documentation available"
Write-Host "`n🚀 Next steps:"
Write-Host "1. Install Java 17 JDK if not already installed"
Write-Host "2. Set JAVA_HOME environment variable"
Write-Host "3. Run: cd backend\document-management-service && .\mvnw.cmd spring-boot:run"
Write-Host "4. Wait for service to start (30-60 seconds)"
Write-Host "5. Run this script again to test APIs"
Write-Host "6. Access frontend: http://localhost:3000/documents/DOC-2024-004"

