$fileId = "5db57372-4624-4469-84ce-9af88fd61edf"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

$response = Invoke-RestMethod -Uri $uri -Method Get

Write-Host "=== SCHEMA CHECK ===" -ForegroundColor Cyan
Write-Host "Has contract: $($null -ne $response.data.contract)" -ForegroundColor Yellow
Write-Host "Has content: $($null -ne $response.data.content)" -ForegroundColor Yellow
Write-Host "Has overview: $($null -ne $response.data.overview)" -ForegroundColor Yellow
Write-Host "DocumentType: $($response.data.overview.documentType)" -ForegroundColor Yellow

if ($response.data.contract) {
    Write-Host "`nCONTRACT DATA:" -ForegroundColor Green
    $response.data.contract | ConvertTo-Json -Depth 5
} else {
    Write-Host "`nCONTRACT MISSING!" -ForegroundColor Red
}
