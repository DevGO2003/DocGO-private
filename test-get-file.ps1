$fileId = "01c4a6e1-e7f2-413f-adad-1c08d3a8c7e3"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Write-Host "Fetching file details for ID: $fileId" -ForegroundColor Cyan
Write-Host "URI: $uri`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $uri -Method Get -ContentType "application/json"
    
    Write-Host "=== RESPONSE STRUCTURE ===" -ForegroundColor Green
    $response | ConvertTo-Json -Depth 10
    
    Write-Host "`n=== CHECKING REQUIRED FIELDS ===" -ForegroundColor Yellow
    
    $checks = @{
        "data.overview" = $response.data.overview
        "data.content" = $response.data.content
        "data.file.hash" = $response.data.file.hash
        "data.file.permissions" = $response.data.file.permissions
        "data.file.security" = $response.data.file.security
        "data.storage.location" = $response.data.storage.location
        "data.storage.s3" = $response.data.storage.s3
        "data.audit" = $response.data.audit
        "data.metadata.fileSystem" = $response.data.metadata.fileSystem
        "data.metadata.technical" = $response.data.metadata.technical
    }
    
    foreach ($field in $checks.Keys) {
        $value = $checks[$field]
        if ($null -eq $value) {
            Write-Host "❌ MISSING: $field" -ForegroundColor Red
        } else {
            Write-Host "✅ PRESENT: $field" -ForegroundColor Green
        }
    }
    
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
}
