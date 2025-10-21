$fileId = "75154504-ee37-4582-8d47-5264798c3999"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Write-Host "=== FINAL TEST - FILE: $fileId ===" -ForegroundColor Cyan

$response = Invoke-RestMethod -Uri $uri -Method Get

Write-Host "`n=== PARTIES STRUCTURE ===" -ForegroundColor Green
if ($response.data.contract.parties -and $response.data.contract.parties.Count -gt 0) {
    Write-Host "Parties count: $($response.data.contract.parties.Count)" -ForegroundColor Yellow
    Write-Host "`nFirst party:" -ForegroundColor Cyan
    $response.data.contract.parties[0] | ConvertTo-Json -Depth 5
    
    Write-Host "`n=== CHECKING STRUCTURE ===" -ForegroundColor Green
    $party = $response.data.contract.parties[0]
    Write-Host "Has id: $($null -ne $party.id)" -ForegroundColor $(if ($party.id) { "Green" } else { "Red" })
    Write-Host "Has type: $($null -ne $party.type)" -ForegroundColor $(if ($party.type) { "Green" } else { "Red" })
    Write-Host "Has contact object: $($null -ne $party.contact)" -ForegroundColor $(if ($party.contact) { "Green" } else { "Red" })
    Write-Host "Has representative object: $($null -ne $party.representative)" -ForegroundColor $(if ($party.representative) { "Green" } else { "Red" })
} else {
    Write-Host "NO PARTIES DATA!" -ForegroundColor Red
}

Write-Host "`n=== FULL CONTRACT ===" -ForegroundColor Green
$response.data.contract | ConvertTo-Json -Depth 10 | Out-File "final-contract-result.json" -Encoding UTF8
Write-Host "Saved to: final-contract-result.json"
