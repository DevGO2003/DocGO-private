---
globs: "**/*.java,**/*.py,**/*.ts,**/*.tsx,**/*.js,**/*.jsx,**/controller/**/*.java,**/router/**/*.py,**/api/**/*.ts,**/api/**/*.js"
alwaysApply: false
---
# Quy tắc URL API

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

## 4) Thứ tự API trong Controller
- **Luôn đặt API `getAll` (danh sách) ở trên API `getOne` (chi tiết)**
- Thứ tự chuẩn trong Controller:
  1. `@GetMapping` (getAll) - Lấy danh sách tất cả
  2. `@GetMapping("/{id}")` (getOne) - Lấy chi tiết theo ID
  3. `@PostMapping` (create) - Tạo mới
  4. `@PutMapping("/{id}")` (update) - Cập nhật
  5. `@DeleteMapping("/{id}")` (delete) - Xóa
  6. Các API khác theo thứ tự logic nghiệp vụ

- Ví dụ thứ tự đúng:
```java
@GetMapping                    // getAll - Luôn ở trên
public ResponseEntity<...> getAllUsers(...) { ... }

@GetMapping("/{id}")          // getOne - Luôn ở dưới getAll
public ResponseEntity<...> getUser(@PathVariable String id) { ... }

@PostMapping                  // create
public ResponseEntity<...> createUser(...) { ... }
```

## 5) Bảo mật và versioning
- Luôn đặt tiền tố `/api/v1/…`. Khi thay đổi lớn không tương thích, phát hành `/api/v2/…` song song.
- Định nghĩa rõ header bảo mật (ví dụ JWT) ở tài liệu, ngay trong phần mô tả endpoint.

## 6) Quy ước đặt tên mã nguồn
- Controller class (Java): `*Controller` theo tài nguyên chính, ví dụ `UserController`, `DocumentController`.
- Service class (Java): `*Service` với nghiệp vụ: `UserService`, `DocumentService`.
- Router (Python): nhóm theo `tags` và prefix chung; tên hàm ngắn, rõ mục đích (`process_api`, `validate_api`).
- Tên biến phản ánh ý nghĩa nghiệp vụ, tránh viết tắt.

---

**Lưu ý**: Khi thêm API mới vào các service, hãy tuân thủ các quy tắc này để đảm bảo tính nhất quán, dễ đọc và dễ tích hợp.