---
id: "rule-mcp-usage"
trigger: always_on
description: Quy tắc thiết lập Model Context Protocol (MCP) usage standards cho DocGO bao gồm database operations, external APIs, và browser automation với comprehensive error handling và performance optimization. Ưu tiên MCP tools hơn terminal commands cho database queries, GitHub operations, và browser interactions để đảm bảo faster, safer, và more reliable operations. Quy tắc bao gồm retry logic, fallback strategies, security practices, audit logging, và performance monitoring để duy trì high-quality external system integrations.
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
  - mcp
  - tools
  - database
  - mongodb
  - redis
  - github
  - browser
  - chrome
  - automation
  - fallback
  - performance
  - batching
  - parallel
  - security
  - audit
  - tracing
  - error-handling
  - retries
  - limits
  - caching
  - schema
  - aggregate
  - count
  - collections
  - metrics
---
# Quy tắc sử dụng MCP cho Chat và Database

## Nguyên tắc cốt lõi
- **MCP (Model Context Protocol)** là công cụ mạnh mẽ để tương tác với external systems
- **Ưu tiên sử dụng MCP** khi cần truy cập database, external APIs, hoặc tools bên ngoài
- **Không sử dụng terminal commands** khi có MCP tools tương đương
- **MCP tools nhanh hơn và an toàn hơn** so với terminal commands

## Quy tắc sử dụng MCP theo ngữ cảnh

### 1. Database Operations (MongoDB, Redis, etc.)

#### ✅ SỬ DỤNG MCP:
- **Xem dữ liệu trong database**: `mcp_MongoDB_list_collections`, `mcp_MongoDB_find`
- **Kiểm tra schema**: `mcp_MongoDB_schema`
- **Thống kê database**: `mcp_MongoDB_db_stats`, `mcp_MongoDB_storage_size`
- **Truy vấn dữ liệu**: `mcp_MongoDB_aggregate`, `mcp_MongoDB_count`
- **Quản lý collections**: `mcp_MongoDB_create_collection`, `mcp_MongoDB_drop_collection`

#### ❌ KHÔNG SỬ DỤNG:
- `docker exec` để vào MongoDB shell
- Terminal commands để connect database
- Manual database queries qua terminal

#### Ví dụ sử dụng:
```javascript
// ✅ ĐÚNG: Sử dụng MCP để xem collections
mcp_MongoDB_list_collections()

// ✅ ĐÚNG: Sử dụng MCP để tìm dữ liệu
mcp_MongoDB_find({
  collection: "users",
  query: { status: "active" },
  limit: 10
})

// ❌ SAI: Sử dụng terminal
run_terminal_cmd("docker exec -it mongodb mongo --eval 'db.users.find()'")
```

### 2. GitHub Operations

#### ✅ SỬ DỤNG MCP:
- **Tạo repository**: `mcp_Github_create_repository`
- **Tạo issue/PR**: `mcp_Github_create_issue`, `mcp_Github_create_pull_request`
- **Tìm kiếm code**: `mcp_Github_search_code`
- **Quản lý files**: `mcp_Github_create_or_update_file`, `mcp_Github_push_files`

#### ❌ KHÔNG SỬ DỤNG:
- `git` commands qua terminal khi có MCP tương đương
- Manual GitHub API calls

### 3. Browser Operations

#### ✅ SỬ DỤNG MCP:
- **Navigate**: `mcp_Chrome_navigate_page`
- **Take screenshot**: `mcp_Chrome_take_screenshot`
- **Interact with elements**: `mcp_Chrome_click`, `mcp_Chrome_fill`
- **Debug**: `mcp_Chrome_list_console_messages`, `mcp_Chrome_list_network_requests`

#### ❌ KHÔNG SỬ DỤNG:
- Manual browser automation
- Selenium scripts qua terminal

### 4. Discord Operations

#### ✅ SỬ DỤNG MCP:
- **Send messages**: `mcp_Discord_send_message`
- **Read messages**: `mcp_Discord_read_messages`
- **Manage listeners**: `mcp_Discord_create_listener`, `mcp_Discord_remove_listener`

## Quy tắc ưu tiên MCP Tools

### Thứ tự ưu tiên:
1. **MCP Tools** (cao nhất) - Nhanh, an toàn, có error handling
2. **Codebase Search** - Tìm kiếm trong code
3. **File Operations** - Đọc/ghi file
4. **Terminal Commands** (thấp nhất) - Chỉ khi không có MCP tương đương

### Ví dụ workflow tối ưu:

#### Scenario: Kiểm tra dữ liệu MongoDB
```javascript
// 1. ✅ Sử dụng MCP để list collections
const collections = await mcp_MongoDB_list_collections()

// 2. ✅ Sử dụng MCP để xem schema
const schema = await mcp_MongoDB_schema({
  collection: "users"
})

// 3. ✅ Sử dụng MCP để tìm dữ liệu
const users = await mcp_MongoDB_find({
  collection: "users",
  query: { status: "active" },
  limit: 5
})

// 4. ✅ Sử dụng MCP để thống kê
const stats = await mcp_MongoDB_db_stats()
```

#### Scenario: Debug frontend issue
```javascript
// 1. ✅ Sử dụng MCP để navigate
await mcp_Chrome_navigate_page({
  url: "http://localhost:3000"
})

// 2. ✅ Sử dụng MCP để take screenshot
await mcp_Chrome_take_screenshot({
  fullPage: true
})

// 3. ✅ Sử dụng MCP để check console
const consoleLogs = await mcp_Chrome_list_console_messages()

// 4. ✅ Sử dụng MCP để check network
const networkRequests = await mcp_Chrome_list_network_requests()
```

