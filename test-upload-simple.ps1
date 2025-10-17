# Test upload JSON file
$filePath = "test-upload-json.json"
$uri = "http://localhost:8000/api/files/upload"

Write-Host "Testing upload to: $uri"
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
    Write-Host "Response: $($_.Exception.Response)"
}
