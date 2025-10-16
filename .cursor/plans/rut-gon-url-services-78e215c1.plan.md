<!-- 78e215c1-2e21-4dda-94f1-59ba4a5ba56b ee3b642d-96a0-4187-951c-2bbe02369be1 -->
# Kế hoạch: Rút gọn URL Services - Loại bỏ /v1 dư thừa

## Mục tiêu

Thay đổi URL pattern từ `/api/v1/{service-name}/v1/...` thành `/api/v1/{service-name}/...` cho tất cả 4 backend services và cập nhật frontend API calls tương ứng.

## Phạm vi thay đổi

### URL Pattern hiện tại:

- User Management: `/api/v1/user-management-service/v1/users`
- Document Management: `/api/v1/file-management-service/files`
- Automation Service: `/api/v1/automation-service/v1/documents`
- API Gateway: Proxy đến các URL trên

### URL Pattern mới:

- User Management: `/api/v1/user-management-service/users`
- Document Management: `/api/v1/file-management-service/files`
- Automation Service: `/api/v1/automation-service/documents`
- API Gateway: Proxy đến các URL mới

## Chi tiết thực hiện

Lưu ý: Đã mở rộng phạm vi để bao phủ thêm các vị trí phát hiện còn dùng `/v1` dư thừa trong API Gateway, Frontend (services nội bộ), và Automation contract_router.



### Phase 1: Backend Services (Ưu tiên)

#### 1.1. User Management Service (Spring Boot)

**File**: `backend/user-management-service/src/main/java/com/devgo2003/docgo/backend/user_service/controller/UserController.java`

Thay đổi:

```java
// Từ:
@RequestMapping("/api/v1/user-management-service/v1/users")

// Thành:
@RequestMapping("/api/v1/user-management-service/users")
```

**Ảnh hưởng**: Tất cả endpoints trong UserController (15+ endpoints)

#### 1.2. Document Management Service (Spring Boot)

**File**: `backend/file-management-service/src/main/java/com/devgo2003/docgo/file_service/controller/DocumentController.java`

Thay đổi:

```java
// Từ:
@RequestMapping("/api/v1/file-management-service/v1/files")

// Thành:
@RequestMapping("/api/v1/file-management-service/files")
```

**Ảnh hưởng**: Tất cả endpoints trong DocumentController

**Lưu ý**: Cần kiểm tra các Controller khác trong cùng service:

- Tìm tất cả `@RestController` với pattern `/v1/{service-name}/v1/`
- Sử dụng `grep -r "@RequestMapping.*v1.*v1" backend/file-management-service/`

#### 1.3. Automation Service (FastAPI)

**File**: `backend/automation-service/routers.py`

Thay đổi:

```python
# Từ:
router = APIRouter(prefix="/api/v1/automation-service")

# Endpoints hiện tại có thêm /v1 trong path definition
@router.post("/v1/documents/upload", ...)

# Cần kiểm tra tất cả @router decorators và loại bỏ /v1 nếu có
```

**Cách xử lý**:

1. Kiểm tra tất cả `@router.post/get/put/delete` trong file
2. Nếu path bắt đầu bằng `/v1/`, loại bỏ `/v1/`
3. Giữ nguyên prefix của router

**Endpoints cần kiểm tra**:

- `/documents/upload`
- `/document/extract`
- `/document/classify`
- `/batch/process`
- `/batch/status/{job_id}`
- `/batch/jobs`
- `/health`
- `/gemini/get-config`

### Phase 2: API Gateway

#### 2.1. Upload Proxy

**File**: `backend/api-gateway/pages/api/files/upload.ts`

Thay đổi:

```typescript
// Từ:
const automationUrl = new URL(`${process.env.AUTOMATION_SERVICE_URL}/api/v1/automation-service/v1/documents/upload`)

// Thành:
const automationUrl = new URL(`${process.env.AUTOMATION_SERVICE_URL}/api/v1/automation-service/documents/upload`)
```

**Lưu ý**: Kiểm tra các file proxy khác trong `backend/api-gateway/pages/api/`

### Phase 3: Frontend API Calls

#### 3.1. User API

**File**: `frontend/web-app/src/lib/apis/user-api.ts`

Thay đổi basePath:

```typescript
// Từ:
private basePath = '/api/v1/user-management-service/v1'

// Thành:
private basePath = '/api/v1/user-management-service'
```

**Ảnh hưởng**: Tất cả methods trong UserAPI class sử dụng basePath này

#### 3.2. Document API

**File**: `frontend/web-app/src/lib/apis/document-api.ts`

Thay đổi basePath:

```typescript
// Từ:
private basePath = '/api/v1/document-management-service/v1'

// Thành:
private basePath = '/api/v1/file-management-service'
```

**Ảnh hưởng**: Tất cả methods trong DocumentAPI class

#### 3.3. Automation API

**File**: `frontend/web-app/src/lib/apis/automation-api.ts`

Thay đổi basePath:

```typescript
// Từ:
private basePath = '/api/v1/automation-service/v1'

// Thành:
private basePath = '/api/v1/automation-service'
```

**Ảnh hưởng**: Tất cả methods trong AutomationAPI class

#### 3.4. Các file API khác

Kiểm tra và cập nhật các file sau nếu có sử dụng URL pattern cũ:

