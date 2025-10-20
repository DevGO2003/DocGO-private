---
id: "rule-api-standards"
description: "Chuẩn hóa URL patterns, RestResponse envelope, Controller/Router standards, và Exception handling cho DocGO APIs"
alwaysApply: false
globs:
  - "**/*Controller.java"
  - "**/*Router.py"
  - "**/routers.py"
  - "**/pages/api/**/*.ts"
  - "**/src/controllers/**/*.ts"
tags:
  - api
  - rest
  - controller
  - router
  - response
  - exception
  - swagger
  - documentation
---

# API Standards cho DocGO

## Mục tiêu
- Chuẩn hóa URL patterns, payload, error handling giữa các service
- Đồng nhất RestResponse envelope và exception handling
- Chuẩn hóa cách viết tài liệu API và Swagger
- Tối ưu workflow phát triển/triển khai

## 1) Quy tắc URL
- Base path: `/api/v1/{service-name}/...`
- `service-name` dùng kebab-case trùng tên service trong code:
  - `user-management-service`
  - `file-management-service`
  - `automation-service`
- Tài nguyên (resource) dùng số nhiều, kebab-case: `users`, `documents`, `automations`, `events`, `attachments`.
- Hành động (sub-resource) dùng tiếp đầu ngữ theo REST; chỉ khi là hành động phi-CRUD rõ ràng thì dùng hậu tố dạng action:
  - Chuẩn REST: `POST /users`, `GET /users`, `GET /users/{id}`, `PUT /users/{id}`, `DELETE /users/{id}`
  - Sub-resource: `GET /users/{id}/documents`, `GET /documents/{id}/attachments`, `PUT /users/{id}/restore`
  - Tác vụ Automation chuyên biệt (file hoặc chuỗi):
  - `POST /automation-service/process`
  - `POST /automation-service/validate`
- Query chuẩn phân trang, sắp xếp và lọc (giữ nguyên như trong controller):
  - `pageNumber`, `pageSize`, `sortBy`, `sortDirection`, `searchTerm`, `includeDeleted`

## 2) Tên hàm handler (Controller/Router)
- Java (Spring): dùng động từ rõ ràng, hiện tại đơn và mô tả ngắn: `createUser`, `getAllUsers`, `getUser`, `updateUser`, `softDeleteUser`, `restoreUser`, `getUserDocuments`, `getAttachments`.
- Python (FastAPI): dùng snake_case tương đương: `process_api`, `validate_api`.
- Tên biến path: dùng `{id}` cho định danh chính; sub-resource đặt sau `{id}`.

## 3) Payload và Content-Type
- CRUD JSON: `application/json` với body là DTO/entity tương ứng.
- Upload file: `multipart/form-data` với trường `file` (FastAPI) hoặc `@RequestPart`/`MultipartFile` (Spring) nếu có.
- Automation process cho phép 2 dạng đầu vào (chỉ 1 trong 2):
  - `multipart/form-data`: `file` (txt, pdf, docx)
  - `application/json`: `{ "data": "..." }`
- Phân trang: dùng query params như mục 1.

## 4) Chuẩn hóa Response Envelope (RestResponse)
- Tất cả response bọc trong RestResponse với: apiVersion, statusCode, shortMessage, description, data, timestamp, requestId, path
- HTTP status: 201 Created, 200 OK, 400 Bad Request, 404 Not Found, 409 Conflict, 500 Internal Server Error
- **Quan trọng**: KHÔNG BAO GIỜ trả HTTP 204, luôn dùng 200 OK với statusCode: 204 trong body

## 5) Ví dụ API
- Java: `POST /api/v1/user-management-service/users` → 201 + RestResponse<User>
- Python: `POST /api/v1/automation-service/process` → 200 + RestResponse<string>

