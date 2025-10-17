# Test automation-service directly
$filePath = "test-upload-json.json"
$uri = "http://localhost:8003/api/v1/automation-service/files"

Write-Host "Testing automation-service directly: $uri"
Write-Host "File: $filePath"

try {
    $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"test-upload-json.json`"",
        "Content-Type: application/json",
        "",
        [System.Text.Encoding]::UTF8.GetString($fileBytes),
        "--$boundary--",
        ""
    ) -join $LF
    
    $response = Invoke-WebRequest -Uri $uri -Method POST -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "Status: $($response.StatusCode)"
    Write-Host "Response:"
    Write-Host $response.Content
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
