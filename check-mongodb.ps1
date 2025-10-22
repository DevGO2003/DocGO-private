# Check MongoDB for files
Write-Host "=== Checking MongoDB for Files ===" -ForegroundColor Cyan
Write-Host ""

# Using MongoDB connection string from env
$mongoUri = "mongodb+srv://root:docgo123@devgo-docgo-cluster0.hsudzga.mongodb.net/?retryWrites=true&w=majority&appName=devgo-docgo-cluster0"

# Check if mongosh is available
$mongoshPath = "mongosh"

try {
    Write-Host "Connecting to MongoDB..." -ForegroundColor Yellow
    
    $query = @"
use docgo_repository;
db.files.countDocuments();
db.files.find().limit(5);
"@
    
    $result = & $mongoshPath $mongoUri --quiet --eval $query 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB Query Result:" -ForegroundColor Green
        Write-Host $result
    } else {
        Write-Host "❌ MongoDB query failed:" -ForegroundColor Red
        Write-Host $result
    }
} catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Alternative: Check via API" -ForegroundColor Yellow
    try {
        $apiResult = Invoke-RestMethod -Uri "http://localhost:8002/api/v1/repository-management-service/files"
        Write-Host "Files in repository: $($apiResult.data.result.total_elements)" -ForegroundColor Cyan
    } catch {
        Write-Host "API also failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}
