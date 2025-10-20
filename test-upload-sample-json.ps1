# Test upload document-management-sample.json and get one from repository-management-service
$filePath = ".cursor/documents/api-docs/document-management-sample.json"
$automationUrl = "http://localhost:8003/api/v1/automation-service/files"
$repositoryUrlBase = "http://localhost:8002/api/v1/repository-management-service/files"

Write-Host "TEST UPLOAD SAMPLE.JSON"
Write-Host "========================"
Write-Host "File: $filePath"
Write-Host "Automation URL: $automationUrl"

# Test upload file
Write-Host "`nUploading file..."
try {
    $boundary = "----$([System.Guid]::NewGuid().ToString())"
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $fileName = Split-Path -Path $filePath -Leaf

    $request = [System.Net.HttpWebRequest]::Create($automationUrl)
    $request.Method = "POST"
    $request.ContentType = "multipart/form-data; boundary=$boundary"

    $LF = "`r`n"
    $bodyStart = "--$boundary$LF" +
                 "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`"$LF" +
                 "Content-Type: application/json$LF$LF"
    
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
    Write-Host "Response from Automation Service:"
    $response | ConvertTo-Json -Depth 5
    
    # Get file ID from the response
    $fileId = $response.data.documentId
    Write-Host "`nDocument ID: $fileId"
    
    # Wait for processing via Kafka
    Write-Host "`nWaiting for event processing (15 seconds)..."
    Start-Sleep -Seconds 15
    
    # Test GET ONE API from Repository Management Service
    Write-Host "`nTesting GET ONE API from Repository Service..."
    $getUrl = "$repositoryUrlBase/$fileId"
    Write-Host "GET URL: $getUrl"
    
    try {
        $getResponse = Invoke-RestMethod -Uri $getUrl -Method Get
        Write-Host "GET ONE successful!"
        Write-Host "GET Response from Repository Service:"
        $getResponse | ConvertTo-Json -Depth 10
    } catch {
        Write-Host "GET ONE failed: $($_.Exception.Message)"
        Write-Host "Response: $($_.Exception.Response)"
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
