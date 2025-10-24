#!/usr/bin/env pwsh
# Debug Automation & Repository Services Side-by-Side

Write-Host "=== Debugging Automation & Repository Services ===" -ForegroundColor Cyan
Write-Host ""

# Check services status
Write-Host "[1] Services Status:" -ForegroundColor Yellow
docker ps --filter name=automation-service --filter name=repository-management-service --format "{{.Names}} - {{.Status}}"

Write-Host "`n[2] Kafka Topics:" -ForegroundColor Yellow
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list 2>$null | Select-String "docgo-file-events"

Write-Host "`n[3] Recent Logs (Last 30 lines):" -ForegroundColor Yellow

Write-Host "`n--- Automation Service ---" -ForegroundColor Cyan
docker logs automation-service --tail 30 2>&1 | Select-Object -Last 30

Write-Host "`n--- Repository Service ---" -ForegroundColor Green
docker logs repository-management-service --tail 30 2>&1 | Select-Object -Last 30

Write-Host "`n[4] Follow Logs Command:" -ForegroundColor Yellow
Write-Host "Mở 2 terminal mới và chạy:" -ForegroundColor White
Write-Host "  Terminal 1: docker logs -f automation-service" -ForegroundColor Gray
Write-Host "  Terminal 2: docker logs -f repository-management-service" -ForegroundColor Gray

Write-Host "`n[5] Test Upload Command:" -ForegroundColor Yellow
Write-Host "curl -X POST http://localhost:8003/api/v1/automation-service/files -F 'file=@.cursor/documents/.docx/luu-ban-nhap-tu-dong-2.docx'" -ForegroundColor Gray

Write-Host "`n=== Ready for Debugging ===" -ForegroundColor Green
