# Test upload hop-dong-day-du.txt and get one
$filePath = "hop-dong-day-du.txt"
$url = "http://localhost:8003/api/v1/automation-service/files"

Write-Host "TEST UPLOAD HOP-DONG-DAY-DU.TXT"
Write-Host "================================"
Write-Host "File: $filePath"
Write-Host "URL: $url"

# Test upload file
Write-Host "`nUploading file..."
try {
        $boundary = "----$([System.Guid]::NewGuid().ToString())"
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $fileName = Split-Path -Path $filePath -Leaf

    # Use HttpWebRequest for more control over the multipart/form-data request
    $request = [System.Net.HttpWebRequest]::Create($url)
    $request.Method = "POST"
    $request.ContentType = "multipart/form-data; boundary=$boundary"

    $LF = "`r`n"
    $bodyStart = "--$boundary$LF" +
                 "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"$LF" +
                 "Content-Type: application/octet-stream$LF$LF"

    $bodyEnd = "$LF--$boundary--$LF"

    $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyStart) + $fileBytes + [System.Text.Encoding]::UTF8.GetBytes($bodyEnd)
    $request.ContentLength = $bodyBytes.Length

    $requestStream = $request.GetRequestStream()
    $requestStream.Write($bodyBytes, 0, $bodyBytes.Length)
    $requestStream.Close()

    $webResponse = $request.GetResponse()
    $responseStream = $webResponse.GetResponseStream()
    $streamReader = New-Object System.IO.StreamReader($responseStream)
    $responseJson = $streamReader.ReadToEnd()
    $response = $responseJson | ConvertFrom-Json
    Write-Host "Upload successful!"
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 3
    
    # Get file ID
    $fileId = $response.data.fileId
    Write-Host "`nFile ID: $fileId"
    
    # Wait for processing
    Write-Host "`nWaiting for processing (10 seconds)..."
    Start-Sleep -Seconds 10
    
    # Test GET ONE API
    Write-Host "`nTesting GET ONE API..."
    $getUrl = "http://localhost:8003/api/v1/automation-service/files/" + $fileId
    Write-Host "GET URL: $getUrl"
    
    try {
        $getResponse = Invoke-RestMethod -Uri $getUrl -Method Get
        Write-Host "GET ONE successful!"
        Write-Host "GET Response:"
        $getResponse | ConvertTo-Json -Depth 3
    } catch {
        Write-Host "GET ONE failed: $($_.Exception.Message)"
    }
    
} catch {
    Write-Host "Upload failed: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}

# Check logs
Write-Host "`nCHECKING LOGS..."
Write-Host "================="

Write-Host "`nAutomation Service Logs:"
docker-compose logs --tail=15 automation-service

Write-Host "`nRepository Management Service Logs:"
docker-compose logs --tail=15 repository-management-service

Write-Host "`nTest completed!"
