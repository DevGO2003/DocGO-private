# Upload a file to automation-service to trigger Kafka events
param(
    [string]$FilePath = "test-upload.txt",
    [string]$Url = "http://localhost:8003/api/v1/automation-service/files"
)

if(-not (Test-Path $FilePath)){
    Write-Host "File not found: $FilePath" -ForegroundColor Red
    exit 1
}

$bytes = [System.IO.File]::ReadAllBytes($FilePath)
$boundary = [guid]::NewGuid().ToString()
$LF = "`r`n"

$body = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$([System.IO.Path]::GetFileName($FilePath))`"",
    "Content-Type: text/plain",
    "",
    [System.Text.Encoding]::UTF8.GetString($bytes),
    "--$boundary--",
    ""
) -join $LF

Write-Host "POST $Url (boundary=$boundary)" -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri $Url -Method POST -Body $body -ContentType "multipart/form-data; boundary=$boundary"
Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
Write-Output $response.Content


