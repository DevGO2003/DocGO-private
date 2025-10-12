# Script để khởi động document-management-service
Write-Host "Đang khởi động document-management-service..."

# Chuyển đến thư mục service
Set-Location "backend\document-management-service"

# Kiểm tra xem có file pom.xml không
if (Test-Path "pom.xml") {
    Write-Host "Tìm thấy pom.xml, đang khởi động Spring Boot..."
    
    # Khởi động Spring Boot
    mvn spring-boot:run
} else {
    Write-Host "Không tìm thấy pom.xml trong thư mục hiện tại"
    Write-Host "Thư mục hiện tại: $(Get-Location)"
    Write-Host "Danh sách file:"
    Get-ChildItem
}

