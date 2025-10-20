$filePath = "test-upload.txt"
$uri = "http://localhost:8003/api/v1/automation-service/files"

Add-Type -AssemblyName System.Net.Http

$client = New-Object System.Net.Http.HttpClient
$content = New-Object System.Net.Http.MultipartFormDataContent

$fileStream = [System.IO.File]::OpenRead($filePath)
$fileContent = New-Object System.Net.Http.StreamContent($fileStream)
$fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("text/plain")

$content.Add($fileContent, "file", "test-upload.txt")

$result = $client.PostAsync($uri, $content).Result
$responseBody = $result.Content.ReadAsStringAsync().Result

$fileStream.Close()
$client.Dispose()

Write-Host $responseBody
$response = $responseBody | ConvertFrom-Json
Write-Host "`n=== FILE ID: $($response.data.fileId) ===" -ForegroundColor Green
