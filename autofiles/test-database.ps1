# Test Database Script - Kiểm tra dữ liệu trong database
Write-Host "Testing Database Storage..." -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green

# Step 1: Check Contract Management Service - Get all contracts
Write-Host "`nStep 1: Checking all contracts in database..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/api/v1/contract-management-service/contracts" -UseBasicParsing
    Write-Host "Get Contracts API: $($response.StatusCode)" -ForegroundColor Green
    $contractsResult = $response.Content | ConvertFrom-Json
    Write-Host "Total Contracts: $($contractsResult.data.Count)" -ForegroundColor White
    
    if ($contractsResult.data.Count -gt 0) {
        Write-Host "`nContracts in Database:" -ForegroundColor Cyan
        for ($i = 0; $i -lt [Math]::Min(5, $contractsResult.data.Count); $i++) {
            $contract = $contractsResult.data[$i]
            Write-Host "  Contract $($i + 1):" -ForegroundColor Yellow
            Write-Host "    ID: $($contract.id)" -ForegroundColor White
            Write-Host "    Contract Number: $($contract.contractNumber)" -ForegroundColor White
            Write-Host "    Title: $($contract.title)" -ForegroundColor White
            Write-Host "    Status: $($contract.status)" -ForegroundColor White
            Write-Host "    AI Processed: $($contract.aiProcessed)" -ForegroundColor White
            Write-Host "    Processing Status: $($contract.processingStatus)" -ForegroundColor White
            Write-Host "    Created At: $($contract.createdAt)" -ForegroundColor White
            Write-Host ""
        }
    } else {
        Write-Host "No contracts found in database" -ForegroundColor Red
    }
} catch {
    Write-Host "Get Contracts API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 2: Check specific contract by ID
Write-Host "`nStep 2: Checking specific contract details..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/api/v1/contract-management-service/contracts/1" -UseBasicParsing
    Write-Host "Get Contract by ID API: $($response.StatusCode)" -ForegroundColor Green
    $contractDetail = $response.Content | ConvertFrom-Json
    
    Write-Host "`nContract Details:" -ForegroundColor Cyan
    Write-Host "  ID: $($contractDetail.data.id)" -ForegroundColor White
    Write-Host "  Contract Number: $($contractDetail.data.contractNumber)" -ForegroundColor White
    Write-Host "  Title: $($contractDetail.data.title)" -ForegroundColor White
    Write-Host "  Status: $($contractDetail.data.status)" -ForegroundColor White
    Write-Host "  AI Processed: $($contractDetail.data.aiProcessed)" -ForegroundColor White
    Write-Host "  Processing Status: $($contractDetail.data.processingStatus)" -ForegroundColor White
    Write-Host "  Contract Object: $($contractDetail.data.contractObject)" -ForegroundColor White
    Write-Host "  Effective Date: $($contractDetail.data.effectiveDate)" -ForegroundColor White
    Write-Host "  Contract Term: $($contractDetail.data.contractTerm)" -ForegroundColor White
    Write-Host "  Total Value: $($contractDetail.data.totalValue)" -ForegroundColor White
    Write-Host "  Currency: $($contractDetail.data.currency)" -ForegroundColor White
    Write-Host "  Created At: $($contractDetail.data.createdAt)" -ForegroundColor White
    Write-Host "  Updated At: $($contractDetail.data.updatedAt)" -ForegroundColor White
    
    # Check contract parties
    if ($contractDetail.data.parties -and $contractDetail.data.parties.Count -gt 0) {
        Write-Host "`n  Contract Parties:" -ForegroundColor Cyan
        foreach ($party in $contractDetail.data.parties) {
            Write-Host "    - $($party.partyName) ($($party.partyRole))" -ForegroundColor White
        }
    }
    
    # Check contract summary
    if ($contractDetail.data.contractSummary) {
        Write-Host "`n  Contract Summary:" -ForegroundColor Cyan
        Write-Host "    Title: $($contractDetail.data.contractSummary.title)" -ForegroundColor White
        Write-Host "    Object: $($contractDetail.data.contractSummary.object)" -ForegroundColor White
        Write-Host "    Effective Date: $($contractDetail.data.contractSummary.effectiveDate)" -ForegroundColor White
        Write-Host "    Term: $($contractDetail.data.contractSummary.term)" -ForegroundColor White
    }
    
} catch {
    Write-Host "Get Contract by ID API: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Step 3: Check database schema
Write-Host "`nStep 3: Checking database schema..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8003/api/v1/contract-management-service/contracts" -UseBasicParsing
    $contractsResult = $response.Content | ConvertFrom-Json
    
    if ($contractsResult.data.Count -gt 0) {
        $sampleContract = $contractsResult.data[0]
        Write-Host "Database Schema Fields:" -ForegroundColor Cyan
        $sampleContract.PSObject.Properties | ForEach-Object {
            Write-Host "  - $($_.Name): $($_.Value)" -ForegroundColor White
        }
    }
} catch {
    Write-Host "Database schema check failed" -ForegroundColor Red
}

Write-Host "`nDatabase Testing completed!" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
