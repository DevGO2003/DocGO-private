# Test API getOne với ID có sẵn
$uri = "http://localhost:8002/api/v1/file-management-service/documents/DOC-2024-004-NEW"
$headers = @{
    "Accept" = "application/json"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri $uri -Method GET -Headers $headers
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response Content:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
