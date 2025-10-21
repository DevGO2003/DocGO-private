$fileId = "5db57372-4624-4469-84ce-9af88fd61edf"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Write-Host "=== FETCHING API RESPONSE ===" -ForegroundColor Cyan
Write-Host "FileId: $fileId" -ForegroundColor Yellow
Write-Host "URI: $uri`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $uri -Method Get -ContentType "application/json"
    
    # Convert to JSON with deep depth
    $json = $response | ConvertTo-Json -Depth 20
    
    # Save to file
    $json | Out-File -FilePath "api-response-full.json" -Encoding UTF8
    
    Write-Host "=== FULL JSON RESPONSE ===" -ForegroundColor Green
    Write-Output $json
    
    Write-Host "`n=== SAVED TO: api-response-full.json ===" -ForegroundColor Cyan
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
