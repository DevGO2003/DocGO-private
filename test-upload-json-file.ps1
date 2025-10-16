# Test upload JSON file through API Gateway to Automation Service

$ErrorActionPreference = "Stop"

$API_URL = "http://localhost:8000/api/files/upload?folder=documents&user_id=user123"
$JSON_FILE = "test-upload-json.json"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "🧪 Test Upload JSON File" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Check if file exists
if (-not (Test-Path $JSON_FILE)) {
    Write-Host "❌ File không tồn tại: $JSON_FILE" -ForegroundColor Red
    exit 1
}

Write-Host "`n📁 File: $JSON_FILE" -ForegroundColor Yellow
Write-Host "🌐 URL: $API_URL" -ForegroundColor Yellow
Write-Host ""

try {
    # Read file content for display
    $jsonContent = Get-Content $JSON_FILE -Raw
    Write-Host "📄 Nội dung file JSON:" -ForegroundColor Green
    Write-Host $jsonContent -ForegroundColor White
    
    Write-Host "`n🚀 Đang upload file..." -ForegroundColor Yellow
    
    # Upload file using curl (better for multipart/form-data)
    $curlCommand = "curl -X POST `"$API_URL`" -F `"file=@$JSON_FILE`" -H `"X-User-ID: user123`" -w `"\nHTTP_CODE=%{http_code}\n`" -v"
    
    Write-Host "Command: $curlCommand" -ForegroundColor Cyan
    Write-Host ""
    
    $response = Invoke-Expression $curlCommand
    
    Write-Host "`n📥 Response:" -ForegroundColor Green
    Write-Host $response -ForegroundColor White
    
    # Check HTTP code
    if ($response -match "HTTP_CODE=(\d+)") {
        $httpCode = $Matches[1]
        Write-Host "`n📊 HTTP Status Code: $httpCode" -ForegroundColor Cyan
        
        if ($httpCode -eq "200" -or $httpCode -eq "201" -or $httpCode -eq "202") {
            Write-Host "✅ Upload thành công!" -ForegroundColor Green
        } else {
            Write-Host "❌ Upload thất bại với code: $httpCode" -ForegroundColor Red
        }
    }
    
    Write-Host "`n===================================" -ForegroundColor Cyan
    Write-Host "✅ Test hoàn tất!" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Lỗi: $_" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

