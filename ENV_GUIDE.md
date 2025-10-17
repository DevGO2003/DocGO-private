# DocGO Environment Configuration Guide

## Tổng quan

DocGO sử dụng cấu trúc biến môi trường phân tầng để quản lý cấu hình một cách có tổ chức và dễ bảo trì. Hệ thống được thiết kế để hỗ trợ nhiều môi trường khác nhau (development, docker, production) với fallback values thông minh.

## Cấu trúc phân tầng

### 1. Root `.env` - Infrastructure Shared
**Vị trí**: `.env` (root directory)
**Mục đích**: Chứa các biến môi trường được chia sẻ giữa tất cả services

```env
# ==========================================
# DATABASE CONFIGURATION (Shared)
# ==========================================
MONGODB_ATLAS_URI=mongodb+srv://...
MONGODB_USER_DATABASE=docgo_user_service
MONGODB_DOCUMENT_DATABASE=docgo_document_service
MONGODB_AUTOMATION_DATABASE=docgo_automation_service

# ==========================================
# MESSAGE BROKERS (Shared)
# ==========================================
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_CLIENT_ID_PREFIX=docgo
KAFKA_GROUP_ID_PREFIX=docgo-group

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# ==========================================
# SERVICE URLS (Shared - for Docker internal communication)
# ==========================================
USER_MANAGEMENT_SERVICE_URL=http://user-management-service:8001
FILE_MANAGEMENT_SERVICE_URL=http://file-management-service:8002
AUTOMATION_SERVICE_URL=http://automation-service:8003
```

### 2. Service-specific `.env` files
**Vị trí**: `backend/[service]/.env`
**Mục đích**: Chứa các biến môi trường riêng của từng service

#### User Management Service
```env
# JWT Configuration
JWT_SECRET=TDVxrHruTI72tDCpmkwKPlyF7LmdlzKQ7x8D+P2BDw4=
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth2 Configuration
GOOGLE_CLIENT_ID=183573622288-...
GOOGLE_CLIENT_SECRET=GOCSPX-Z-...
```

#### Automation Service
```env
# Gemini AI Configuration
GEMINI_API_KEY=AIzaSyCVNL1FgEKmkYZV7ZAf_uvQXXuaVN3OTK0

# S3 Configuration (Filebase)
S3_ENABLED=true
S3_ENDPOINT=https://s3.filebase.com
S3_ACCESS_KEY_ID=D6D49B01A4B01DE0EA12
S3_SECRET_ACCESS_KEY=z9oNlDnVcW7eoVkLNquYzKFfv7Ca5vSz146KXeMX
S3_BUCKET=devgo2003-docgo-bucket
```

## Config Modules

### Python Services
Mỗi Python service có một `config.py` tập trung:

```python
from config import Config

# Sử dụng config
kafka_servers = Config.KAFKA_BOOTSTRAP_SERVERS
gemini_key = Config.get_gemini_api_key()
user_service_url = Config.get_user_service_url()
```

### TypeScript Services
API Gateway sử dụng `lib/config.ts`:

```typescript
import { Config } from './lib/config';

// Sử dụng config
const userServiceUrl = Config.getUserManagementServiceUrl();
const corsOrigins = Config.getCorsOrigins();
```

## Fallback Values Chuẩn hóa

### Nguyên tắc chung
1. **Infrastructure services**: Fallback mặc định dùng Docker service names
2. **External APIs**: Bắt buộc, không có fallback
3. **Service URLs**: Smart URL building dựa trên environment

### Ví dụ cụ thể

#### Kafka Configuration
```python
# Fallback: kafka:9092 (Docker service name)
KAFKA_BOOTSTRAP_SERVERS = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "kafka:9092")
```

#### Service URLs
```typescript
// Smart URL building
static getUserManagementServiceUrl(): string {
  return process.env.USER_MANAGEMENT_SERVICE_URL || 
         (this.isDocker() ? 'http://user-management-service:8001' : 'http://localhost:8001');
}
```

#### External APIs (Required)
```python
@classmethod
def get_gemini_api_key(cls) -> str:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("Biến môi trường GEMINI_API_KEY chưa được thiết lập.")
    return api_key
```

## Môi trường Development

### Local Development (không Docker)
```bash
# Override trong terminal hoặc .env.local
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
REDIS_HOST=localhost
USER_MANAGEMENT_SERVICE_URL=http://localhost:8001
```

### Docker Development
```bash
# Không cần override, dùng fallback mặc định
# Vì fallback đã là Docker service names
```

### Production
```bash
# .env.production
KAFKA_BOOTSTRAP_SERVERS=kafka-cluster.production.internal:9092
REDIS_HOST=redis-cluster.production.internal
MONGODB_ATLAS_URI=mongodb+srv://prod-user:***@prod-cluster.mongodb.net/
```

