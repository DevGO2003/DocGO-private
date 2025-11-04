# Kafka Performance Test Scripts

Scripts để kiểm tra tốc độ và hiệu suất của Kafka trong hệ thống DocGO.

## 📋 Yêu cầu

1. **Kafka đang chạy**: 
   ```bash
   docker-compose up -d kafka zookeeper
   ```

2. **Python 3.8+** (cho Python script)
3. **PowerShell** (cho Windows script)

## 🚀 Cách sử dụng

### Option 1: PowerShell Script (Nhanh - Dùng Kafka CLI)

```powershell
cd scripts
.\kafka-performance-test.ps1
```

**Script này sẽ:**
- Kiểm tra Kafka container status
- List tất cả topics
- Test producer throughput (10,000 messages)
- Test consumer throughput
- Kiểm tra consumer groups và lag
- Cleanup test data

**Ưu điểm:**
- Nhanh, không cần cài đặt dependencies
- Sử dụng Kafka built-in tools
- Phù hợp để quick check

### Option 2: Python Script (Chi tiết - Custom Producer/Consumer)

```bash
# 1. Cài đặt dependencies
cd scripts
pip install -r requirements-kafka-test.txt

# 2. Chạy test
python kafka_speed_test.py
```

**Script này sẽ test:**
- **Producer Throughput**: Tốc độ gửi messages (msg/s)
- **Producer Latency**: Avg, P95, P99 latency
- **Consumer Throughput**: Tốc độ nhận messages (msg/s)
- **End-to-End Latency**: Latency từ producer → consumer

**Ưu điểm:**
- Chi tiết hơn với metrics (P95, P99)
- Test latency end-to-end
- Có thể customize dễ dàng

## 📊 Đánh giá kết quả

### Throughput (msg/s)
- ✅ **> 1000 msg/s**: Excellent
- ⚠️ **100-1000 msg/s**: Good
- ⚠️ **50-100 msg/s**: Moderate (cần optimize)
- ❌ **< 50 msg/s**: Poor (có vấn đề)

### Latency
- ✅ **< 10ms**: Excellent
- ⚠️ **10-50ms**: Good
- ⚠️ **50-100ms**: Moderate
- ❌ **> 100ms**: Poor (cần optimize)

## 🔍 Monitoring bổ sung

### 1. Kafka UI
Truy cập: http://localhost:8080
- Visual monitoring
- Topic management
- Consumer group tracking

### 2. Check Kafka Logs
```powershell
docker logs kafka -f
```

### 3. Check Topics
```powershell
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --list
docker exec kafka kafka-topics --bootstrap-server localhost:9092 --describe --topic file-events
```

### 4. Check Consumer Groups
```powershell
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --list
docker exec kafka kafka-consumer-groups --bootstrap-server localhost:9092 --describe --group automation-service-group
```

## ⚡ Optimization Tips

### Nếu throughput thấp:

1. **Tăng batch size**
   ```properties
   linger.ms=10
   batch.size=32768
   ```

2. **Tăng buffer memory**
   ```properties
   buffer.memory=67108864
   ```

3. **Enable compression**
   ```properties
   compression.type=gzip
   ```

### Nếu latency cao:

1. **Giảm linger.ms**
   ```properties
   linger.ms=0
   ```

2. **Tăng số partitions**
   ```bash
   kafka-topics --alter --topic file-events --partitions 3
   ```

3. **Check network latency**
   - Kafka và services có cùng network?
   - Có bottleneck ở Redis/MongoDB?

## 🐛 Troubleshooting

### "Connection refused"
```bash
# Check Kafka container
docker ps | grep kafka

# Check Kafka logs
docker logs kafka

# Restart Kafka
docker-compose restart kafka
```

### "Topic not found"
Topics sẽ được tạo tự động nếu `auto.create.topics.enable=true` (đã enabled trong docker-compose)

### "Consumer timeout"
- Kafka đang bận xử lý messages khác
- Tăng `consumer_timeout_ms` trong Python script

## 📁 Files trong thư mục

- `kafka-performance-test.ps1` - PowerShell script (quick test)
- `kafka_speed_test.py` - Python script (detailed test)
- `requirements-kafka-test.txt` - Python dependencies
- `README-KAFKA-TEST.md` - Tài liệu này

## 🔗 Liên quan

- Kafka Configuration: `docker-compose.yml`
- Application Topics: `file-events`, `contract-events`
- Kafka Version: `confluentinc/cp-kafka:7.4.0`