## Quy tắc Error Handling với MCP

### Khi MCP tool fails:
1. **Retry với parameters khác** nếu có thể
2. **Fallback về terminal commands** chỉ khi cần thiết
3. **Log error và suggest alternatives**

### Ví dụ error handling:
```javascript
try {
  // Thử MCP trước
  const result = await mcp_MongoDB_find({
    collection: "users",
    query: { status: "active" }
  })
} catch (error) {
  // Fallback về terminal nếu MCP fails
  console.log("MCP failed, using terminal fallback")
  run_terminal_cmd("docker exec -it mongodb mongo --eval 'db.users.find({status: \"active\"})'")
}
```

## Quy tắc Performance với MCP

### Tối ưu hóa:
- **Batch operations** khi có thể
- **Sử dụng limit** cho queries lớn
- **Cache results** khi cần thiết
- **Parallel operations** khi không có dependency

### Ví dụ tối ưu:
```javascript
// ✅ Tốt: Parallel operations
const [collections, stats, schema] = await Promise.all([
  mcp_MongoDB_list_collections(),
  mcp_MongoDB_db_stats(),
  mcp_MongoDB_schema({ collection: "users" })
])

// ✅ Tốt: Sử dụng limit
const users = await mcp_MongoDB_find({
  collection: "users",
  query: {},
  limit: 100  // Giới hạn kết quả
})
```

## Quy tắc Security với MCP

### Bảo mật:
- **Không expose sensitive data** trong MCP calls
- **Sử dụng environment variables** cho credentials
- **Validate input parameters** trước khi gọi MCP
- **Log MCP operations** để audit

### Ví dụ bảo mật:
```javascript
// ✅ An toàn: Sử dụng env vars
const mongoUri = process.env.MONGODB_URI

// ✅ An toàn: Validate input
if (!collectionName || typeof collectionName !== 'string') {
  throw new Error('Invalid collection name')
}

// ✅ An toàn: Gọi MCP với validated input
const result = await mcp_MongoDB_find({
  collection: collectionName,
  query: validatedQuery
})
```

## Checklist sử dụng MCP

### Trước khi sử dụng MCP:
- [ ] Kiểm tra có MCP tool tương đương không?
- [ ] MCP tool có phù hợp với use case không?
- [ ] Có cần fallback plan không?
- [ ] Input parameters đã được validate chưa?

### Khi sử dụng MCP:
- [ ] Sử dụng error handling
- [ ] Log operations nếu cần
- [ ] Tối ưu performance (limit, batch)
- [ ] Đảm bảo security

### Sau khi sử dụng MCP:
- [ ] Kiểm tra kết quả có đúng không?
- [ ] Có cần retry với parameters khác không?
- [ ] Có cần fallback về terminal không?

---

# Chuẩn hóa Actor cho Audit/Event

## Nguyên tắc cốt lõi
- Actor là danh tính thực hiện hành động để ghi nhận vào audit log và event payload.
- Mặc định dùng `system` khi không xác định được người dùng.
- Phân loại rõ ràng bằng tiền tố: `scheduler:`, `service:`, `worker:`, `integration:`, `webhook:`, `retry:`, `import:`/`export:`, `backfill:`, `cli:`, `impersonation:`.
- Bắt buộc lưu kèm metadata: `userId` (nếu có), `correlationId`, `ip/client`.

## Bảng quy ước Actor theo ngữ cảnh

| Ngữ cảnh | Ví dụ trigger | Actor | Lý do | Ghi chú |
|---|---|---|---|---|
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
| Tích hợp bên thứ ba | SDK/provider gọi | `integration:<provider>` | Rõ nguồn tích hợp | Ví dụ: `bard:stripe` |
| Webhook bên ngoài | Slack/GitHub | `webhook:<provider>` | Phân loại nguồn | Ví dụ: `webhook:slack` |
| Health check/đồng bộ | Probes/sync | `health-check` | Không can thiệp nghiệp vụ | Chỉ đọc/truy vấn |
| Retry tự động | Transient error | `retry:<reason>` | Minh bạch nguyên nhân | Ví dụ: `retry:timeout` |
| Backfill dữ liệu | Nạp dữ liệu quá khứ | `backfill:<job>` | Phân biệt batch đặc thù | Ví dụ: `backfill:contracts-2024` |
| Import/Export | Quy trình I/O dữ liệu | `import:<job>` / `export:<job>` | Rõ luồng dữ liệu | Ví dụ: `import:users-v1` |
| CLI nội bộ | Chạy từ máy dev/ops | `cli:<host|user>` | Truy vết nguồn CLI | Ví dụ: `cli:devbox01` |
| Impersonation | Admin mạo danh user | `impersonation:<adminId>` | Minh bạch trách nhiệm | Lưu `asUser:<userId>` trong metadata |

## Hướng dẫn áp dụng nhanh

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
```

### FastAPI
```python
def get_actor(request: Request) -> str:
    return getattr(request.state, "user_id", None) or "system"
```

## Ghi chú triển khai
- Ưu tiên dùng `system` khi không có user xác định; chỉ dùng `anonymous` cho truy cập công khai và `scheduler` cho cron định kỳ.
- Luôn đính kèm `correlationId` xuyên suốt các calls giữa microservices để dễ trace.

---

**Lưu ý**: Quy tắc này đảm bảo việc sử dụng MCP tools một cách hiệu quả và an toàn, đặc biệt quan trọng khi làm việc với database và external systems, đồng thời chuẩn hóa actor cho audit/event toàn dự án.