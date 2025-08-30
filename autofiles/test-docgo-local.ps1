# Test Script cho DocGO Local Environment
# Kiểm tra tất cả services đang chạy

Write-Host "🚀 Testing DocGO Local Environment..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test Infrastructure Services
Write-Host "`n📊 Testing Infrastructure Services..." -ForegroundColor Yellow

# Test MariaDB
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3306" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ MariaDB (Port 3306): Running" -ForegroundColor Green
} catch {
    Write-Host "❌ MariaDB (Port 3306): Not accessible" -ForegroundColor Red
}

# Test Redis
try {
    $response = Invoke-WebRequest -Uri "http://localhost:6379" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Redis (Port 6379): Running" -ForegroundColor Green
} catch {
    Write-Host "❌ Redis (Port 6379): Not accessible" -ForegroundColor Red
}

# Test Elasticsearch
try {
    $response = Invoke-WebRequest -Uri "http://localhost:9200" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Elasticsearch (Port 9200): Running" -ForegroundColor Green
} catch {
    Write-Host "❌ Elasticsearch (Port 9200): Not accessible" -ForegroundColor Red
}

# Test Microservices
Write-Host "`n🔧 Testing Microservices..." -ForegroundColor Yellow

# Test API Gateway BFF
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ API Gateway BFF (Port 8000): Running - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Gateway BFF (Port 8000): Not accessible" -ForegroundColor Red
}

# Test File Storage Asset Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8012/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ File Storage Asset Service (Port 8012): Running - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ File Storage Asset Service (Port 8012): Not accessible" -ForegroundColor Red
}

# Test AI Processing Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8017/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ AI Processing Service (Port 8017): Running - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ AI Processing Service (Port 8017): Not accessible" -ForegroundColor Red
}

# Test Contract Management Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Contract Management Service (Port 8003): Running - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Contract Management Service (Port 8003): Not accessible" -ForegroundColor Red
}

# Test General File Management Service
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8018/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ General File Management Service (Port 8018): Running - Status: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ General File Management Service (Port 8018): Not accessible" -ForegroundColor Red
}

# Test API Documentation
Write-Host "`n📚 Testing API Documentation..." -ForegroundColor Yellow

# Test AI Processing Service Docs
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8017/docs" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ AI Processing Service Docs: http://localhost:8017/docs" -ForegroundColor Green
} catch {
    Write-Host "❌ AI Processing Service Docs: Not accessible" -ForegroundColor Red
}

# Test General File Management Service Docs
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8018/docs" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ General File Management Service Docs: http://localhost:8018/docs" -ForegroundColor Green
} catch {
    Write-Host "❌ General File Management Service Docs: Not accessible" -ForegroundColor Red
}

# Test File Storage Asset Service Docs
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8012/docs" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ File Storage Asset Service Docs: http://localhost:8012/docs" -ForegroundColor Green
} catch {
    Write-Host "❌ File Storage Asset Service Docs: Not accessible" -ForegroundColor Red
}

Write-Host "`n🎯 Test Summary:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan
Write-Host "• Infrastructure: MariaDB, Redis, Elasticsearch" -ForegroundColor White
Write-Host "• Microservices: 5 services với volume mount" -ForegroundColor White
Write-Host "• API Documentation: /docs endpoints" -ForegroundColor White
Write-Host "• Hot Reload: Code changes sẽ được reflect ngay" -ForegroundColor White

Write-Host "`n🚀 DocGO Local Environment đã sẵn sàng!" -ForegroundColor Green
Write-Host "Bạn có thể bắt đầu test flow upload file:" -ForegroundColor Yellow
Write-Host "1. Upload file -> File Storage Service (8012)" -ForegroundColor White
Write-Host "2. AI Processing -> AI Service (8017)" -ForegroundColor White
Write-Host "3. Contract/General Classification -> Contract/General Service" -ForegroundColor White
