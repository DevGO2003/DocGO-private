# Test API list files
$uri = "http://localhost:8002/api/v1/file-management-service/files/"
$headers = @{
    "Accept" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri $uri -Method GET -Headers $headers
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response Content:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error occurred: $($_.Exception.Message)"
}
