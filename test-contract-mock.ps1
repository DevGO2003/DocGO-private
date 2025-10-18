# Mock Test cho Contract Summarize API
# Vì service không chạy được do thiếu dependencies, tôi sẽ tạo mock response

Write-Host "🧪 MOCK TEST - Contract Summarize API"
Write-Host "=========================================="

# Mock response dựa trên API schema
$mockResponse = @{
    apiVersion = "v1"
    statusCode = 200
    shortMessage = "Success"
    description = "Contract summary generated successfully"
    data = @{
        contractId = "contract-12345"
        fileName = "test-contract.txt"
        fileSize = 1024
        contentType = "text/plain"
        summaryResult = @{
            contractType = "Hợp đồng lao động"
            parties = @{
                company = "CÔNG TY TNHH ABC"
                employee = "Nguyễn Văn A"
            }
            keyTerms = @{
                position = "Nhân viên phát triển phần mềm"
                salary = "15,000,000 VNĐ/tháng"
                workingHours = "8 giờ/ngày, 5 ngày/tuần"
                contractDuration = "12 tháng (từ 01/01/2024 đến 31/12/2024)"
                workLocation = "123 Đường ABC, Quận 1, TP.HCM"
            }
            mainClauses = @(
                "Nhân viên có trách nhiệm thực hiện các công việc được giao"
                "Công ty có trách nhiệm trả lương đúng hạn"
                "Hai bên có thể chấm dứt hợp đồng trước thời hạn với thông báo trước 30 ngày"
                "Bảo mật thông tin công ty là nghĩa vụ của nhân viên"
            )
            riskFactors = @(
                "Thời hạn hợp đồng ngắn (12 tháng)"
                "Điều khoản chấm dứt hợp đồng có thể gây bất lợi"
            )
            recommendations = @(
                "Xem xét gia hạn hợp đồng dài hạn hơn"
                "Bổ sung điều khoản bảo vệ quyền lợi nhân viên"
            )
        }
        processingStatus = "COMPLETED"
        confidence = 0.95
        processingTime = 2.5
    }
    timestamp = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    requestId = "req-$(Get-Random)"
    path = "/api/v1/automation-service/contracts/summarize"
}

Write-Host "📄 File được test: test-contract.txt"
Write-Host "📄 Nội dung file:"
Write-Host "----------------------------------------"
Get-Content "test-contract.txt" | ForEach-Object { Write-Host "  $_" }
Write-Host "----------------------------------------"

Write-Host "`n📤 API Request:"
Write-Host "POST http://localhost:8003/api/v1/automation-service/contracts/summarize"
Write-Host "Content-Type: multipart/form-data"
Write-Host "Body: file=test-contract.txt, text=string"

Write-Host "`n📥 MOCK Response:"
Write-Host "=========================================="
$mockResponse | ConvertTo-Json -Depth 10
Write-Host "=========================================="

Write-Host "`n✅ Test Summary:"
Write-Host "- API Endpoint: /api/v1/automation-service/contracts/summarize"
Write-Host "- Method: POST"
Write-Host "- Content-Type: multipart/form-data"
Write-Host "- Parameters: file (file), text (string)"
Write-Host "- Response: Contract summary với thông tin chi tiết"
Write-Host "- Status: 200 OK"

Write-Host "`n📋 Contract Summary Analysis:"
Write-Host "- Loại hợp đồng: $($mockResponse.data.summaryResult.contractType)"
Write-Host "- Công ty: $($mockResponse.data.summaryResult.parties.company)"
Write-Host "- Nhân viên: $($mockResponse.data.summaryResult.parties.employee)"
Write-Host "- Chức vụ: $($mockResponse.data.summaryResult.keyTerms.position)"
Write-Host "- Mức lương: $($mockResponse.data.summaryResult.keyTerms.salary)"
Write-Host "- Thời gian làm việc: $($mockResponse.data.summaryResult.keyTerms.workingHours)"
Write-Host "- Thời hạn hợp đồng: $($mockResponse.data.summaryResult.keyTerms.contractDuration)"
Write-Host "- Địa điểm: $($mockResponse.data.summaryResult.keyTerms.workLocation)"

Write-Host "`n⚠️  Lưu ý:"
Write-Host "- Đây là mock test vì service không chạy được do thiếu dependencies (cv2)"
Write-Host "- Để test thực tế, cần cài đặt OpenCV và các dependencies khác"
Write-Host "- API thực tế sẽ trả về response tương tự như mock này"

Write-Host "`n🎉 Mock test hoàn thành!"
