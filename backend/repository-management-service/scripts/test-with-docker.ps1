# Test Repository Service with Docker Compose
# Includes: Start services, Insert data, Test API, View logs

param(
    [switch]$Clean,
    [switch]$InsertOnly,
    [switch]$TestOnly,
    [switch]$Logs
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 DocGO Repository Service - Docker Test Script" -ForegroundColor Cyan
Write-Host ""

# Navigate to project root
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Function: Clean up
function Clean-Environment {
    Write-Host "🧹 Cleaning up Docker environment..." -ForegroundColor Yellow
    docker-compose -f docker-compose.test.yml down -v
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
    Write-Host ""
}

# Function: Start services
function Start-Services {
    Write-Host "🐳 Starting Docker Compose services..." -ForegroundColor Cyan
    docker-compose -f docker-compose.test.yml up -d --build
    
    Write-Host "⏳ Waiting for services to be ready (30s)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host "✅ Services started" -ForegroundColor Green
    Write-Host ""
}

# Function: Check service health
function Check-ServiceHealth {
    Write-Host "🔍 Checking service health..." -ForegroundColor Cyan
    
    # Check MongoDB
    Write-Host "  - MongoDB: " -NoNewline
    try {
        docker exec docgo-mongodb-test mongosh --eval "db.adminCommand('ping')" > $null 2>&1
        Write-Host "✅ Healthy" -ForegroundColor Green
    } catch {
        Write-Host "❌ Not responding" -ForegroundColor Red
        return $false
    }
    
    # Check Repository Service
    Write-Host "  - Repository Service: " -NoNewline
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8002/actuator/health" -Method Get -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Healthy" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Not responding" -ForegroundColor Red
        Write-Host "     Try: docker logs docgo-repository-service-test" -ForegroundColor Yellow
        return $false
    }
    
    Write-Host ""
    return $true
}

# Function: Insert sample data
function Insert-SampleData {
    Write-Host "📊 Inserting sample data to MongoDB..." -ForegroundColor Cyan
    
    $scriptPath = Join-Path $projectRoot "scripts\insert-sample-data.js"
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Script not found: $scriptPath" -ForegroundColor Red
        return $false
    }
    
    try {
        # Copy script to container
        docker cp $scriptPath docgo-mongodb-test:/tmp/insert-data.js
        
        # Run script
        docker exec docgo-mongodb-test mongosh docgo /tmp/insert-data.js
        
        Write-Host "✅ Sample data inserted" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        Write-Host "❌ Failed to insert data: $_" -ForegroundColor Red
        return $false
    }
}

# Function: Verify data in MongoDB
function Verify-Data {
    Write-Host "🔍 Verifying data in MongoDB..." -ForegroundColor Cyan
    
    try {
        $result = docker exec docgo-mongodb-test mongosh docgo --eval "db.files.findOne({_id: 'FILE-2025-001-TEST'})" --quiet
        
        if ($result -match "FILE-2025-001-TEST") {
            Write-Host "✅ Document found in database" -ForegroundColor Green
        } else {
            Write-Host "❌ Document not found" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Failed to verify: $_" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    return $true
}

# Function: Test GET API
function Test-API {
    Write-Host "🧪 Testing GET API..." -ForegroundColor Cyan
    
    $url = "http://localhost:8002/api/v1/repository-management-service/files/FILE-2025-001-TEST"
    
    Write-Host "  URL: $url" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get
        
        # Check response
        if ($response.statusCode -eq 200) {
            Write-Host "✅ API Response: SUCCESS" -ForegroundColor Green
            Write-Host ""
            
            # Display key fields
            Write-Host "📋 Response Summary:" -ForegroundColor Cyan
            Write-Host "  - ID: $($response.data.id)" -ForegroundColor Gray
            Write-Host "  - Title: $($response.data.overview.title)" -ForegroundColor Gray
            Write-Host "  - Status: $($response.data.overview.status)" -ForegroundColor Gray
            Write-Host "  - Type: $($response.data.overview.documentType)" -ForegroundColor Gray
            Write-Host "  - Priority: $($response.data.contract.priority)" -ForegroundColor Gray
            Write-Host "  - Currency: $($response.data.contract.currency)" -ForegroundColor Gray
            Write-Host ""
            
            # Save full response
            $outputFile = Join-Path $projectRoot "test-response.json"
            $response | ConvertTo-Json -Depth 100 | Out-File $outputFile -Encoding UTF8
            Write-Host "💾 Full response saved to: test-response.json" -ForegroundColor Green
            Write-Host ""
            
            return $true
        } else {
            Write-Host "❌ API Error: $($response.shortMessage)" -ForegroundColor Red
            Write-Host "   $($response.description)" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ API call failed: $_" -ForegroundColor Red
        return $false
    }
}

# Function: Show logs
function Show-Logs {
    Write-Host "📄 Service Logs" -ForegroundColor Cyan
    Write-Host "===============" -ForegroundColor Cyan
    Write-Host ""
    
    docker-compose -f docker-compose.test.yml logs --tail=50 repository-service
}

# Main execution
try {
    if ($Clean) {
        Clean-Environment
        exit 0
    }
    
    if ($Logs) {
        Show-Logs
        exit 0
    }
    
    if ($TestOnly) {
        Write-Host "🧪 Running API test only..." -ForegroundColor Cyan
        Write-Host ""
        
        if (Check-ServiceHealth) {
            Test-API
        }
        exit 0
    }
    
    if ($InsertOnly) {
        Write-Host "📊 Inserting data only..." -ForegroundColor Cyan
        Write-Host ""
        
        Insert-SampleData
        Verify-Data
        exit 0
    }
    
    # Full workflow
    Write-Host "🎯 Running full test workflow..." -ForegroundColor Cyan
    Write-Host ""
    
    # Step 1: Start services
    Start-Services
    
    # Step 2: Check health
    if (-not (Check-ServiceHealth)) {
        Write-Host ""
        Write-Host "⚠️  Services not healthy. Check logs with:" -ForegroundColor Yellow
        Write-Host "   docker-compose -f docker-compose.test.yml logs" -ForegroundColor Gray
        exit 1
    }
    
    # Step 3: Insert data
    if (-not (Insert-SampleData)) {
        Write-Host "⚠️  Failed to insert data" -ForegroundColor Yellow
        exit 1
    }
    
    # Step 4: Verify data
    if (-not (Verify-Data)) {
        Write-Host "⚠️  Data verification failed" -ForegroundColor Yellow
        exit 1
    }
    
    # Step 5: Test API
    if (-not (Test-API)) {
        Write-Host "⚠️  API test failed" -ForegroundColor Yellow
        exit 1
    }
    
    # Success
    Write-Host ""
    Write-Host "🎉 All tests passed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host "  - View full response: cat test-response.json" -ForegroundColor Gray
    Write-Host "  - Compare with v3 schema: .windsurf/documents/api-docs/document-management-sample-v3-commented.json" -ForegroundColor Gray
    Write-Host "  - View logs: .\scripts\test-with-docker.ps1 -Logs" -ForegroundColor Gray
    Write-Host "  - Clean up: .\scripts\test-with-docker.ps1 -Clean" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check logs: docker-compose -f docker-compose.test.yml logs" -ForegroundColor Gray
    Write-Host "  2. Check containers: docker ps -a" -ForegroundColor Gray
    Write-Host "  3. Clean and retry: .\scripts\test-with-docker.ps1 -Clean" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
