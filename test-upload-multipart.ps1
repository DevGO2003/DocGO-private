# Test upload hop-dong-day-du.txt with proper multipart form data
$filePath = "hop-dong-day-du.txt"
$url = "http://localhost:8003/api/v1/automation-service/files"

Write-Host "Testing upload hop-dong-day-du.txt with multipart form data..."
Write-Host "File: $filePath"
Write-Host "URL: $url"

# Create multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

$fileBytes = [System.IO.File]::ReadAllBytes($filePath)
$fileEnc = [System.Text.Encoding]::GetEncoding('UTF-8').GetString($fileBytes)

$bodyLines = (
    "--$boundary",
    "Content-Disposition: form-data; name=`"file`"; filename=`"$filePath`"",
    "Content-Type: text/plain$LF",
    $fileEnc,
    "--$boundary--$LF"
) -join $LF

try {
    # Upload file with multipart form data
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    Write-Host "Upload response:"
    $response | ConvertTo-Json -Depth 3

    # Wait for processing
    Start-Sleep -Seconds 5

    # Get the file ID from response
    $fileId = $response.data.fileId
    Write-Host "File ID: $fileId"

    # Test get one API
    Write-Host "Testing GET ONE API..."
    $getUrl = "http://localhost:8003/api/v1/automation-service/files/" + $fileId
    Write-Host "GET URL: $getUrl"

    try {
        $getResponse = Invoke-RestMethod -Uri $getUrl -Method Get
        Write-Host "GET ONE response:"
        $getResponse | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "GET ONE error: $($_.Exception.Message)"
    }

} catch {
    Write-Host "Upload error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}

# Check logs
Write-Host "`n=== AUTOMATION SERVICE LOGS ==="
docker-compose logs --tail=10 automation-service

Write-Host "`n=== REPOSITORY MANAGEMENT SERVICE LOGS ==="
docker-compose logs --tail=10 repository-management-service
