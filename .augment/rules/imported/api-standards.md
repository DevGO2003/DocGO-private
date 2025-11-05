# API Standards (URL • Response • Swagger)

## Mô tả
Tiêu chuẩn hóa API cho toàn bộ hệ thống nhằm đảm bảo tính nhất quán, khả năng mở rộng và dễ tích hợp. Quy định cách đặt URL, chuẩn response envelope, và quy tắc viết tài liệu Swagger/OpenAPI.

- Công nghệ: REST over HTTP, OpenAPI/Swagger, JSON
- Khi sử dụng: Áp dụng cho tất cả microservices khi thiết kế/triển khai/ghi tài liệu API

---

## 1) URL Standards (tham chiếu 03_api-url-standards.md)

- Base path: `/api/v1/{service-name}/...` (kebab-case, phản ánh tên service)
- Tài nguyên: danh từ số nhiều, kebab-case (vd: `users`, `documents`)
- CRUD chuẩn REST + sub-resource rõ ràng
- Query chuẩn: `pageNumber`, `pageSize`, `sortBy`, `sortDirection`, `searchTerm`, `includeDeleted`
- Tên handler rõ nghĩa; đặt thứ tự API trong controller (getAll trên getOne, rồi create/update/delete)
- Bảo mật và versioning: luôn có tiền tố version; cân nhắc `/api/v2` khi breaking change

Checklist nhanh:
- Đúng base path + version
- Tài nguyên số nhiều, kebab-case
- Sub-resource hợp lý, hạn chế action suffix nếu không cần thiết
- Thứ tự endpoints chuẩn trong controller

---

## 2) Response Standards (tham chiếu 02_api-response-standards.md)

- Chuẩn hóa response envelope: thống nhất cấu trúc dữ liệu trả về, kèm metadata cần thiết
- Thống nhất mã lỗi, message, và quy ước field (tránh đặt tên tuỳ tiện)
- Quy định cho danh sách/phân trang: trả `totalElements`, `totalPages`, `currentPage`, `pageSize`...
- Lỗi: trả mã HTTP phù hợp, body lỗi có trường mô tả rõ nguyên nhân + mã nội bộ (nếu có)

Checklist nhanh:
- Tất cả API trả về envelope thống nhất
- Lỗi có mã HTTP chuẩn + payload mô tả rõ ràng
- Danh sách có metadata phân trang đầy đủ

---

## 3) Swagger/OpenAPI Standards (tham chiếu 04_api-swagger-standards.md)

- Mô tả đầy đủ: summary, description, tags, parameters, requestBody, responses
- Khai báo schema cho DTO rõ ràng, tái sử dụng component schemas
- Ví dụ (examples) minh hoạ với dữ liệu thực tế
- Bảo mật: mô tả security scheme (ví dụ JWT) và áp dụng cho endpoints liên quan

Checklist nhanh:
- Mỗi endpoint có summary/description rõ ràng
- Request/Response có schema và ví dụ
- Security scheme được định nghĩa và tham chiếu đúng

---

## Thực hành đề xuất

- Thiết kế URL trước; sinh DTO/schemas; sau đó viết Swagger → hiện thực
- Dùng linting/validators cho OpenAPI (vd: swagger-cli) trong CI
- Tái sử dụng component schemas giữa các endpoints





















