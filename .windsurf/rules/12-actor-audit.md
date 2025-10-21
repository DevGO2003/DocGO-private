---
id: "rule-actor-audit"
trigger: model_decision
description: |
  This rule establishes comprehensive actor identification and audit logging standards for DocGO microservices including user tracking, event correlation, security practices, and comprehensive audit trail management.
  It ensures proper actor identification across all system operations, consistent audit logging patterns, and robust security measures for sensitive data handling and compliance requirements.
  The rule covers event correlation, user session tracking, security event logging, and comprehensive audit trail maintenance to support regulatory compliance and system monitoring.
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
  - "**/audit/**"
  - "**/audit*.java"
tags:
  - actor
  - audit
  - event
  - logging
  - tracking
  - spring-boot
  - fastapi
  - implementation
  - standards
---

# Actor Standards cho Audit/Event trong DocGO

## Mục tiêu
- Chuẩn hóa Actor là danh tính thực hiện hành động để ghi nhận vào audit log và event payload
- Mặc định dùng `system` khi không xác định được người dùng
- Phân loại rõ ràng bằng tiền tố theo ngữ cảnh
- Bắt buộc lưu kèm metadata: `userId` (nếu có), `correlationId`, `ip/client`

## 1. Nguyên tắc cốt lõi

### Actor Definition
- **Actor** là danh tính thực hiện hành động để ghi nhận vào audit log và event payload
- **Mặc định** dùng `system` khi không xác định được người dùng
- **Phân loại** rõ ràng bằng tiền tố: `scheduler:`, `service:`, `worker:`, `integration:`, `webhook:`, `retry:`, `import:`/`export:`, `backfill:`, `cli:`, `impersonation:`
- **Bắt buộc** lưu kèm metadata: `userId` (nếu có), `correlationId`, `ip/client`

## 2. Bảng quy ước Actor theo ngữ cảnh

