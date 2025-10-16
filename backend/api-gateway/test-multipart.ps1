# Test multipart form upload
$ErrorActionPreference = 'Stop'

$filePath = "sample.txt"
$url = "http://localhost:8003/api/v1/automation-service/files/upload?folder=documents&user_id=system"

# Create proper multipart form data
$boundary = [System.Guid]::NewGuid().ToString()
$LF = "`r`n"

# Read file content
$fileContent = [System.IO.File]::ReadAllBytes($filePath)
$fileName = [System.IO.Path]::GetFileName($filePath)

# Build multipart body
$bodyLines = @()
$bodyLines += "--$boundary"
$bodyLines += "Content-Disposition: form-data; name=`"file`"; filename=`"$fileName`""
$bodyLines += "Content-Type: text/plain"
$bodyLines += ""
$bodyLines += [System.Text.Encoding]::UTF8.GetString($fileContent)
$bodyLines += "--$boundary--"

$body = $bodyLines -join $LF

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary"
    Write-Host "Upload successful:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Upload failed:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}
