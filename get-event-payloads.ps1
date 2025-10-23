# Get Event Payloads from Automation Service Logs

Write-Host "`n=== EVENT PAYLOADS FOR: hop-dong-day-du.txt ===" -ForegroundColor Cyan
Write-Host "File ID: 6a243874-fe17-4a26-9d6d-9460ca779bf2`n" -ForegroundColor Yellow

# Get logs
$logs = docker-compose logs automation-service 2>&1

# Event 1: FILE_METADATA_RECORDED
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "EVENT 1: FILE_METADATA_RECORDED" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green

$event1 = $logs | Select-String -Pattern "topic=file.metadata.recorded.*preview=" -Context 0,0
if ($event1) {
    $payload = ($event1.Line -split "preview=", 2)[1]
    $payload | ConvertFrom-Json | ConvertTo-Json -Depth 10
} else {
    Write-Host "Event 1 payload not found in logs" -ForegroundColor Red
}

# Event 2: FILE_PLAINTEXT_EXTRACTED
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "EVENT 2: FILE_PLAINTEXT_EXTRACTED" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green

$event2 = $logs | Select-String -Pattern "topic=file.plaintext.extracted.*preview=" -Context 0,0
if ($event2) {
    $payload = ($event2.Line -split "preview=", 2)[1]
    # Truncate plaintext for readability
    $json = $payload | ConvertFrom-Json
    if ($json.data.plaintext) {
        $json.data.plaintext = $json.data.plaintext.Substring(0, [Math]::Min(200, $json.data.plaintext.Length)) + "..."
    }
    $json | ConvertTo-Json -Depth 10
} else {
    Write-Host "Event 2 payload not found in logs" -ForegroundColor Red
}

# Event 3: CONTRACT_SUMMARY_GENERATED
Write-Host "`n" + "="*80 -ForegroundColor Green
Write-Host "EVENT 3: CONTRACT_SUMMARY_GENERATED" -ForegroundColor Green
Write-Host "="*80 -ForegroundColor Green

$event3 = $logs | Select-String -Pattern "topic=contract.summary.generated.*preview=" -Context 0,0
if ($event3) {
    $payload = ($event3.Line -split "preview=", 2)[1]
    $payload | ConvertFrom-Json | ConvertTo-Json -Depth 10
} else {
    Write-Host "Event 3 payload not found in logs" -ForegroundColor Red
}

Write-Host "`n" + "="*80 -ForegroundColor Cyan
Write-Host "SUMMARY" -ForegroundColor Cyan
Write-Host "="*80 -ForegroundColor Cyan
Write-Host "Document ID: 6a243874-fe17-4a26-9d6d-9460ca779bf2"
Write-Host "File: hop-dong-day-du.txt"
Write-Host "Events: 3 (metadata, plaintext, contract)"
Write-Host ""
