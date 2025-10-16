$ErrorActionPreference = 'Stop'

param(
    [string]$FilePath = "./sample.txt",
    [string]$Folder = "documents", 
    [string]$UserId = "system",
    [string]$GatewayUrl = "http://localhost:8000/api/files/upload"
)

if (!(Test-Path $FilePath)) {
    "Sample content for testing upload" | Out-File -FilePath $FilePath -Encoding utf8
}

Write-Host "Uploading $FilePath to $GatewayUrl ..."

try {
    # Create multipart form data
    $boundary = [System.Guid]::NewGuid().ToString()
    $LF = "`r`n"
    
    $fileBytes = [System.IO.File]::ReadAllBytes($FilePath)
    $fileEnc = [System.Text.Encoding]::GetEncoding('UTF-8').GetString($fileBytes)
    
    $bodyLines = (
        "--$boundary",
        "Content-Disposition: form-data; name=`"file`"; filename=`"$([System.IO.Path]::GetFileName($FilePath))`"",
        "Content-Type: application/octet-stream",
        "",
        $fileEnc,
        "--$boundary--",
        ""
    ) -join $LF
    
    $response = Invoke-RestMethod -Uri $GatewayUrl -Method Post -Body $bodyLines -ContentType "multipart/form-data; boundary=$boundary"
    
    Write-Host "Upload successful:"
    $response | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "Upload failed:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody"
    }
}
