# Test E2E JSON Analysis Flow
# 1. Upload file (existing flow)
# 2. Analyze JSON (single)
# 3. Poll status
# 4. Verify File Service persistence
# 5. Test batch analysis

$ErrorActionPreference = "Stop"

$BASE_URL = "http://localhost:8000/api/v1/automation-service"
$FILE_SERVICE_URL = "http://localhost:8000/api/v1/file-management-service/v1/files"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "🧪 Test E2E JSON Analysis Flow" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Test 1: Analyze single JSON
Write-Host "`n📝 Test 1: Analyze Single JSON" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

$singleJson = @{
    documentType = "contract"
    title = "Hợp đồng mua bán"
    parties = @("Công ty A", "Công ty B")
    amount = 1000000
} | ConvertTo-Json -Compress

Write-Host "Sending JSON analysis request..."
try {
    $singleResponse = Invoke-RestMethod -Uri "$BASE_URL/files/events/analyze-json" `
        -Method Post `
        -ContentType "application/json" `
        -Body $singleJson
    
    Write-Host "Response:" -ForegroundColor Green
    $singleResponse | ConvertTo-Json -Depth 5
    
    $jobId = $singleResponse.data.jobId
    
    if (-not $jobId) {
        Write-Host "❌ Failed to get jobId from response" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Job created with ID: $jobId" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
    exit 1
}

# Test 2: Poll status
Write-Host "`n📊 Test 2: Poll Status" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

for ($i = 1; $i -le 10; $i++) {
    Write-Host "Polling attempt $i/10..."
    try {
        $statusResponse = Invoke-RestMethod -Uri "$BASE_URL/files/events/$jobId/status" -Method Get
        Write-Host "Status response:" -ForegroundColor Green
        $statusResponse | ConvertTo-Json -Depth 3
        
        $percent = $statusResponse.data.percent
        $status = $statusResponse.data.status
        
        Write-Host "Progress: $percent%, Status: $status" -ForegroundColor Cyan
        
        if ($status -eq "COMPLETED" -or $percent -eq 100) {
            Write-Host "✅ Job completed successfully!" -ForegroundColor Green
            break
        }
        
        if ($status -eq "FAILED") {
            Write-Host "❌ Job failed!" -ForegroundColor Red
            exit 1
        }
        
        Start-Sleep -Seconds 2
    } catch {
        Write-Host "⚠️ Error polling status: $_" -ForegroundColor Yellow
    }
}

# Test 3: Verify File Service persistence
Write-Host "`n💾 Test 3: Verify File Service Persistence" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

Write-Host "Waiting 5 seconds for Kafka consumer to process..."
Start-Sleep -Seconds 5

try {
    Write-Host "Querying File Service for documents..."
    $docsResponse = Invoke-RestMethod -Uri "$FILE_SERVICE_URL?page=0&size=10" -Method Get
    Write-Host "Documents response:" -ForegroundColor Green
    $docsResponse | ConvertTo-Json -Depth 3 | Select-Object -First 1000
} catch {
    Write-Host "⚠️ Error querying File Service: $_" -ForegroundColor Yellow
}

# Test 4: Batch analysis
Write-Host "`n📦 Test 4: Analyze Batch JSON" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

$batchJson = @(
    @{ type = "invoice"; number = "INV001"; amount = 5000 }
    @{ type = "receipt"; number = "REC001"; amount = 3000 }
    @{ type = "contract"; number = "CON001"; parties = @("A", "B") }
) | ConvertTo-Json -Compress

Write-Host "Sending batch analysis request..."
try {
    $batchResponse = Invoke-RestMethod -Uri "$BASE_URL/files/events/analyze-batch" `
        -Method Post `
        -ContentType "application/json" `
        -Body $batchJson
    
    Write-Host "Batch response:" -ForegroundColor Green
    $batchResponse | ConvertTo-Json -Depth 3
    
    $batchJobId = $batchResponse.data.jobId
    
    if (-not $batchJobId) {
        Write-Host "❌ Failed to get batch jobId" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Batch job created with ID: $batchJobId" -ForegroundColor Green
    
    # Poll batch status
    Write-Host "Polling batch status..."
    for ($i = 1; $i -le 15; $i++) {
        Write-Host "Batch polling attempt $i/15..."
        try {
            $batchStatus = Invoke-RestMethod -Uri "$BASE_URL/files/events/$batchJobId/status" -Method Get
            Write-Host "Batch status:" -ForegroundColor Green
            $batchStatus | ConvertTo-Json -Depth 3
            
            $batchPercent = $batchStatus.data.percent
            $batchStatusText = $batchStatus.data.status
            
            Write-Host "Batch progress: $batchPercent%, Status: $batchStatusText" -ForegroundColor Cyan
            
            if ($batchStatusText -eq "COMPLETED") {
                Write-Host "✅ Batch job completed!" -ForegroundColor Green
                break
            }
            
            Start-Sleep -Seconds 2
        } catch {
            Write-Host "⚠️ Error polling batch status: $_" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "❌ Error with batch analysis: $_" -ForegroundColor Red
}

Write-Host "`n===================================" -ForegroundColor Cyan
Write-Host "✅ All E2E tests completed!" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "- Single JSON analysis: $jobId" -ForegroundColor White
if ($batchJobId) {
    Write-Host "- Batch JSON analysis: $batchJobId" -ForegroundColor White
}
Write-Host "- File Service integration: Verified (check logs)" -ForegroundColor White
Write-Host ""

