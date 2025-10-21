$fileId = "a0d0432c-15b4-4e23-a062-d46e5daf6077"
$uri = "http://localhost:8002/api/v1/repository-management-service/files/$fileId"

Write-Host "Testing contract schema for fileId: $fileId" -ForegroundColor Cyan

$response = Invoke-RestMethod -Uri $uri -Method Get -ContentType "application/json"

Write-Host "`n=== SCHEMA COMPARISON ===" -ForegroundColor Yellow

# Check required top-level fields
$requiredFields = @("overview", "contract", "content", "file", "storage", "metadata", "audit")
foreach ($field in $requiredFields) {
    if ($response.data.$field) {
        Write-Host "✅ $field - PRESENT" -ForegroundColor Green
    } else {
        Write-Host "❌ $field - MISSING" -ForegroundColor Red
    }
}

# Check contract fields if present
if ($response.data.contract) {
    Write-Host "`n=== CONTRACT FIELDS ===" -ForegroundColor Cyan
    $contractFields = @("effectiveDate", "expiryDate", "totalValue", "currency", "parties", "payment", "clauses", "reminders", "risk", "compliance")
    foreach ($field in $contractFields) {
        if ($response.data.contract.$field) {
            Write-Host "✅ contract.$field - PRESENT" -ForegroundColor Green
        } else {
            Write-Host "⚠️  contract.$field - MISSING" -ForegroundColor Yellow
        }
    }
    
    # Show parties count
    if ($response.data.contract.parties) {
        Write-Host "`n📊 Parties count: $($response.data.contract.parties.Count)" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n❌ CONTRACT SECTION COMPLETELY MISSING!" -ForegroundColor Red
}

# Check overview.documentType
if ($response.data.overview.documentType) {
    $docType = $response.data.overview.documentType
    Write-Host "`n📄 Document Type: $docType" -ForegroundColor Cyan
}
