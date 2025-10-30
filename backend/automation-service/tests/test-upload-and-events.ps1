param(
    [string]$FilePath = "P:\DevGO2003\DocGO-private-new\documents\.docx\luu-ban-nhap-tu-dong-2.docx",
    [string]$LogDir = ".\logs"
)

if (-not (Test-Path $LogDir)) {
    New-Item -ItemType Directory -Path $LogDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$logFile = Join-Path $LogDir "test-events_$timestamp.log"

function Write-Log {
    param([string]$Message, [string]$ForegroundColor = "White")
    Write-Host $Message -ForegroundColor $ForegroundColor
    Add-Content -Path $logFile -Value $Message
}

Write-Log "========================================" "Cyan"
Write-Log "TEST UPLOAD & EVENT PUBLISHING" "Cyan"
Write-Log "========================================" "Cyan"
Write-Log "Log file: $logFile" "Gray"
Write-Log "" "White"

Write-Log "[1] Uploading file..." "Yellow"
$uri = "http://localhost:8003/api/v1/automation-service/files"

# Use PowerShell's built-in multipart form data handling
$fileItem = Get-Item $FilePath

try {
    $repositoryId = "repo-" + [guid]::NewGuid().ToString().Substring(0, 8)
    
    # Use Invoke-WebRequest with multipart/form-data
    $fileContent = [System.IO.File]::ReadAllBytes($fileItem.FullName)
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = New-Object System.Collections.ArrayList
    [void]$bodyLines.Add("--$boundary")
    [void]$bodyLines.Add("Content-Disposition: form-data; name=`"file`"; filename=`"$($fileItem.Name)`"")
    [void]$bodyLines.Add("Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document")
    [void]$bodyLines.Add("")
    [void]$bodyLines.Add([System.Text.Encoding]::GetEncoding("iso-8859-1").GetString($fileContent))
    [void]$bodyLines.Add("--$boundary")
    [void]$bodyLines.Add("Content-Disposition: form-data; name=`"repository_id`"")
    [void]$bodyLines.Add("")
    [void]$bodyLines.Add($repositoryId)
    [void]$bodyLines.Add("--$boundary--")
    
    $bodyString = $bodyLines -join $LF
    $bodyBytes = [System.Text.Encoding]::GetEncoding("iso-8859-1").GetBytes($bodyString)
    
    $headers = @{
        "Content-Type" = "multipart/form-data; boundary=$boundary"
    }
    
    try {
        $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $bodyBytes -ContentType "multipart/form-data; boundary=$boundary"
    }
    catch {
        # Try alternative method with simpler approach
        Write-Log "Trying alternative upload method..." "Yellow"
        $form = @{
            file = Get-Item $FilePath
            repository_id = $repositoryId
        }
        $response = Invoke-RestMethod -Uri $uri -Method Post -Form $form
    }
    
    Write-Log "[SUCCESS] Upload completed!" "Green"
    Write-Log "  File ID: $($response.data.fileId)" "White"
    Write-Log "  Repository ID: $repositoryId" "Cyan"
    Write-Log "  Correlation ID: $($response.data.correlationId)" "Gray"
    Write-Log "" "White"
    
    $fileId = $response.data.fileId
    
    Write-Log "Event processing..." "Yellow"
    Write-Log "Waiting 5 seconds for background processing..." "Gray"
    Start-Sleep -Seconds 5
    Write-Log "" "White"
    
    Write-Log "[3] Checking automation service logs..." "Yellow"
    Write-Log "----------------------------------------" "Gray"
    
    $logs = docker logs automation-service --tail 100 2>&1 | Out-String
    
    $eventLogs = $logs -split "`n" | Where-Object {
        $_ -match "Published.*topic=docgo-file-events" -or
        $_ -match "eventType=" -or
        $_ -match "fileId=$fileId" -or
        $_ -match "Summary result:" -or
        $_ -match "Classification result:" -or
        $_ -match "AI Classification result:" -or
        $_ -match "Contract condition check:"
    }
    
    $events = @()
    
    if ($eventLogs.Count -gt 0) {
        foreach ($log in $eventLogs) {
            if ($log -match "FILE_UPLOAD_COMPLETED") {
                Write-Log "  [OK] FILE_UPLOAD_COMPLETED" "Green"
                $events += "FILE_UPLOAD_COMPLETED"
            }
            elseif ($log -match "FILE_CONTENT_EXTRACTED") {
                Write-Log "  [OK] FILE_CONTENT_EXTRACTED" "Green"
                $events += "FILE_CONTENT_EXTRACTED"
            }
            elseif ($log -match "CONTRACT_SUMMARY_GENERATED") {
                Write-Log "  [OK] CONTRACT_SUMMARY_GENERATED" "Green"
                $events += "CONTRACT_SUMMARY_GENERATED"
            }
            elseif ($log -match "AI Classification result:") {
                Write-Log "  [INFO] AI Classification found" "Cyan"
            }
            elseif ($log -match "Summary result:") {
                Write-Log "  [INFO] Contract Summary found" "Cyan"
            }
            elseif ($log -match "Contract condition check:") {
                Write-Log "  [INFO] Contract condition evaluated" "Cyan"
            }
        }
    }
    else {
        Write-Log "  [WARN] No events found in logs" "Yellow"
    }
    
    Write-Log "" "White"
    Write-Log "[4] Event Summary" "Yellow"
    Write-Log "----------------------------------------" "Gray"
    Write-Log "Total events captured: $($events.Count)" "White"
    Write-Log "Events: $($events -join ', ')" "White"
    Write-Log "" "White"
    
    Write-Log "[5] Full logs (last 100 lines)..." "Yellow"
    Write-Log "----------------------------------------" "Gray"
    
    $fullLogs = docker logs automation-service --tail 100 2>&1
    foreach ($line in $fullLogs) {
        Write-Log $line "White"
    }
}
catch {
    Write-Log "[ERROR] Upload FAILED!" "Red"
    Write-Log "Error: $($_.Exception.Message)" "Yellow"
}

Write-Log "" "White"
Write-Log "========================================" "Cyan"
Write-Log "TEST COMPLETED" "Cyan"
Write-Log "========================================" "Cyan"
Write-Log "Log file saved: $logFile" "Gray"
Write-Log "" "White"

Write-Host ""
Write-Host "[LOG] Log file: $logFile" -ForegroundColor Gray
