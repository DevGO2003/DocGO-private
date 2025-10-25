# Test Upload DOCX and Monitor Events
# Mục đích: Upload file, theo dõi event publishing và xem kết quả contract summary

param(
    [string]$FilePath = "P:\DevGO2003\DocGO-private-new\.cursor\documents\.docx\luu-ban-nhap-tu-dong-2.docx"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST UPLOAD & EVENT PUBLISHING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Upload file
Write-Host "[1] Uploading file..." -ForegroundColor Yellow
$uri = "http://localhost:8003/api/v1/automation-service/files"

$fileBytes = [System.IO.File]::ReadAllBytes((Resolve-Path $FilePath))
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$bodyLines = @()
$bodyLines += "--$boundary"
$bodyLines += 'Content-Disposition: form-data; name="file"; filename="luu-ban-nhap-tu-dong-2.docx"'
$bodyLines += 'Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document'
$bodyLines += ''

$encoding = [System.Text.Encoding]::GetEncoding('iso-8859-1')
$bodyLines += $encoding.GetString($fileBytes)
$bodyLines += "--$boundary--"

$body = $bodyLines -join $LF

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $body
    
    Write-Host "[SUCCESS] Upload completed!" -ForegroundColor Green
    Write-Host "  File ID: $($response.data.fileId)" -ForegroundColor White
    Write-Host "  Correlation ID: $($response.data.correlationId)" -ForegroundColor Gray
    Write-Host ""
    
    $fileId = $response.data.fileId
    
    # Step 2: Wait for processing
    Write-Host "Event processing..." -ForegroundColor Yellow
    Write-Host ""
    
    # Step 3: Check logs for events
    Write-Host "[3] Checking automation service logs..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    $logs = docker logs automation-service --tail 50 2>&1 | Out-String
    
    # Filter relevant logs
    $eventLogs = $logs -split "`n" | Where-Object {
        $_ -match "Published.*topic=docgo-file-events" -or
        $_ -match "eventType=" -or
        $_ -match "fileId=$fileId" -or
        $_ -match "\[JSON_PARSE\]" -or
        $_ -match "Summary result:" -or
        $_ -match "Classification result:"
    }
    
    if ($eventLogs.Count -gt 0) {
        foreach ($log in $eventLogs) {
            if ($log -match "FILE_UPLOAD_COMPLETED") {
                Write-Host "  [OK] FILE_UPLOAD_COMPLETED" -ForegroundColor Green
            }
            elseif ($log -match "FILE_CONTENT_EXTRACTED") {
                Write-Host "  [OK] FILE_CONTENT_EXTRACTED" -ForegroundColor Green
            }
            elseif ($log -match "CONTRACT_SUMMARY_GENERATED") {
                Write-Host "  [OK] CONTRACT_SUMMARY_GENERATED" -ForegroundColor Green
            }
            elseif ($log -match "Classification result:") {
                Write-Host "  [INFO] Classification found" -ForegroundColor Cyan
            }
            elseif ($log -match "Summary result:") {
                Write-Host "  [INFO] Summary found" -ForegroundColor Cyan
            }
            elseif ($log -match "JSON_PARSE") {
                Write-Host "  [DEBUG] JSON parsing log found" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  [WARN] No events found in logs" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "[4] Full logs (last 100 lines)..." -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    # Show last 100 lines of logs
    docker logs automation-service --tail 100 2>&1
    
} catch {
    Write-Host "[ERROR] Upload FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