## Docker Compose Configuration

### Cấu trúc mới (đã tối ưu)
```yaml
services:
  user-management-service:
    env_file:
      - .env                                    # Infrastructure shared
      - ./backend/user-management-service/.env  # Service-specific
    environment:
      - ENVIRONMENT=docker                      # Override for Docker
```

### Lợi ích
- Loại bỏ trùng lặp biến môi trường
- Dễ override cho từng môi trường
- Tách biệt infrastructure và service-specific config

## Logging & Tracing

### Request Tracing
Mỗi request được gán unique ID để trace qua các services:

```json
{
  "requestId": "uuid-here",
  "correlationId": "uuid-here",
  "timestamp": "2025-10-11T10:30:00Z",
  "level": "info",
  "stage": "incoming",
  "method": "GET",
  "originalUrl": "/api/v1/file-management-service/v1/contracts",
  "query": { "pageNumber": 0, "pageSize": 9 },
  "clientIp": "::1"
}
```

### Structured Logging
Tất cả logs được format JSON với correlation ID:

```json
{
  "timestamp": "2025-10-11T10:30:00Z",
  "level": "info",
  "service": "automation-service",
  "message": "Processing file upload",
  "requestId": "uuid-here",
  "correlationId": "uuid-here",
  "extra_fields": {
    "stage": "file_processing",
    "fileName": "contract.pdf",
    "fileSize": 1024000
  }
}
```

## Troubleshooting

### Lỗi thường gặp

#### 1. Missing Environment Variables
```bash
# Kiểm tra biến môi trường
python -c "from config import Config; Config.validate_required_config()"
```

#### 2. Service Connection Issues
```bash
# Kiểm tra service URLs
python -c "from config import Config; print(Config.get_user_service_url())"
```

#### 3. Docker vs Local Environment
```bash
# Kiểm tra environment detection
python -c "from config import Config; print(f'Is Docker: {Config.is_docker()}')"
```

### Debug Commands

#### Kiểm tra cấu hình
```bash
# Python services
python -c "from config import Config; print(Config.__dict__)"

# TypeScript services
node -e "const { Config } = require('./lib/config'); console.log(Config.getConfig())"
```

#### Kiểm tra logs
```bash
# Xem logs với correlation ID
tail -f logs/automation-service.log | jq '.correlationId == "your-correlation-id"'
```

## Best Practices

### 1. Không hardcode URLs
```python
# ❌ BAD
kafka_servers = "localhost:9092"

# ✅ GOOD
kafka_servers = Config.KAFKA_BOOTSTRAP_SERVERS
```

### 2. Sử dụng Config module
```typescript
// ❌ BAD
const origin = 'http://localhost:3000';

// ✅ GOOD
const origin = Config.getCorsOrigins()[0];
```

### 3. Validate required config
```python
# Trong main.py hoặc startup
try:
    Config.validate_required_config()
except ValueError as e:
    print(f"Configuration error: {e}")
    sys.exit(1)
```

### 4. Log với context
```python
# Sử dụng logger với request context
logger.log_external_call(
    service="user-management",
    url="/api/v1/users",
    method="GET",
    status_code=200,
    duration_ms=150,
    request_id=request_id,
    correlation_id=correlation_id
)
```

## Migration Guide

### Từ cấu trúc cũ sang mới

#### 1. Di chuyển biến môi trường
- Infrastructure variables → root `.env`
- Service-specific variables → service `.env`

#### 2. Cập nhật code
- Thay thế `os.getenv()` trực tiếp bằng `Config` class
- Sử dụng smart URL building methods

#### 3. Cập nhật docker-compose
- Loại bỏ environment variables trùng lặp
- Chỉ giữ lại overrides cần thiết

#### 4. Test cấu hình
- Chạy validation scripts
- Test các môi trường khác nhau
- Kiểm tra logs có đầy đủ thông tin trace

## Security Notes

### 1. Không commit secrets
```bash
# .gitignore
.env
backend/*/env
```

### 2. Sử dụng .env.example
```bash
# Tạo template cho mỗi service
cp .env .env.example
# Xóa sensitive values trong .env.example
```

### 3. Production secrets
- Sử dụng Docker secrets hoặc external config management
- Không hardcode trong Dockerfile
- Rotate keys định kỳ

## Monitoring & Alerting

### 1. Log aggregation
- Tất cả logs được format JSON
- Dễ dàng parse và analyze
- Support correlation ID tracing

### 2. Health checks
- Mỗi service có health endpoint
- Monitor service connectivity
- Alert khi có lỗi configuration

### 3. Metrics
- Request duration tracking
- Error rate monitoring
- Service dependency mapping

