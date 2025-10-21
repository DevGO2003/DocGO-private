$fileId = "75154504"

docker-compose logs automation-service --tail 300 2>&1 | Where-Object { $_ -like "*$fileId*" } | Out-File "raw-logs.txt" -Encoding UTF8

Write-Host "Saved to: raw-logs.txt"
Get-Content "raw-logs.txt" | Select-Object -First 50
