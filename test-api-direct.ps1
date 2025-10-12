# Script test API trực tiếp
Write-Host "Testing API endpoints..."

# Test API endpoint
$url = "http://localhost:8002/api/v1/document-management-service/v1/documents/DOC-2024-004"

try {
    Write-Host "Testing GET $url"
    $response = Invoke-WebRequest -Uri $url -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    
    # Nếu service chưa chạy, hãy thử khởi động
    Write-Host "Service có thể chưa chạy. Hãy khởi động service trước:"
    Write-Host "1. Mở terminal mới"
    Write-Host "2. cd backend\document-management-service"  
    Write-Host "3. mvn spring-boot:run"
    Write-Host "4. Đợi service khởi động xong (thấy 'Started DocumentManagementServiceApplication')"
    Write-Host "5. Chạy lại script này"
}

# Test comments API
$commentsUrl = "http://localhost:8002/api/v1/document-management-service/v1/documents/DOC-2024-004/comments"

try {
    Write-Host "`nTesting GET $commentsUrl"
    $response = Invoke-WebRequest -Uri $commentsUrl -Method GET -Headers @{"Content-Type"="application/json"} -ErrorAction Stop
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
}
