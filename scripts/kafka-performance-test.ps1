# Kafka Performance Test Script
# Kiem tra toc do va hieu suat cua Kafka

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "KAFKA PERFORMANCE TEST" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Kiem tra Kafka container co dang chay khong
Write-Host "1. Checking Kafka container status..." -ForegroundColor Yellow
$kafkaStatus = docker ps --filter "name=kafka" --format '{{.Status}}'
if ($kafkaStatus) {
    Write-Host "Kafka is running: $kafkaStatus" -ForegroundColor Green
} else {
    Write-Host "Kafka is not running!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Kiem tra topics hien co
Write-Host "2. Listing existing topics..." -ForegroundColor Yellow
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
Write-Host ""

# Kiem tra chi tiet topics
Write-Host "3. Topic details..." -ForegroundColor Yellow
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic file-events
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic contract-events
Write-Host ""

# Test Producer Performance
Write-Host "4. Testing Producer Performance..." -ForegroundColor Yellow
Write-Host "Sending 10,000 messages to test-performance topic..." -ForegroundColor Gray

$startTime = Get-Date
docker exec kafka kafka-producer-perf-test `
    --topic test-performance `
    --num-records 10000 `
    --record-size 1024 `
    --throughput -1 `
    --producer-props bootstrap.servers=localhost:9092
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "Producer test completed in $duration seconds" -ForegroundColor Green
Write-Host ""

# Test Consumer Performance
Write-Host "5. Testing Consumer Performance..." -ForegroundColor Yellow
Write-Host "Consuming messages from test-performance topic..." -ForegroundColor Gray

$startTime = Get-Date
docker exec kafka kafka-consumer-perf-test `
    --topic test-performance `
    --bootstrap-server localhost:9092 `
    --messages 10000 `
    --timeout 30000
$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host ""
Write-Host "Consumer test completed in $duration seconds" -ForegroundColor Green
Write-Host ""

# Kiem tra Consumer Groups
Write-Host "6. Checking Consumer Groups..." -ForegroundColor Yellow
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
Write-Host ""

# Kiem tra lag cua consumer groups
Write-Host "7. Checking Consumer Lag..." -ForegroundColor Yellow
$consumerGroups = docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
foreach ($group in $consumerGroups) {
    if ($group -and $group -ne "") {
        Write-Host "Group: $group" -ForegroundColor Cyan
        docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group $group
        Write-Host ""
    }
}

# Cleanup test topic
Write-Host "8. Cleaning up test topic..." -ForegroundColor Yellow
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --delete --topic test-performance
Write-Host ""

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "PERFORMANCE TEST COMPLETED" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Recommendations:" -ForegroundColor Yellow
Write-Host "- Check Kafka UI at http://localhost:8080" -ForegroundColor Gray
Write-Host "- Monitor logs: docker logs kafka -f" -ForegroundColor Gray
Write-Host "- Check broker configs for optimization" -ForegroundColor Gray
