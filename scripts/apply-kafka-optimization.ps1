# Apply Quick Kafka Optimizations
# Increase partitions for better throughput

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "KAFKA QUICK OPTIMIZATION" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Kafka is running
Write-Host "Checking Kafka status..." -ForegroundColor Yellow
$kafkaStatus = docker ps --filter "name=kafka" --format '{{.Status}}'
if (-not $kafkaStatus) {
    Write-Host "Error: Kafka is not running!" -ForegroundColor Red
    exit 1
}
Write-Host "Kafka is running" -ForegroundColor Green
Write-Host ""

# Get current topics
Write-Host "Current topics:" -ForegroundColor Yellow
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
Write-Host ""

# Optimize partitions for existing topics
Write-Host "Optimizing topic partitions..." -ForegroundColor Yellow

$topics = @(
    "docgo-file-events",
    "file.metadata.recorded",
    "file.plaintext.extracted",
    "contract.summary.generated"
)

foreach ($topic in $topics) {
    Write-Host "Setting $topic to 3 partitions..." -ForegroundColor Gray
    docker exec kafka kafka-topics --bootstrap-server localhost:9092 `
        --alter --topic $topic --partitions 3 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  $topic optimized" -ForegroundColor Green
    } else {
        Write-Host "  $topic already has enough partitions or does not exist" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Verifying changes..." -ForegroundColor Yellow
foreach ($topic in $topics) {
    $description = docker exec kafka kafka-topics --bootstrap-server localhost:9092 `
        --describe --topic $topic 2>&1
    if ($description -match "PartitionCount: (\d+)") {
        $partitionCount = $matches[1]
        Write-Host "$topic : $partitionCount partitions" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "OPTIMIZATION COMPLETED" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update application.properties with producer/consumer configs" -ForegroundColor Gray
Write-Host "2. Restart services: docker-compose restart" -ForegroundColor Gray
Write-Host "3. Re-run performance test: .\kafka-performance-test.ps1" -ForegroundColor Gray
Write-Host "4. See optimize-kafka.md for detailed tuning guide" -ForegroundColor Gray
