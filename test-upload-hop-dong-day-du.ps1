$uri = "http://localhost:8003/api/v1/automation-service/files"
$filePath = "hop-dong-day-du.txt"

Write-Host "Uploading file: $filePath" -ForegroundColor Cyan

$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBytes)

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$filePath`"",
    "Content-Type: text/plain$LF",
    $fileEnc,
    "--$boundary--$LF"
) -join $LF

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "multipart/form-data; boundary=$boundary" -Body $bodyLines
    
    Write-Host "`n=== UPLOAD RESPONSE ===" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    if ($response.data.documentId) {
        Write-Host "`n=== FILE ID: $($response.data.documentId) ===" -ForegroundColor Yellow
        
        # Save fileId for next test
        $response.data.documentId | Out-File -FilePath "last-file-id.txt" -NoNewline
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
