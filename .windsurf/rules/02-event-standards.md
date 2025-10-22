---
id: "rule-event-standards"
trigger: model_decision
description: Quy tắc chuẩn hóa event-driven architecture patterns cho DocGO microservices bao gồm event payload schemas, event types, và Kafka/Redis implementation. Đảm bảo consistent event publishing, consumption, và processing với proper error handling, retry logic, và monitoring capabilities. Quy tắc bao gồm event versioning, correlation tracking, actor identification, và comprehensive event storage cho audit trails và system observability. 
globs:
  - "**/*.java"
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.json"
  - "**/*.yaml"
  - "**/*.yml"
  - "**/*.xml"
  - "**/*.md"
  - "**/*.txt"
  - "**/*.html"
  - "**/src/**/*.*"
  - "**/config/**/*.*"
  - "**/scripts/**/*.*"
tags:
  - event
  - payload
  - schema
  - kafka
  - redis
  - messaging
  - audit
  - notification
---

# Event Payload Standards cho DocGO

## Mục tiêu
- Chuẩn hóa Event payload schema cho tất cả microservices
- Đồng nhất Event types và implementation
- Tối ưu hóa messaging giữa các services
- Đảm bảo audit trail và tracing

## 1. Event Payload Schema Chuẩn

### Cấu trúc cơ bản
```json
{
  "eventVersion": "1.0",
  "eventType": "FileUploaded",
  "eventId": "evt_1234567890abcdef",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "repository-management-service",
  "correlationId": "req_abc123def456",
  "actor": "user:12345",
  "data": {
    // Event-specific payload
  },
  "metadata": {
    "userId": "12345",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "sess_xyz789"
  }
}
```

### Các trường bắt buộc
- **eventVersion**: Phiên bản schema (string, format: "1.0", "2.0")
- **eventType**: Loại event (string, PascalCase)
- **eventId**: ID duy nhất (string, format: "evt_[timestamp]_[random]")
- **timestamp**: Thời gian tạo event (ISO 8601 string)
- **source**: Service tạo event (string, kebab-case)
- **correlationId**: ID liên kết request (string, optional)
- **actor**: Người thực hiện (string, format: "user:123" hoặc "system")
- **data**: Payload chính (object, tùy theo eventType)
- **metadata**: Thông tin bổ sung (object, optional)

## 2. Event Types Chuẩn

### File Management Events
- `FileUploaded`: File được upload thành công
- `FileProcessed`: File được xử lý (OCR, AI)
- `FileDeleted`: File bị xóa
- `FileDownloaded`: File được download
- `FileShared`: File được chia sẻ

### User Management Events
- `UserCreated`: User được tạo mới
- `UserUpdated`: User được cập nhật
- `UserDeleted`: User bị xóa
- `UserLoggedIn`: User đăng nhập
- `UserLoggedOut`: User đăng xuất
- `PasswordChanged`: Mật khẩu thay đổi

### Automation Events
- `DocumentProcessed`: Tài liệu được xử lý AI
- `OCRCompleted`: OCR hoàn thành
- `ClassificationCompleted`: Phân loại hoàn thành
- `SummaryGenerated`: Tóm tắt được tạo
- `AutomationFailed`: Automation thất bại

### System Events
- `ServiceStarted`: Service khởi động
- `ServiceStopped`: Service dừng
- `HealthCheckFailed`: Health check thất bại
- `ErrorOccurred`: Lỗi xảy ra

## 3. Implementation Standards

### Python (FastAPI)
```python
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import uuid

class EventPayload(BaseModel):
    eventVersion: str = "1.0"
    eventType: str
    eventId: str = None
    timestamp: datetime = None
    source: str
    correlationId: Optional[str] = None
    actor: str
    data: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None
    
    def __init__(self, **data):
        if not data.get('eventId'):
            data['eventId'] = f"evt_{int(datetime.now().timestamp())}_{uuid.uuid4().hex[:8]}"
        if not data.get('timestamp'):
            data['timestamp'] = datetime.now().isoformat()
        super().__init__(**data)

# Event Publisher
class EventPublisher:
    def __init__(self, kafka_producer=None, redis_client=None):
        self.kafka = kafka_producer
        self.redis = redis_client
    
    async def publish(self, event: EventPayload):
        # Publish to Kafka
        if self.kafka:
            await self.kafka.send('docgo-events', event.dict())
        
        # Publish to Redis
        if self.redis:
            await self.redis.publish('docgo-events', event.json())
```

