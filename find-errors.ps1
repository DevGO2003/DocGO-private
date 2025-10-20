$logs = docker-compose logs --tail=1000 repository-management-service 2>&1

Write-Host "=== Searching for 'Saved' messages ===" -ForegroundColor Cyan
$savedLogs = $logs | Where-Object { $_ -like "*Saved*" }
if ($savedLogs.Count -gt 0) {
    $savedLogs | ForEach-Object { Write-Host $_ -ForegroundColor Green }
} else {
    Write-Host "No 'Saved' messages found" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Searching for errors ===" -ForegroundColor Cyan
$errorLogs = $logs | Where-Object { $_ -like "*Error*" -or $_ -like "*Exception*" -or $_ -like "*Failed*" }
if ($errorLogs.Count -gt 0) {
    $errorLogs | Select-Object -Last 20 | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
} else {
    Write-Host "No errors found" -ForegroundColor Green
}
