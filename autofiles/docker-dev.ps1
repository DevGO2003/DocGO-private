# DocGO - Docker Development Mode
# Chay toan bo service backend voi volume mount
# Code se duoc sync truc tiep tu may host

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "DocGO - Docker Development Mode" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Chay toan bo service backend voi volume mount" -ForegroundColor Yellow
Write-Host "Code se duoc sync truc tiep tu may host" -ForegroundColor Yellow
Write-Host ""

Write-Host "Ports:" -ForegroundColor Green
Write-Host "- API Gateway BFF: http://localhost:8000" -ForegroundColor White
Write-Host "- Auth Service: http://localhost:8001" -ForegroundColor White
Write-Host "- User Management: http://localhost:8002" -ForegroundColor White
Write-Host "- Contract Management: http://localhost:8003" -ForegroundColor White
Write-Host "- AI Processing: http://localhost:8017" -ForegroundColor White
Write-Host "- File Storage: http://localhost:8012" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "- Database: localhost:3306" -ForegroundColor White
Write-Host "- Redis: localhost:6379" -ForegroundColor White
Write-Host ""

# Kiem tra Docker
Write-Host "Kiem tra Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker khong duoc cai dat hoac khong chay" -ForegroundColor Red
    Write-Host "Hay cai dat Docker Desktop va khoi dong lai" -ForegroundColor Red
    Read-Host "Nhan Enter de thoat"
    exit 1
}

# Kiem tra Docker Compose
Write-Host "Kiem tra Docker Compose..." -ForegroundColor Yellow
try {
    $composeVersion = docker-compose --version
    Write-Host "✓ Docker Compose: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Docker Compose khong duoc cai dat" -ForegroundColor Red
    Read-Host "Nhan Enter de thoat"
    exit 1
}

Write-Host ""
Write-Host "Bat dau chay cac service..." -ForegroundColor Yellow
Write-Host ""

# Dung cac container cu neu co
Write-Host "Dung cac container cu..." -ForegroundColor Yellow
docker-compose -f autofiles/docker-compose.dev.yml down

# Xoa cac container va network cu
Write-Host "Xoa cac container va network cu..." -ForegroundColor Yellow
docker system prune -f

# Chay cac service
Write-Host "Chay cac service..." -ForegroundColor Yellow
docker-compose -f autofiles/docker-compose.dev.yml up -d

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Da chay xong! Kiem tra trang thai:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
docker-compose -f autofiles/docker-compose.dev.yml ps

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Logs cua cac service:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Xem logs: docker-compose -f autofiles/docker-compose.dev.yml logs -f [service-name]" -ForegroundColor White
Write-Host "Dung tat ca: docker-compose -f autofiles/docker-compose.dev.yml down" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Ban co muon xem logs ngay bay gio? (y/n)"
if ($choice -eq "y" -or $choice -eq "Y") {
    Write-Host ""
    Write-Host "Hien thi logs cua tat ca service..." -ForegroundColor Yellow
docker-compose -f autofiles/docker-compose.dev.yml logs -f
} else {
    Write-Host ""
    Write-Host "De xem logs sau, chay: docker-compose -f autofiles/docker-compose.dev.yml logs -f" -ForegroundColor Green
Write-Host "De dung tat ca service: docker-compose -f autofiles/docker-compose.dev.yml down" -ForegroundColor Green
}
