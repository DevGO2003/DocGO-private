$fileId = "55300855-bd8c-4af0-9f70-2b92ee71ecea"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Write-Host "=== CHECKING AI IMPROVED RESULT ===" -ForegroundColor Cyan
Write-Host "FileId: $fileId`n" -ForegroundColor Yellow

$response = Invoke-RestMethod -Uri $uri -Method Get -ErrorAction SilentlyContinue

if ($response) {
    Write-Host "✅ API Response received!" -ForegroundColor Green
    
    # Check parties structure
    Write-Host "`n=== PARTIES STRUCTURE ===" -ForegroundColor Cyan
    if ($response.data.contract.parties) {
        Write-Host "Parties count: $($response.data.contract.parties.Count)" -ForegroundColor Yellow
        
        if ($response.data.contract.parties.Count -gt 0) {
            $party1 = $response.data.contract.parties[0]
            Write-Host "`n✅ Party 1 Fields:" -ForegroundColor Green
            Write-Host "  - id: $($party1.id)" -ForegroundColor $(if ($party1.id) { "Green" } else { "Red" })
            Write-Host "  - name: $($party1.name)"
            Write-Host "  - type: $($party1.type)" -ForegroundColor $(if ($party1.type) { "Green" } else { "Red" })
            Write-Host "  - contact.email: $($party1.contact.email)" -ForegroundColor $(if ($party1.contact.email) { "Green" } else { "Red" })
            Write-Host "  - representative.name: $($party1.representative.name)" -ForegroundColor $(if ($party1.representative.name) { "Green" } else { "Red" })
            Write-Host "  - representative.position: $($party1.representative.position)" -ForegroundColor $(if ($party1.representative.position) { "Green" } else { "Red" })
        }
    } else {
        Write-Host "❌ NO PARTIES!" -ForegroundColor Red
    }
    
    # Check other structures
    Write-Host "`n=== OTHER STRUCTURES ===" -ForegroundColor Cyan
    Write-Host "Payment schedule: $($response.data.contract.payment.schedule)" -ForegroundColor $(if ($response.data.contract.payment.schedule) { "Green" } else { "Yellow" })
    Write-Host "Clauses.key count: $($response.data.contract.clauses.key.Count)" -ForegroundColor Yellow
    Write-Host "Reminders count: $($response.data.contract.reminders.Count)" -ForegroundColor $(if ($response.data.contract.reminders.Count -gt 0) { "Green" } else { "Red" })
    Write-Host "Risk.factors count: $($response.data.contract.risk.factors.Count)" -ForegroundColor Yellow
    
    # Save full response
    $response | ConvertTo-Json -Depth 20 | Out-File "improved-ai-response.json" -Encoding UTF8
    Write-Host "`n✅ Full response saved to: improved-ai-response.json" -ForegroundColor Green
} else {
    Write-Host "❌ No response from API" -ForegroundColor Red
}
