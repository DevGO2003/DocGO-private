# Test Repository Service Locally (Without Docker Service)
# Use local MongoDB container only

param(
    [switch]$StartMongo,
    [switch]$StopMongo,
    [switch]$InsertData,
    [switch]$TestAPI
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 DocGO Repository Service - Local Test Script" -ForegroundColor Cyan
Write-Host ""

# Function: Start MongoDB container
function Start-MongoDB {
    Write-Host "🐳 Starting MongoDB container..." -ForegroundColor Cyan
    
    # Check if already running
    $existing = docker ps -q -f name=docgo-mongodb-local
    if ($existing) {
        Write-Host "✅ MongoDB already running" -ForegroundColor Green
        return $true
    }
    
    # Check if stopped container exists
    $stopped = docker ps -aq -f name=docgo-mongodb-local
    if ($stopped) {
        Write-Host "  Removing stopped container..." -ForegroundColor Yellow
        docker rm docgo-mongodb-local | Out-Null
    }
    
    # Start new container
    docker run -d `
        --name docgo-mongodb-local `
        -p 27017:27017 `
        -e MONGO_INITDB_DATABASE=docgo `
        mongo:7.0
    
    Write-Host "  Waiting for MongoDB to be ready (10s)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Check health
    try {
        docker exec docgo-mongodb-local mongosh --eval "db.adminCommand('ping')" > $null 2>&1
        Write-Host "✅ MongoDB started successfully" -ForegroundColor Green
        Write-Host ""
        return $true
    } catch {
        Write-Host "❌ MongoDB failed to start" -ForegroundColor Red
        return $false
    }
}

# Function: Stop MongoDB
function Stop-MongoDB {
    Write-Host "🛑 Stopping MongoDB container..." -ForegroundColor Cyan
    
    $existing = docker ps -q -f name=docgo-mongodb-local
    if ($existing) {
        docker stop docgo-mongodb-local | Out-Null
        docker rm docgo-mongodb-local | Out-Null
        Write-Host "✅ MongoDB stopped" -ForegroundColor Green
    } else {
        Write-Host "⚠️  MongoDB not running" -ForegroundColor Yellow
    }
    Write-Host ""
}

# Function: Insert sample data
function Insert-SampleData {
    Write-Host "📊 Inserting sample data..." -ForegroundColor Cyan
    
    $projectRoot = Split-Path -Parent $PSScriptRoot
    $scriptPath = Join-Path $projectRoot "scripts\insert-sample-data.js"
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Script not found: $scriptPath" -ForegroundColor Red
        return $false
    }
    
    try {
        # Copy script to container
        docker cp $scriptPath docgo-mongodb-local:/tmp/insert-data.js
        
        # Run script
        docker exec docgo-mongodb-local mongosh docgo /tmp/insert-data.js | Out-Null
        
        # Verify
        $result = docker exec docgo-mongodb-local mongosh docgo --eval "db.files.findOne({_id: 'FILE-2025-001-TEST'})" --quiet
        
        if ($result -match "FILE-2025-001-TEST") {
            Write-Host "✅ Sample data inserted successfully" -ForegroundColor Green
        } else {
            Write-Host "❌ Data verification failed" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Failed to insert data: $_" -ForegroundColor Red
        return $false
    }
    
    Write-Host ""
    return $true
}

# Function: Test API
function Test-API {
    Write-Host "🧪 Testing GET API (local service)..." -ForegroundColor Cyan
    
    $url = "http://localhost:8002/api/v1/repository-management-service/files/FILE-2025-001-TEST"
    
    Write-Host "  URL: $url" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5
        
        if ($response.statusCode -eq 200) {
            Write-Host "✅ API Response: SUCCESS" -ForegroundColor Green
            Write-Host ""
            
            # Display key fields
            Write-Host "📋 Response Summary:" -ForegroundColor Cyan
            Write-Host "  - ID: $($response.data.id)" -ForegroundColor Gray
            Write-Host "  - Status: $($response.data.overview.status)" -ForegroundColor Gray
            Write-Host "  - Type: $($response.data.overview.documentType)" -ForegroundColor Gray
            Write-Host "  - Priority: $($response.data.contract.priority)" -ForegroundColor Gray
            Write-Host ""
            
            return $true
        } else {
            Write-Host "❌ API Error: $($response.shortMessage)" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ API call failed: $_" -ForegroundColor Red
        Write-Host ""
        Write-Host "⚠️  Make sure application is running:" -ForegroundColor Yellow
        Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
        return $false
    }
}

# Main execution
try {
    if ($StartMongo) {
        Start-MongoDB
        exit 0
    }
    
    if ($StopMongo) {
        Stop-MongoDB
        exit 0
    }
    
    if ($InsertData) {
        Insert-SampleData
        exit 0
    }
    
    if ($TestAPI) {
        Test-API
        exit 0
    }
    
    # Full workflow
    Write-Host "📝 Local Test Workflow" -ForegroundColor Cyan
    Write-Host "======================" -ForegroundColor Cyan
    Write-Host ""
    
    # Step 1: Start MongoDB
    if (-not (Start-MongoDB)) {
        exit 1
    }
    
    # Step 2: Insert data
    if (-not (Insert-SampleData)) {
        exit 1
    }
    
    # Step 3: Guide user
    Write-Host "✅ MongoDB ready với sample data!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next steps:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1️⃣  Run application locally:" -ForegroundColor Yellow
    Write-Host "   mvn spring-boot:run" -ForegroundColor Gray
    Write-Host "   # Or run in IDE: RepositoryServiceApplication.java" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2️⃣  Wait for Spring Boot to start (~30s)" -ForegroundColor Yellow
    Write-Host "   Look for: 'Started RepositoryServiceApplication'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3️⃣  Test API:" -ForegroundColor Yellow
    Write-Host "   .\scripts\test-local.ps1 -TestAPI" -ForegroundColor Gray
    Write-Host "   # Or open browser: http://localhost:8002/docs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "4️⃣  When done, stop MongoDB:" -ForegroundColor Yellow
    Write-Host "   .\scripts\test-local.ps1 -StopMongo" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "❌ Error: $_" -ForegroundColor Red
    exit 1
}
