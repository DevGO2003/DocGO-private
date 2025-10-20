$uri = "http://localhost:8003/api/v1/automation-service/files/"

$filePath = "test-upload-file.txt"

if (-not (Test-Path $filePath)) {
    Write-Host "File not found: $filePath" -ForegroundColor Red
    exit 1
}

$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileEnc = [System.Text.Encoding]::UTF8.GetString($fileBytes)

$boundary = [Guid]::NewGuid().ToString("N")
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=\"file\"; filename=\"$($filePath.Split('\')[-1])\"",
    "Content-Type: text/plain",
    $LF,
    $fileEnc,
    "--$boundary--"
) -join $LF

$headers = @{
    "accept" = "application/json"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
    $response = Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body ([System.Text.Encoding]::ASCII.GetBytes($bodyLines))
    Write-Host "Upload successful: " $response.StatusCode -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "Upload failed: " $_.Exception.Message -ForegroundColor Red
    Write-Host $_.Exception.Response -ForegroundColor Red
}

Write-Host "\n--- Logs Automation Service ---"

docker-compose logs --tail=20 automation-service

Write-Host "\n--- Logs File Management Service ---"

docker-compose logs --tail=20 file-management-service


$filePath = "test-upload-file.txt"

if (-not (Test-Path $filePath)) {
    Write-Host "File not found: $filePath" -ForegroundColor Red
    exit 1
}

$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileEnc = [System.Text.Encoding]::UTF8.GetString($fileBytes)

$boundary = [Guid]::NewGuid().ToString("N")
$LF = "`r`n"

$bodyLines = @(
    "--$boundary",
    "Content-Disposition: form-data; name=\"file\"; filename=\"$($filePath.Split('\')[-1])\"",
    "Content-Type: text/plain",
    $LF,
    $fileEnc,
    "--$boundary--"
) -join $LF

$headers = @{
    "accept" = "application/json"
    "Content-Type" = "multipart/form-data; boundary=$boundary"
}

try {
    $response = Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body ([System.Text.Encoding]::ASCII.GetBytes($bodyLines))
    Write-Host "Upload successful: " $response.StatusCode -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor Green
} catch {
    Write-Host "Upload failed: " $_.Exception.Message -ForegroundColor Red
    Write-Host $_.Exception.Response -ForegroundColor Red
}

Write-Host "\n--- Logs Automation Service ---"

docker-compose logs --tail=20 automation-service

Write-Host "\n--- Logs File Management Service ---"

docker-compose logs --tail=20 file-management-service

































































