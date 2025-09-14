# DocGO Simplified Environment Setup Script
Write-Host "🚀 Setting up DocGO Simplified Environment..." -ForegroundColor Green

# Copy environment template
if (Test-Path "env.simplified") {
    Copy-Item "env.simplified" ".env"
    Write-Host "✅ Environment template copied from env.simplified to .env" -ForegroundColor Yellow
} else {
    Write-Host "❌ env.simplified file not found. Please create it first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 Please configure the following in your .env file:" -ForegroundColor Cyan
Write-Host "1. MongoDB Atlas URI (MONGODB_ATLAS_URI)" -ForegroundColor White
Write-Host "2. Redis Cloud credentials (REDIS_CLOUD_HOST, REDIS_CLOUD_PORT, REDIS_CLOUD_PASSWORD)" -ForegroundColor White
Write-Host "3. JWT Secret (JWT_SECRET)" -ForegroundColor White
Write-Host "4. Gemini API Key (GEMINI_API_KEY)" -ForegroundColor White
Write-Host "5. S3/Filebase credentials (S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET_NAME)" -ForegroundColor White
Write-Host "6. SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD)" -ForegroundColor White
Write-Host ""
Write-Host "🔧 After configuration, you can run:" -ForegroundColor Green
Write-Host "   docker-compose -f script/docker-compose.dev.yml up -d" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 For more details, check the documentation in each service's 'How to run this microservice.md' file" -ForegroundColor Blue
