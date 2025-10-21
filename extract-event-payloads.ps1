Write-Host "=== EXTRACTING EVENT PAYLOADS ===" -ForegroundColor Cyan

$fileId = "75154504-ee37-4582-8d47-5264798c3999"

Write-Host "`n1. FILE_METADATA_RECORDED payload:" -ForegroundColor Yellow
docker-compose logs automation-service --since 5m 2>&1 | Where-Object { $_ -match "file.metadata.recorded.*$fileId" } | ForEach-Object {
    if ($_ -match '"data":\s*(\{.+\})') {
        $matches[1] | Out-File "event1-metadata.json" -Encoding UTF8
        Write-Host "Saved to: event1-metadata.json" -ForegroundColor Green
    }
}

Write-Host "`n2. FILE_CONTENT_EXTRACTED payload:" -ForegroundColor Yellow
docker-compose logs automation-service --since 5m 2>&1 | Where-Object { $_ -match "file.plaintext.extracted.*$fileId" } | ForEach-Object {
    if ($_ -match '"data":\s*(\{.+\})') {
        $matches[1] | Out-File "event2-content.json" -Encoding UTF8
        Write-Host "Saved to: event2-content.json" -ForegroundColor Green
    }
}

Write-Host "`n3. CONTRACT_SUMMARY_GENERATED payload:" -ForegroundColor Yellow
docker-compose logs automation-service --since 5m 2>&1 | Where-Object { $_ -match "contract.summary.generated.*$fileId" } | ForEach-Object {
    if ($_ -match '"data":\s*(\{.+\})') {
        $matches[1] | Out-File "event3-contract.json" -Encoding UTF8
        Write-Host "Saved to: event3-contract.json" -ForegroundColor Green
    }
}

Write-Host "`n=== EXTRACTING FULL EVENT LOGS ===" -ForegroundColor Cyan
docker-compose logs automation-service --since 5m 2>&1 | Where-Object { $_ -match "Kafka publish.*contract.summary.generated" } -Context 0,15 | Select-Object -Last 20 | Out-File "kafka-publish-logs.txt" -Encoding UTF8
Write-Host "Saved to: kafka-publish-logs.txt"
