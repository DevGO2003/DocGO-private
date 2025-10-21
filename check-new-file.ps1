$fileId = "70a28a6e-6af2-44bb-a969-edbb03a54621"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Write-Host "=== CHECKING NEW FILE ===" -ForegroundColor Cyan
Write-Host "FileId: $fileId`n" -ForegroundColor Yellow

$response = Invoke-RestMethod -Uri $uri -Method Get

# Check contract data
Write-Host "=== CONTRACT DATA ===" -ForegroundColor Green
$contract = $response.data.contract
Write-Host "Parties count: $($contract.parties.Count)" -ForegroundColor Yellow

if ($contract.parties.Count -gt 0) {
    Write-Host "`nFirst party structure:" -ForegroundColor Cyan
    $contract.parties[0] | ConvertTo-Json -Depth 5
}

Write-Host "`n=== FULL RESPONSE ===" -ForegroundColor Green
$response | ConvertTo-Json -Depth 20 | Out-File "new-file-response.json" -Encoding UTF8
Write-Host "Saved to: new-file-response.json"
