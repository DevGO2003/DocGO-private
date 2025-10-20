# Test files API đơn giản
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8002/api/v1/file-management-service/files" -Method GET
    Write-Host "✅ Status: $($response.StatusCode)"
    $json = $response.Content | ConvertFrom-Json
    Write-Host "`n📊 Total files: $($json.data.result.total_elements)"
    Write-Host "`n📄 Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
    Write-Host "`nStatus Code: $($_.Exception.Response.StatusCode.value__)"
}
