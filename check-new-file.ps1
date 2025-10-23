$fileId = "c200f9a1-e18f-4181-a835-d008f3962984"
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
