<!-- 897c3a4a-7161-4191-96f7-ff8a51596239 7851c29b-a11a-4777-addf-7ed6dcc85406 -->
# Kế hoạch: Sửa tất cả Document Management References

## Mục tiêu
Sửa tất cả 33 references còn lại từ `document-management-service` thành `file-management-service` trong toàn bộ repository.

## Phân loại files cần sửa

### 1. Critical Files (Ưu tiên cao)

#### File Management Service README
**File**: `backend/file-management-service/README.md`

Cần thay thế:
- `/api/v1/document-management-service/` → `/api/v1/file-management-service/`
- Tổng cộng ~10 occurrences trong API endpoints section

#### Test Scripts
**File**: `test-api.ps1`

Cần thay thế:
- `http://localhost:8002/api/v1/document-management-service/v1/` → `http://localhost:8002/api/v1/file-management-service/v1/`
- 3 occurrences trong các API calls

#### API Documentation
**File**: `docs/API-URL-Usage-Guide.md`

Cần thay thế:
- `http://document-management-service:8002` → `http://file-management-service:8002`
- `/api/v1/document-management-service/` → `/api/v1/file-management-service/`
- ~4 occurrences

### 2. Documentation Files

#### Architecture Sequence Diagram
**File**: `documents/architecture/sequence-kafka-mongodb.md`

Cần thay thế:
- `/api/v1/document-management-service/v1/documents` → `/api/v1/file-management-service/v1/documents`
- 3 occurrences trong mermaid diagrams

#### API Response Sample
**File**: `documents/architecture/api-response-sample.json`

Cần thay thế:
- `"path": "/api/v1/document-management-service/v1/documents/DOC-2024-004-NEW"` → `"path": "/api/v1/file-management-service/v1/documents/DOC-2024-004-NEW"`

### 3. Plan Files

#### Plan File 1
**File**: `.cursor/plans/rut-gon-url-services-78e215c1.plan.md`

Cần thay thế:
- `/api/v1/document-management-service/` → `/api/v1/file-management-service/`
- 3 occurrences

#### Plan File 2
**File**: `.cursor/plans/doc-4c6a3fdf.plan.md`

Cần thay thế:
- `document-management-service` → `file-management-service`
- 3 occurrences trong docker logs commands

### 4. HTML Report
**File**: `bao-cao-2025-10-05.html`

Cần thay thế:
- `<td>document-management-service</td>` → `<td>file-management-service</td>`

### 5. File cần xóa

#### Start Script
**File**: `start-document-service.ps1`

Action: Xóa file này vì không còn sử dụng

## Thứ tự thực hiện

1. Sửa File Management Service README (Critical)
2. Sửa Test Scripts (Critical)
3. Sửa API Documentation (Critical)
4. Sửa Architecture Documentation
5. Sửa API Response Sample
6. Sửa Plan Files
7. Sửa HTML Report
8. Xóa start-document-service.ps1

## Kiểm tra sau khi sửa

1. Grep toàn bộ repo để đảm bảo không còn references:
   ```bash
   grep -r "document-management-service" /home/thaigo/DocGO-Private --exclude-dir=.git
   grep -r "document-management" /home/thaigo/DocGO-Private --exclude-dir=.git
   ```

2. Kiểm tra các test scripts có chạy được không:
   ```bash
   # Kiểm tra syntax của test-api.ps1
   pwsh -NoProfile -Command "Get-Content test-api.ps1"
   ```

3. Xác nhận file start-document-service.ps1 đã bị xóa

## Lưu ý

- Tất cả thay đổi chỉ là text replacement, không ảnh hưởng đến logic code
- Các file documentation và plan files là read-only, chỉ cập nhật để đồng bộ
- Sau khi sửa xong, tất cả references sẽ trỏ đến file-management-service

### To-dos

- [ ] Sửa backend/file-management-service/README.md - thay thế document-management-service thành file-management-service
- [ ] Sửa test-api.ps1 - cập nhật URLs từ document-management-service thành file-management-service
- [ ] Sửa docs/API-URL-Usage-Guide.md - cập nhật service URLs và endpoints
- [ ] Sửa documents/architecture/sequence-kafka-mongodb.md - cập nhật sequence diagrams
- [ ] Sửa documents/architecture/api-response-sample.json - cập nhật path trong response
- [ ] Sửa các plan files trong .cursor/plans/ - cập nhật references
- [ ] Sửa bao-cao-2025-10-05.html - cập nhật service name trong table
- [ ] Xóa start-document-service.ps1 - file không còn sử dụng
- [ ] Kiểm tra toàn bộ repo để đảm bảo không còn references