### Java (Spring Boot)
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventPayload {
    private String eventVersion = "1.0";
    private String eventType;
    private String eventId;
    private String timestamp;
    private String source;
    private String correlationId;
    private String actor;
    private Map<String, Object> data;
    private Map<String, Object> metadata;
    
    @PrePersist
    public void prePersist() {
        if (eventId == null) {
            this.eventId = "evt_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8);
        }
        if (timestamp == null) {
            this.timestamp = Instant.now().toString();
        }
    }
}

// Event Publisher
@Component
public class EventPublisher {
    @Autowired
    private KafkaTemplate<String, EventPayload> kafkaTemplate;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public void publish(EventPayload event) {
        // Publish to Kafka
        kafkaTemplate.send("docgo-events", event);
        
        // Publish to Redis
        redisTemplate.convertAndSend("docgo-events", event);
    }
}
```

## 4. Event Handling & Processing

### Event Consumer Pattern
```python
# Python
@router.post("/events/consume")
async def consume_event(event: EventPayload):
    try:
        # Process event based on eventType
        if event.eventType == "FileUploaded":
            await handle_file_uploaded(event)
        elif event.eventType == "UserCreated":
            await handle_user_created(event)
        # ... other event types
        
        return {"status": "success", "processed": event.eventId}
    except Exception as e:
        logger.error(f"Failed to process event {event.eventId}: {str(e)}")
        raise HTTPException(status_code=500, detail="Event processing failed")
```

### Error Handling cho Events
- **Retry Logic**: Tối đa 3 lần retry với exponential backoff
- **Dead Letter Queue**: Events thất bại sau 3 lần retry
- **Monitoring**: Log tất cả events và errors
- **Idempotency**: Tránh xử lý duplicate events

## 5. Event Storage & Querying

### MongoDB Collection Structure
```javascript
// Collection: events
{
  _id: ObjectId,
  eventId: "evt_1234567890_abcdef",
  eventType: "FileUploaded",
  source: "repository-management-service",
  actor: "user:12345",
  timestamp: ISODate("2024-01-15T10:30:00.000Z"),
  correlationId: "req_abc123def456",
  data: { /* event-specific data */ },
  metadata: { /* additional info */ },
  processed: true,
  processedAt: ISODate("2024-01-15T10:30:01.000Z"),
  createdAt: ISODate("2024-01-15T10:30:00.000Z")
}
```

### Query Patterns
```javascript
// Tìm events theo user
db.events.find({"actor": "user:12345"})

// Tìm events theo type
db.events.find({"eventType": "FileUploaded"})

// Tìm events trong khoảng thời gian
db.events.find({
  "timestamp": {
    $gte: ISODate("2024-01-01T00:00:00.000Z"),
    $lt: ISODate("2024-01-31T23:59:59.999Z")
  }
})

// Tìm events chưa được xử lý
db.events.find({"processed": false})
```

## 6. Best Practices

### Event Naming
- **eventType**: PascalCase, mô tả rõ hành động
- **eventId**: Format "evt_[timestamp]_[random]"
- **source**: Tên service (kebab-case)
- **actor**: Format "user:[id]" hoặc "system"

### Performance
- **Batch Processing**: Xử lý events theo batch
- **Async Processing**: Không block main thread
- **Caching**: Cache event schemas và handlers
- **Monitoring**: Track event processing metrics

### Security
- **Validation**: Validate event payload trước khi xử lý
- **Encryption**: Encrypt sensitive data trong event
- **Access Control**: Kiểm tra quyền truy cập event
- **Audit Trail**: Log tất cả event operations

## 7. Testing Events

### Unit Tests
```python
def test_file_uploaded_event():
    event = EventPayload(
        eventType="FileUploaded",
        source="repository-management-service",
        actor="user:12345",
        data={"fileId": "file_123", "fileName": "test.pdf"}
    )
    
    assert event.eventType == "FileUploaded"
    assert event.eventId.startswith("evt_")
    assert event.timestamp is not None
```

### Integration Tests
```python
async def test_event_publishing():
    event = create_test_event()
    await event_publisher.publish(event)
    
    # Verify event was published
    published_events = await get_published_events()
    assert len(published_events) == 1
    assert published_events[0].eventId == event.eventId
```

---

**Lưu ý**: Event standards này đảm bảo tính nhất quán và khả năng mở rộng cho hệ thống messaging của DocGO, đồng thời hỗ trợ audit trail và monitoring hiệu quả.