## 6) Quy ước đặt tên mã nguồn
- Controller class (Java): `*Controller` theo tài nguyên chính, ví dụ `UserController`, `DocumentController`.
- Service class (Java): `*Service` với nghiệp vụ: `UserService`, `DocumentService`.
- Router (Python): nhóm theo `tags` và prefix chung; tên hàm ngắn, rõ mục đích (`process_api`, `validate_api`).
- Tên biến phản ánh ý nghĩa nghiệp vụ, tránh viết tắt.

## 7) Thứ tự API trong Controller
- **Luôn đặt API `getAll` (danh sách) ở trên API `getOne` (chi tiết)**
- Thứ tự chuẩn trong Controller:
  1. `@GetMapping` (getAll) - Lấy danh sách tất cả
  2. `@GetMapping("/{id}")` (getOne) - Lấy chi tiết theo ID
  3. `@PostMapping` (create) - Tạo mới
  4. `@PutMapping("/{id}")` (update) - Cập nhật
  5. `@DeleteMapping("/{id}")` (delete) - Xóa
  6. Các API khác theo thứ tự logic nghiệp vụ

- Thứ tự: getAll → getOne → create → update → delete

## 8) Bảo mật và versioning
- Luôn đặt tiền tố `/api/v1/…`. Khi thay đổi lớn không tương thích, phát hành `/api/v2/…` song song.
- Định nghĩa rõ header bảo mật (ví dụ JWT) ở tài liệu, ngay trong phần mô tả endpoint.

## 9) Cấu trúc mô tả API Swagger
- Controller: `@Tag(name = "...", description = "...")`
- Method: `@Operation(summary = "...")`
- Response: `RestResponse<T>` với statusCode, shortMessage, description, data
- Swagger UI: `/docs` cho tất cả services

## 10) Exception Handling

### Java (Spring Boot)
- **GlobalExceptionHandler** → RestResponse với HTTP status 400/404/409/500
- **Validation errors** → 400 Bad Request với danh sách lỗi chi tiết
- **Not found** → 404 Not Found với message rõ ràng
- **Conflict** → 409 Conflict khi xung đột dữ liệu
- **Server error** → 500 Internal Server Error với requestId

### Python (FastAPI)
- **HTTPException** hoặc **RestResponse 500** với requestId, timestamp, path
- **ValidationError** → 422 Unprocessable Entity
- **Custom exceptions** → Map sang HTTP status codes phù hợp

## 11) Tài liệu API (Swagger)

### Java (Spring Boot)
- **Controller**: `@Tag(name = "...", description = "...")`
- **Method**: `@Operation(summary = "...", description = "...")`
- **Response**: `RestResponse<T>` với statusCode, shortMessage, description, data
- **Swagger UI**: `/docs` cho tất cả services

### Python (FastAPI)
- **Router**: `tags` và `prefix` chung
- **Endpoint**: `summary`, `description`, `response_model`
- **Response**: Consistent với RestResponse format
- **Swagger UI**: `/docs` cho tất cả services

### Frontend (Next.js API Routes)
- **Route handler**: JSDoc comments với @param, @returns
- **Response**: Consistent với RestResponse format
- **Type definitions**: TypeScript interfaces cho request/response

## 12) Best Practices

### API Design
- **RESTful principles**: Sử dụng HTTP methods đúng mục đích
- **Consistent naming**: Kebab-case cho URLs, camelCase cho JSON
- **Versioning**: `/api/v1/` prefix, chuẩn bị cho v2
- **Pagination**: Standardized query parameters

### Error Handling
- **Consistent error format**: RestResponse cho tất cả errors
- **Meaningful error messages**: Mô tả rõ nguyên nhân lỗi
- **Proper HTTP status codes**: Sử dụng đúng status code
- **Request tracing**: Luôn có requestId để debug

### Documentation
- **Complete API docs**: Tất cả endpoints phải có documentation
- **Examples**: Request/response examples cho mỗi endpoint
- **Error responses**: Document tất cả possible error responses
- **Authentication**: Rõ ràng về auth requirements

---

**Lưu ý**: API standards này đảm bảo tính nhất quán và khả năng mở rộng cho tất cả APIs trong DocGO ecosystem.