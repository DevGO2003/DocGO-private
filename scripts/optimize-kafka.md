# Kafka Performance Optimization Guide

## 📊 Current Performance Issues

Based on the test results:
- ❌ **Avg Latency: 1,083 ms** (Target: < 50ms)
- ⚠️ **Throughput: 2,934 msg/s** (Target: > 5,000 msg/s)
- ⚠️ **Rebalance Time: 3,620 ms** (Target: < 1,000ms)

## 🔧 Optimization Actions

### 1. Optimize Producer Settings

Add to `docker-compose.yml` under `kafka` service environment:

```yaml
environment:
  # ... existing config ...
  
  # Performance tuning
  KAFKA_NUM_NETWORK_THREADS: 8
  KAFKA_NUM_IO_THREADS: 8
  KAFKA_SOCKET_SEND_BUFFER_BYTES: 1048576
  KAFKA_SOCKET_RECEIVE_BUFFER_BYTES: 1048576
  KAFKA_SOCKET_REQUEST_MAX_BYTES: 104857600
  
  # Increase throughput
  KAFKA_NUM_REPLICA_FETCHERS: 4
  KAFKA_REPLICA_FETCH_MAX_BYTES: 1048576
  
  # Log segment tuning
  KAFKA_LOG_SEGMENT_BYTES: 1073741824
  KAFKA_LOG_RETENTION_CHECK_INTERVAL_MS: 300000
  
  # Compression
  KAFKA_COMPRESSION_TYPE: gzip
```

### 2. Create Topics with Multiple Partitions

```bash
# Increase partitions for better parallelism
docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --alter --topic docgo-file-events --partitions 3

docker exec kafka kafka-topics --bootstrap-server localhost:9092 \
  --alter --topic file.metadata.recorded --partitions 3
```

### 3. Optimize Producer in Application Code

#### Spring Boot (Java services):

Update `application.properties`:

```properties
# Producer optimization
spring.kafka.producer.acks=1
spring.kafka.producer.compression-type=gzip
spring.kafka.producer.batch-size=32768
spring.kafka.producer.buffer-memory=67108864
spring.kafka.producer.linger.ms=10
spring.kafka.producer.retries=3

# Consumer optimization  
spring.kafka.consumer.fetch-min-size=1048576
spring.kafka.consumer.fetch-max-wait=500
spring.kafka.consumer.max-poll-records=500
```

#### Python (automation-service):

Update Kafka producer config:

```python
from kafka import KafkaProducer

producer = KafkaProducer(
    bootstrap_servers='kafka:9092',
    acks=1,  # Wait for leader only (faster than 'all')
    compression_type='gzip',
    batch_size=32768,
    linger_ms=10,  # Wait up to 10ms to batch messages
    buffer_memory=67108864,
    max_request_size=1048576
)
```

### 4. Increase Docker Resources

If running on Docker Desktop, increase memory allocation:
- Go to Docker Desktop Settings → Resources
- Increase Memory to at least 4GB
- Increase CPUs to at least 2

### 5. Use Multiple Consumer Instances

For better throughput, run multiple consumer instances:

```yaml
# In docker-compose.yml
automation-worker-1:
  container_name: automation-worker-1
  # ... same config as automation-worker

automation-worker-2:
  container_name: automation-worker-2
  # ... same config as automation-worker
```

### 6. Monitor and Tune

After applying changes, re-run the test:

```powershell
.\kafka-performance-test.ps1
```

Expected improvements:
- ✅ Latency: < 100ms (from 1,083ms)
- ✅ Throughput: > 5,000 msg/s (from 2,934 msg/s)

## 📈 Quick Wins (Immediate Impact)

1. **Set `acks=1`** instead of `acks=all` → Reduce latency by 50%
2. **Enable compression** → Reduce network I/O by 30-40%
3. **Increase batch size** → Improve throughput by 2-3x
4. **Add partitions** → Better parallelism

## 🎯 Target Performance

After optimization:
- Latency: **< 50ms** (P95)
- Throughput: **> 10,000 msg/s**
- Consumer Lag: **0**

## 🔍 Monitoring Commands

```bash
# Check broker performance
docker stats kafka

# Monitor topic metrics
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --describe

# Check consumer lag
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 \
  --describe --group docgo-repo-events-v1

# View Kafka UI
http://localhost:8080
```

## 📚 References

- [Kafka Performance Tuning](https://kafka.apache.org/documentation/#producerconfigs)
- [Spring Kafka Documentation](https://docs.spring.io/spring-kafka/reference/html/)
- [Python kafka-python](https://kafka-python.readthedocs.io/)
