# Check if consumer received events
$logs = docker-compose logs --tail=200 repository-management-service 2>&1

Write-Host "=== Searching for Kafka Consumer Activity ===" -ForegroundColor Cyan
Write-Host ""

# Check for Kafka listener started
$listenerLogs = $logs | Where-Object { $_ -match "KafkaListener|Started consuming|Consumer" }
if ($listenerLogs) {
    Write-Host "✅ Kafka Consumer Logs:" -ForegroundColor Green
    $listenerLogs | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "❌ No Kafka consumer logs found" -ForegroundColor Red
}

Write-Host ""

# Check for saved events
$savedLogs = $logs | Where-Object { $_ -match "Saved|fileId" }
if ($savedLogs) {
    Write-Host "✅ Events Saved:" -ForegroundColor Green
    $savedLogs | ForEach-Object { Write-Host "  $_" }
} else {
    Write-Host "❌ No saved events found" -ForegroundColor Red
}

Write-Host ""

# Check for errors
$errorLogs = $logs | Where-Object { $_ -match "Error|Exception|WARN" } | Select-Object -Last 10
if ($errorLogs) {
    Write-Host "⚠️  Recent Errors/Warnings:" -ForegroundColor Yellow
    $errorLogs | ForEach-Object { Write-Host "  $_" }
}
