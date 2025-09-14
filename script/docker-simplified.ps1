Write-Host "Starting DocGO Simplified Architecture..." -ForegroundColor Green
docker-compose -f script/docker-compose.simplified.yml --env-file script/env.simplified up -d
Write-Host "DocGO Simplified Architecture started!" -ForegroundColor Green
Write-Host ""
Write-Host "Services:" -ForegroundColor Yellow
Write-Host "- API Gateway: http://localhost:8000" -ForegroundColor Cyan
Write-Host "- Auth Service: http://localhost:8001" -ForegroundColor Cyan
Write-Host "- Contract Service: http://localhost:8002" -ForegroundColor Cyan
Write-Host "- AI Service: http://localhost:8003" -ForegroundColor Cyan
Write-Host "- File Service: http://localhost:8004" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to stop services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
docker-compose -f script/docker-compose.simplified.yml down