- `frontend/web-app/src/lib/api.ts`
- `frontend/web-app/src/lib/http/api-client.ts`
- `frontend/web-app/src/hooks/useDocumentProgress.tsx`
- `frontend/web-app/src/app/(documents)/documents/_constants/index.ts`

## Checklist thực hiện

### Backend (Ưu tiên)

- [ ] User Management Service: Cập nhật @RequestMapping trong UserController
- [ ] Document Management Service: Cập nhật @RequestMapping trong DocumentController và các Controllers khác
- [ ] Automation Service: Kiểm tra và cập nhật APIRouter prefix và các endpoint paths
- [ ] Grep toàn bộ backend để tìm pattern `/v1/.+-service/v1/` còn sót lại

### API Gateway

- [ ] Cập nhật upload.ts proxy endpoint
- [ ] Kiểm tra các file proxy khác trong pages/api/

### Frontend

- [ ] Cập nhật user-api.ts basePath
- [ ] Cập nhật document-api.ts basePath
- [ ] Cập nhật automation-api.ts basePath
- [ ] Kiểm tra api.ts và api-client.ts
- [ ] Kiểm tra useDocumentProgress.tsx (WebSocket URL)
- [ ] Grep frontend/web-app/src để tìm hardcoded URLs còn sót lại

### Testing

- [ ] Test User Management APIs qua Swagger UI (http://localhost:8001/docs)
- [ ] Test Document Management APIs qua Swagger UI (http://localhost:8002/docs)
- [ ] Test Automation APIs qua Swagger UI (http://localhost:8003/docs)
- [ ] Test upload flow từ frontend
- [ ] Test authentication flow từ frontend
- [ ] Test document list/detail từ frontend

### Documentation

- [ ] Cập nhật README.md với URL pattern mới
- [ ] Cập nhật API Standards trong .cursor/rules/02_api-standards.mdc
- [ ] Cập nhật ENV_GUIDE.md nếu có reference đến URLs

## Rủi ro và cách xử lý

### Rủi ro 1: Có thể còn hardcoded URLs

**Cách xử lý**:

- Sử dụng grep để tìm tất cả `/v1/.+-service/v1/` trong codebase
- Kiểm tra logs, test files, documentation

### Rủi ro 2: Docker environment variables

**Cách xử lý**:

- Kiểm tra docker-compose.yml và .env files
- Đảm bảo service URLs không có /v1 dư thừa

### Rủi ro 3: Integration tests có thể fail

**Cách xử lý**:

- Cập nhật test scripts (test-api.ps1, test-upload-flow.sh, etc.)
- Verify Swagger UI hiển thị đúng URLs mới

### Rủi ro 4: CORS configuration

**Cách xử lý**:

- Kiểm tra CorsConfig.java trong các Spring Boot services
- Đảm bảo allowed paths vẫn match với URL pattern mới

## Timeline ước tính

- Backend changes: 30 phút (tìm và thay thế @RequestMapping, APIRouter)
- API Gateway changes: 10 phút
- Frontend changes: 20 phút (cập nhật basePath trong 3 API classes)
- Testing: 30 phút (test qua Swagger và frontend)
- Documentation: 10 phút

**Tổng**: ~1.5 giờ

## Lưu ý quan trọng

1. **Thứ tự thực hiện**: Backend → API Gateway → Frontend để đảm bảo services sẵn sàng trước khi frontend gọi
2. **Backup trước khi thay đổi**: Commit current state trước khi bắt đầu
3. **Test từng service**: Test riêng lẻ qua Swagger UI trước khi test integration
4. **Không skip testing**: Đảm bảo tất cả major flows (login, upload, document list) đều hoạt động

### To-dos

- [ ] Cập nhật @RequestMapping trong UserController từ /api/v1/user-management-service/v1/users thành /api/v1/user-management-service/users
- [ ] Cập nhật @RequestMapping trong DocumentController và các controllers khác từ /api/v1/file-management-service/v1/* thành /api/v1/file-management-service/*
- [ ] Kiểm tra và cập nhật APIRouter prefix và endpoint paths trong routers.py để loại bỏ /v1 dư thừa
- [ ] Grep toàn bộ backend để tìm pattern /v1/.+-service/v1/ còn sót lại
- [ ] Cập nhật upload.ts proxy endpoint URL từ /api/v1/automation-service/v1/documents/upload thành /api/v1/automation-service/documents/upload
- [ ] Kiểm tra các file proxy khác trong pages/api/ có sử dụng URL pattern cũ
- [ ] Cập nhật basePath trong user-api.ts từ /api/v1/user-management-service/v1 thành /api/v1/user-management-service
- [ ] Cập nhật basePath trong document-api.ts từ /api/v1/file-management-service/v1 thành /api/v1/file-management-service
- [ ] Cập nhật basePath trong automation-api.ts từ /api/v1/automation-service/v1 thành /api/v1/automation-service
- [ ] Grep frontend/web-app/src để tìm hardcoded URLs với pattern /v1/.+-service/v1/ còn sót lại
- [ ] Test tất cả services qua Swagger UI: User (8001), Document (8002), Automation (8003)
- [ ] Test integration từ frontend: login, upload, document list/detail
- [ ] Cập nhật README.md và API Standards rules với URL pattern mới