---
description: "Quy tắc viết tài liệu API Swagger cho các microservices"
alwaysApply: false
---
# Cấu trúc mô tả API Swagger

## Controller Level Annotations
```java
@RestController
@RequestMapping("/api/v1/file-management-service/documents")
@Tag(name = "Document Management", description = "API quản lý tài liệu")
public class DocumentController {
```

## Method Level Documentation
```java
@GetMapping
@Operation(
    summary = "Lấy danh sách tài liệu"
)
public ResponseEntity<RestResponse<Page<Document>>> getAllDocuments(
    @Parameter(description = "Số trang (mặc định: 0)") 
    @RequestParam(defaultValue = "0") int page,
    
    @Parameter(description = "Kích thước trang (mặc định: 10)") 
    @RequestParam(defaultValue = "10") int size,
    
    @Parameter(description = "Trường sắp xếp (mặc định: createdAt)") 
    @RequestParam(defaultValue = "createdAt") String sortBy,
    
    @Parameter(description = "Hướng sắp xếp (mặc định: DESC)") 
    @RequestParam(defaultValue = "DESC") String sortDirection) {
```

## Cấu trúc Swagger UI hiển thị

### API Endpoint Structure:
```
GET /api/v1/file-management-service/documents
├── 📋 Summary: "Lấy danh sách tài liệu"
├── 🔧 Parameters:
│   ├── page (query, optional, integer)
│   ├── size (query, optional, integer) 
│   ├── sortBy (query, optional, string)
│   └── sortDirection (query, optional, string)
├── 📤 Responses:
│   ├── 200: RestResponse<Page<Document>>
│   └── 204: RestResponse<null> (No Content)
└── 🏷️ Tags: "Document Management"
```

### Response Schema:
```json
{
  "apiVersion": "v1",
  "statusCode": 200,
  "shortMessage": "Success",
  "description": "Đã lấy danh sách tài liệu thành công",
  "data": {
    "content": [File objects],
    "pageable": {...},
    "totalElements": 100,
    "totalPages": 10
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid-here",
  "path": "/api/v1/file-management-service/documents"
}
```

## Các loại API Documentation cần có

### GET APIs (Read Operations)
- **GET /documents** - Danh sách tài liệu
- **GET /documents/{id}** - Chi tiết tài liệu
- **GET /documents/{id}/attachments** - File đính kèm

### POST APIs (Create Operations)  
- **POST /documents** - Tạo tài liệu mới
- **POST /documents/upload** - Upload file

### PUT APIs (Update Operations)
- **PUT /documents/{id}** - Cập nhật tài liệu
- **PUT /documents/{id}/restore** - Khôi phục tài liệu

### DELETE APIs (Delete Operations)
- **DELETE /documents/{id}** - Xóa tài liệu

## Cấu hình Swagger UI

```properties
# application.properties
springdoc.swagger-ui.path=/docs
springdoc.swagger-ui.enabled=true
springdoc.swagger-ui.document-title=Document Management Service API
springdoc.swagger-ui.page-title=DocGO - Document Management Service
springdoc.swagger-ui.try-it-out-enabled=true
springdoc.swagger-ui.display-request-duration=true
```

## Truy cập Swagger UI
- **URL**: `http://localhost:8002/docs`
- **API Docs**: `http://localhost:8002/v3/api-docs`
- **Security**: Cho phép truy cập công khai `/docs/**`

## Quy tắc viết tài liệu (tiếng Việt)

- Tiêu đề và mô tả API dùng giọng văn ngắn gọn, chủ động, tiếng Việt chuẩn.
- **Java (SpringDoc)**:
  - `@Tag(name = "…", description = "…")`
  - `@Operation(summary = "…")`
  - Khai báo `@RequestBody` với `schema` và `examples` khi cần.
- **Python (FastAPI)**:
  - Dùng `summary` trong decorator.
  - Gắn `tags` nhất quán: `AI Processing Service`, `API Quản lý Hợp đồng`.
- Luôn nêu rõ:
  - URL đầy đủ (method + path)
  - Headers quan trọng (ví dụ: `Authorization: Bearer <token>`, `GEMINI_API_KEY` nếu dùng)
  - Payload request (JSON hoặc multipart) kèm ví dụ
  - Mẫu response `RestResponse` kèm ví dụ thành công và lỗi
  - Ghi chú quy tắc phân trang/sắp xếp nếu áp dụng

## Chuẩn hóa mô tả Input/Output cho API

Mọi endpoint phải có chú thích rõ ràng về đầu vào/đầu ra ngay trong tài liệu API:
- Ghi đầy đủ: method + URL đầy đủ, mô tả ngắn (summary).
- Liệt kê headers quan trọng (ví dụ: `Authorization: Bearer <token>`, `GEMINI_API_KEY`).
- Tham số path (`{id}`), query (`pageNumber`, `pageSize`, ...), và body: kiểu dữ liệu + ví dụ payload.
- Mô tả cấu trúc `RestResponse` cho success và error, kèm ví dụ giá trị thực tế; liệt kê status code có thể trả về (200/201/204/400/404/409/500...).

**Format chuẩn cho mô tả Input/Output**:
```
🔹 Đầu vào
<emoji + tên tham số> <(bắt buộc | tùy chọn, header/body/path …)>
Loại: <kiểu dữ liệu>
Mô tả: <giải thích ngắn gọn>

🔹 Đầu ra
<emoji + tên trường>
Loại: <kiểu dữ liệu>
Mô tả: <giải thích ngắn gọn>
```
- Sử dụng emoji phù hợp với từng loại tham số/trường
- Ghi rõ tính bắt buộc/tùy chọn và vị trí (header/body/path/query)
- Mô tả ngắn gọn, dễ hiểu

**Spring (SpringDoc)**:
- Dùng `@Tag`, `@Operation(summary)`, `@RequestBody` + `@Schema` + `@ExampleObject` cho ví dụ JSON; response mặc định bọc trong `RestResponse<T>`.

**FastAPI**:
- Dùng `tags`, `summary` trong decorator; viết docstring phần "Đầu vào/Đầu ra"; chỉ rõ `multipart/form-data` hoặc `application/json` và ví dụ.
- Với input có 2 lựa chọn (ví dụ automation process), ghi rõ chỉ sử dụng 1 trong 2 và nêu ví dụ cho mỗi lựa chọn.

---

**Lưu ý**: Khi thêm API mới vào các service, hãy tuân thủ các quy tắc documentation này để đảm bảo tính nhất quán và dễ đọc.