| Ngữ cảnh | Ví dụ trigger | Actor | Lý do | Ghi chú |
|----------|---------------|-------|-------|---------|
| Job nền theo lịch (cron) | APScheduler/Cron, batch ETL | `scheduler` | Phân biệt job định kỳ | Có thể ghi `scheduler:jobName` |
| Job nền không theo lịch | Retry/compensation, worker hàng đợi | `system` | Không gắn với user | Dùng chung khi không có user |
| Webhook nội bộ giữa services | Event nội bộ, callback S2S | `system` | Hệ thống gọi hệ thống | Kèm `correlationId` |
| Webhook bên thứ ba | Stripe, GitHub | `anonymous` | Nguồn công khai/không định danh | Log chữ ký: `X-Signature` |
| Lỗi parse/thiếu token | Header thiếu/không hợp lệ | `system` | Không thể xác định user | Ghi lại lý do vào metadata |
| Truy cập công khai | GET /public/* | `anonymous` | Không yêu cầu đăng nhập | Không nên cho phép hành động ghi |
| Script vận hành thủ công | Admin chạy script | `system` | Không có session người dùng | Ghi thêm `operator` vào metadata |
| Seed/Bootstrap dữ liệu | Khởi tạo mặc định | `system` | Một lần khi khởi tạo | Ghi rõ giai đoạn khởi tạo |
| API Gateway BFF | Yêu cầu qua BFF | `api-gateway` | Phân biệt lối vào | Vẫn ghi `userId` thực trong metadata |
| Microservice nội bộ | Gọi trực tiếp từ service | `service:<name>` | Rõ nguồn phát | Ví dụ: `service:ai-processing-service` |
| Worker xử lý hàng đợi | Kafka/Redis queue | `worker:<queue>` | Rõ kênh xử lý | Ví dụ: `worker:kafka-contracts` |
| Migration DB | Flyway/Liquibase/Alembic | `migration:<id>` | Theo dõi thay đổi schema | Ví dụ: `migration:2025-09-15-01` |
| Bootstrap hệ thống | Khởi chạy ban đầu | `bootstrap` | Giai đoạn init | Phân biệt với seed |
| Tích hợp bên thứ ba | SDK/provider gọi | `integration:<provider>` | Rõ nguồn tích hợp | Ví dụ: `integration:stripe` |
| Webhook bên ngoài | Slack/GitHub | `webhook:<provider>` | Phân loại nguồn | Ví dụ: `webhook:slack` |
| Health check/đồng bộ | Probes/sync | `health-check` | Không can thiệp nghiệp vụ | Chỉ đọc/truy vấn |
| Retry tự động | Transient error | `retry:<reason>` | Minh bạch nguyên nhân | Ví dụ: `retry:timeout` |
| Backfill dữ liệu | Nạp dữ liệu quá khứ | `backfill:<job>` | Phân biệt batch đặc thù | Ví dụ: `backfill:contracts-2024` |
| Import/Export | Quy trình I/O dữ liệu | `import:<job>` / `export:<job>` | Rõ luồng dữ liệu | Ví dụ: `import:users-v1` |
| CLI nội bộ | Chạy từ máy dev/ops | `cli:<host|user>` | Truy vết nguồn CLI | Ví dụ: `cli:devbox01` |
| Impersonation | Admin mạo danh user | `impersonation:<adminId>` | Minh bạch trách nhiệm | Lưu `asUser:<userId>` trong metadata |

## 3. Implementation Guide

### Spring Boot (JPA)
```java
@Configuration
@EnableJpaAuditing
public class JpaAuditingConfig {
  @Bean
  public AuditorAware<String> auditorAware() {
    return () -> Optional.ofNullable(CurrentUser.get())
                         .or(() -> Optional.of("system"));
  }
}

// Usage in Entity
@Entity
@EntityListeners(AuditingEntityListener.class)
public class User {
  @CreatedBy
  private String createdBy;
  
  @LastModifiedBy
  private String lastModifiedBy;
  
  // ... other fields
}

// Custom Actor Resolution
@Component
public class ActorResolver {
  public String resolveActor(HttpServletRequest request) {
    // Try to get user from security context
    String userId = SecurityContextHolder.getContext()
        .getAuthentication()
        .getName();
    
    if (userId != null && !"anonymousUser".equals(userId)) {
      return "user:" + userId;
    }
    
    // Check for service-to-service calls
    String serviceName = request.getHeader("X-Service-Name");
    if (serviceName != null) {
      return "service:" + serviceName;
    }
    
    // Check for webhook calls
    String webhookProvider = request.getHeader("X-Webhook-Provider");
    if (webhookProvider != null) {
      return "webhook:" + webhookProvider;
    }
    
    // Default to system
    return "system";
  }
}
```

### FastAPI
```python
from fastapi import Request
from typing import Optional

def get_actor(request: Request) -> str:
    # Try to get user from request state
    user_id = getattr(request.state, "user_id", None)
    if user_id:
        return f"user:{user_id}"
    
    # Check for service-to-service calls
    service_name = request.headers.get("X-Service-Name")
    if service_name:
        return f"service:{service_name}"
    
    # Check for webhook calls
    webhook_provider = request.headers.get("X-Webhook-Provider")
    if webhook_provider:
        return f"webhook:{webhook_provider}"
    
    # Check for scheduler calls
    scheduler_job = request.headers.get("X-Scheduler-Job")
    if scheduler_job:
        return f"scheduler:{scheduler_job}"
    
    # Default to system
    return "system"

# Usage in endpoints
@app.post("/api/users")
async def create_user(request: Request, user_data: UserCreate):
    actor = get_actor(request)
    
    # Log audit event
    await audit_service.log_event(
        event_type="UserCreated",
        actor=actor,
        data=user_data.dict(),
        metadata={
            "userId": getattr(request.state, "user_id", None),
            "correlationId": request.headers.get("X-Correlation-ID"),
            "ip": request.client.host
        }
    )
    
    # ... create user logic
```

## 4. Event Payload với Actor

### Event Structure
```json
{
  "eventVersion": "1.0",
  "eventType": "UserCreated",
  "eventId": "evt_1234567890_abcdef",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "user-management-service",
  "correlationId": "req_abc123def456",
  "actor": "user:12345",
  "data": {
    "userId": "12345",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "metadata": {
    "userId": "12345",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "sess_xyz789"
  }
}
```

### Actor-specific Examples

#### User Action
```json
{
  "actor": "user:12345",
  "metadata": {
    "userId": "12345",
    "ip": "192.168.1.100",
    "userAgent": "Mozilla/5.0...",
    "sessionId": "sess_xyz789"
  }
}
```

#### System Action
```json
{
  "actor": "system",
  "metadata": {
    "correlationId": "req_abc123def456",
    "reason": "automatic_cleanup"
  }
}
```

#### Service Action
```json
{
  "actor": "service:ai-processing-service",
  "metadata": {
    "correlationId": "req_abc123def456",
    "serviceVersion": "1.2.3"
  }
}
```

#### Scheduler Action
```json
{
  "actor": "scheduler:daily-cleanup",
  "metadata": {
    "jobId": "cleanup_20240115",
    "scheduledTime": "2024-01-15T02:00:00.000Z"
  }
}
```

## 5. Audit Logging Implementation

### Spring Boot Audit
```java
@Component
public class AuditLogger {
  
  @Autowired
  private AuditEventRepository auditEventRepository;
  
  public void logEvent(String eventType, String actor, Object data, Map<String, Object> metadata) {
    AuditEvent event = AuditEvent.builder()
        .eventType(eventType)
        .actor(actor)
        .data(data)
        .metadata(metadata)
        .timestamp(Instant.now())
        .build();
    
    auditEventRepository.save(event);
  }
}
```

### FastAPI Audit
```python
class AuditLogger:
    def __init__(self, audit_repository):
        self.audit_repository = audit_repository
    
    async def log_event(self, event_type: str, actor: str, data: dict, metadata: dict):
        event = {
            "eventType": event_type,
            "actor": actor,
            "data": data,
            "metadata": metadata,
            "timestamp": datetime.now().isoformat()
        }
        
        await self.audit_repository.save(event)
```

## 6. Best Practices

### Actor Resolution
- **Ưu tiên dùng `system`** khi không có user xác định
- **Chỉ dùng `anonymous`** cho truy cập công khai
- **Dùng `scheduler`** cho cron định kỳ
- **Luôn đính kèm `correlationId`** xuyên suốt các calls giữa microservices

### Metadata Requirements
- **userId**: Luôn có khi actor là user
- **correlationId**: Luôn có cho service-to-service calls
- **ip/client**: Luôn có cho user actions
- **Additional context**: Tùy theo ngữ cảnh cụ thể

### Error Handling
```java
// Handle actor resolution errors
try {
    String actor = actorResolver.resolveActor(request);
    auditLogger.logEvent("UserAction", actor, data, metadata);
} catch (Exception e) {
    // Fallback to system actor
    auditLogger.logEvent("UserAction", "system", data, metadata);
    logger.warn("Failed to resolve actor, using system: {}", e.getMessage());
}
```

## 7. Monitoring và Debugging

### Actor Statistics
```sql
-- Top actors by event count
SELECT actor, COUNT(*) as event_count
FROM audit_events
WHERE timestamp >= NOW() - INTERVAL 1 DAY
GROUP BY actor
ORDER BY event_count DESC;

-- Events by actor type
SELECT 
  CASE 
    WHEN actor LIKE 'user:%' THEN 'user'
    WHEN actor LIKE 'service:%' THEN 'service'
    WHEN actor LIKE 'scheduler:%' THEN 'scheduler'
    WHEN actor = 'system' THEN 'system'
    ELSE 'other'
  END as actor_type,
  COUNT(*) as count
FROM audit_events
GROUP BY actor_type;
```

### Debugging Queries
```sql
-- Find events by specific actor
SELECT * FROM audit_events 
WHERE actor = 'user:12345' 
ORDER BY timestamp DESC;

-- Find events by correlation ID
SELECT * FROM audit_events 
WHERE JSON_EXTRACT(metadata, '$.correlationId') = 'req_abc123def456'
ORDER BY timestamp DESC;
```

---

**Lưu ý**: Actor standards này đảm bảo tính nhất quán và khả năng trace trong việc ghi nhận audit log và event payload cho DocGO ecosystem.