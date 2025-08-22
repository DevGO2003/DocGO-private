## User Management Service (FastAPI)

Dịch vụ quản lý User/Profile + Approval, tích hợp S3 và đồng bộ Role với Identity Service. Hỗ trợ filter theo `system_id` trong mọi query. Có sẵn Swagger UI.

### Tính năng
- **Users**: CRUD, tìm kiếm phân trang, upload/xóa avatar (S3)
- **Approvals**: Tạo/sửa/xóa/tìm kiếm, bulk update, thống kê, phím tắt approve/reject
- **Identity Service**: Lấy/cập nhật roles, sync trạng thái approval (chuẩn bị sẵn)
- **Filter theo system_id**: Bắt buộc trong mọi truy vấn đọc/sửa/xóa

### Yêu cầu
- Windows + PowerShell
- Python 3.11+ (đã test trên 3.13)
- MySQL 8.x (hoặc MariaDB; với MySQL dùng `mysql+pymysql`)
- (Tùy chọn) AWS S3 nếu dùng upload avatar

### Cài đặt nhanh (Windows/PowerShell)
```powershell
cd "D:\nam cuoi\New folder\backend\user-management-service"

# 1) Tạo và kích hoạt venv
& ".\venv\Scripts\python.exe" --version 2>$null; if ($LASTEXITCODE -ne 0) { python -m venv venv }
.\venv\Scripts\activate

# 2) Cài dependencies (đã loại bỏ gói mariadb, dùng pymysql)
pip install -U pip setuptools wheel
pip install -U fastapi "uvicorn[standard]" sqlalchemy pymysql ^
  "pydantic>=2.9" "pydantic-settings>=2.3" python-multipart ^
  python-dotenv boto3 alembic httpx "python-jose[cryptography]" "passlib[bcrypt]" ^
  "pydantic[email]"

# 3) Tạo file .env từ mẫu
Copy-Item .env.example .env -Force
```

### Cấu hình môi trường (.env)
Sửa `.env` để dùng MySQL và DB `docgo_user_management_service` (ví dụ user root/password `sapassword`):
```env
DATABASE_URL=mysql+pymysql://root:sapassword@127.0.0.1:3306/docgo_user_management_service

AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-southeast-1
S3_BUCKET_NAME=user-avatars

IDENTITY_SERVICE_URL=http://localhost:8080
IDENTITY_SERVICE_API_KEY=your_api_key

APP_NAME=User Management Service
APP_VERSION=1.0.0
DEBUG=true
HOST=0.0.0.0
PORT=8002
```

### Khởi tạo Database
Nếu DB chưa có:
```powershell
mysql -u root -psapassword -e "CREATE DATABASE IF NOT EXISTS docgo_user_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
# (Tùy chọn) Import mẫu (sửa tên DB trong file nếu cần)
# mysql -u root -psapassword docgo_user_service < database\init_user_db.sql
```

### Chạy dịch vụ
```powershell
cd "D:\nam cuoi\New folder\backend\user-management-service"
.\venv\Scripts\activate
python main.py
```
- API: `http://localhost:8002`
- Swagger: `http://localhost:8002/docs`
- ReDoc: `http://localhost:8002/redoc`

---

## API Usage (có ví dụ cURL)
Base URL: `http://localhost:8002/api/v1/user-management-service`

Lưu ý: luôn truyền `system_id` khi đọc/sửa/xóa dữ liệu.

### Users
- **Tạo user**
```bash
curl -X POST http://localhost:8002/api/v1/user-management-service/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john.doe@example.com",
    "system_id": "system1",
    "metadata_json": {"department":"Engineering"}
  }'
```
- **Xem theo ID**
```bash
curl "http://localhost:8002/api/v1/user-management-service/users/1?system_id=system1"
```
- **Xem theo email**
```bash
curl "http://localhost:8002/api/v1/user-management-service/users/email/john.doe@example.com?system_id=system1"
```
- **Sửa user**
```bash
curl -X PUT "http://localhost:8002/api/v1/user-management-service/users/1?system_id=system1" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Johnathan Doe"}'
```
- **Xóa user**
```bash
curl -X DELETE "http://localhost:8002/api/v1/user-management-service/users/1?system_id=system1"
```
- **Tìm kiếm (phân trang)**
```bash
curl "http://localhost:8002/api/v1/user-management-service/users?system_id=system1&full_name=john&page=1&size=10"
```
- **Upload avatar** (cần cấu hình S3)
```bash
curl -X POST "http://localhost:8002/api/v1/user-management-service/users/1/avatar" \
  -F "system_id=system1" \
  -F "file=@avatar.jpg"
```
- **Xóa avatar**
```bash
curl -X DELETE "http://localhost:8002/api/v1/user-management-service/users/1/avatar?system_id=system1"
```
- **User kèm trạng thái duyệt**
```bash
curl "http://localhost:8002/api/v1/user-management-service/users/1/with-approval?system_id=system1"
```
- **Lấy roles từ Identity Service**
```bash
curl "http://localhost:8002/api/v1/user-management-service/users/1/roles"
```
- **Danh sách users kèm approvals theo system**
```bash
curl "http://localhost:8002/api/v1/user-management-service/users/system/system1/with-approvals"
```

### Approvals
- **Tạo**
```bash
curl -X POST http://localhost:8002/api/v1/user-management-service/approvals/ \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"system_id":"system1","notes":"Verify info"}'
```
- **Xem theo approval_id**
```bash
curl "http://localhost:8002/api/v1/user-management-service/approvals/1?system_id=system1"
```
- **Xem theo user_id**
```bash
curl "http://localhost:8002/api/v1/user-management-service/approvals/user/1?system_id=system1"
```
- **Cập nhật trạng thái** (yêu cầu `approver_id`)
```bash
curl -X PUT "http://localhost:8002/api/v1/user-management-service/approvals/1?system_id=system1" \
  -H "Content-Type: application/json" \
  -d '{"status":"approved","approver_id":100,"notes":"OK"}'
```
- **Phím tắt Approve/Reject**
```bash
curl -X POST "http://localhost:8002/api/v1/user-management-service/approvals/1/approve?system_id=system1&approver_id=100"
curl -X POST "http://localhost:8002/api/v1/user-management-service/approvals/1/reject?system_id=system1&approver_id=100&notes=Insufficient+docs"
```
- **Tìm kiếm**
```bash
curl "http://localhost:8002/api/v1/user-management-service/approvals?system_id=system1&status=pending&page=1&size=10"
```
- **Bulk update**
```bash
curl -X POST "http://localhost:8002/api/v1/user-management-service/approvals/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids":[1,2,3],
    "system_id":"system1",
    "status":"approved",
    "approver_id":100,
    "notes":"Bulk approve"
  }'
```
- **Thống kê**
```bash
curl "http://localhost:8002/api/v1/user-management-service/approvals/statistics/system1"
```
- **Danh sách pending/approved**
```bash
curl "http://localhost:8002/api/v1/user-management-service/approvals/pending/system1?page=1&size=10"
curl "http://localhost:8002/api/v1/user-management-service/approvals/approved/system1?page=1&size=10"
```

### Health Check
```bash
curl http://localhost:8002/
curl http://localhost:8002/health
```

---

## Ghi chú cấu hình
- **MySQL vs MariaDB**: Nếu dùng MySQL 8.x, bắt buộc `DATABASE_URL` dùng `mysql+pymysql://...`. Nếu dùng MariaDB, có thể dùng `mariadb+pymysql://...`.
- **S3**: Cần cấu hình các biến AWS và tạo bucket trước khi test upload avatar.
- **Identity Service**: Đặt `IDENTITY_SERVICE_URL`, `IDENTITY_SERVICE_API_KEY` nếu muốn gọi thật. Nếu không có, các endpoint roles/approval-sync sẽ trả lỗi hoặc rỗng.

## Troubleshooting nhanh
- `Access denied for user` → Sai user/pass trong `DATABASE_URL`.
- `Unknown database` → Tạo DB `docgo_user_service` trước (xem phần Khởi tạo DB).
- `MySQL version ... is not a MariaDB variant` → Đang dùng MySQL nhưng `DATABASE_URL` để `mariadb+...` → đổi sang `mysql+pymysql`.
- `No module named 'fastapi'` → Chưa activate venv hoặc thiếu deps → `venv\Scripts\activate` và cài lại deps.
- PowerShell xuống dòng: dùng backtick ` thay vì \

## Luồng làm việc (Workflow) và giải thích

- **Base path**: `/api/v1/user-management-service/...`
- **Quy ước hệ thống**: mọi truy vấn đọc/sửa/xóa đều yêu cầu `system_id`.

### 1) Tạo hồ sơ người dùng (User Profile)
- **Endpoint**: `POST /api/v1/user-management-service/users/`
- **Mục đích**: Tạo thực thể `UserProfile`.
- **Ràng buộc**: Không trùng `email + system_id`. Nếu trùng sẽ báo lỗi.
- **Kết quả**: Trả về hồ sơ người dùng vừa tạo.

### 2) Tạo yêu cầu duyệt (Approval)
- **Endpoint**: `POST /api/v1/user-management-service/approvals/`
- **Mục đích**: Tạo thực thể `UserApproval` cho người dùng trong một `system_id`.
- **Ràng buộc**: User phải tồn tại; một user trong một hệ thống chỉ có một approval đang theo dõi.
- **Kết quả**: Approval ở trạng thái ban đầu (thường là `pending`).

### 3) Phê duyệt/Từ chối
- **Endpoint chính**: `PUT /api/v1/user-management-service/approvals/{approval_id}?system_id=...`
- **Shortcut**:
  - Approve: `POST /api/v1/user-management-service/approvals/{approval_id}/approve?system_id=...&approver_id=...`
  - Reject: `POST /api/v1/user-management-service/approvals/{approval_id}/reject?system_id=...&approver_id=...&notes=...`
- **Hành vi**:
  - Cập nhật trạng thái (`approved`/`rejected`), lưu `approver_id`, `notes`.
  - Nếu `approved`, set `approved_at`.
  - Sau khi cập nhật, dịch vụ sẽ đồng bộ trạng thái này sang Identity Service (mục 4).

### 4) Đồng bộ với Identity Service
- Khi cập nhật approval (PUT/approve/reject hoặc bulk), dịch vụ gọi:
  - `POST {IDENTITY_SERVICE_URL}/api/v1/users/{user_id}/approval-status` với payload gồm `approval_status`, `system_id`, `timestamp`.
- Lấy role từ Identity Service:
  - **Endpoint**: `GET /api/v1/user-management-service/users/{user_id}/roles`
  - Dùng để hiển thị vai trò hiện có của user ở hệ thống IAM trung tâm.
- Yêu cầu cấu hình biến môi trường: `IDENTITY_SERVICE_URL`, `IDENTITY_SERVICE_API_KEY`.

### 5) Quản lý avatar (S3)
- **Upload**: `POST /api/v1/user-management-service/users/{user_id}/avatar` (multipart: `system_id`, `file`)
  - Chấp nhận: `jpg, jpeg, png, gif`; kích thước tối đa 5MB.
  - Lưu tạm file, upload lên S3 thành đường dẫn dạng `avatars/{system_id}/{user_id}/{uuid}.{ext}` và cập nhật `avatar_url`.
- **Xóa avatar**: `DELETE /api/v1/user-management-service/users/{user_id}/avatar?system_id=...`
  - Xóa file trên S3 (nếu có) và cập nhật hồ sơ.
- Khi xóa user (mục 7), avatar sẽ được xóa kèm.

### 6) Tra cứu và thống kê
- **Users (search)**: `GET /api/v1/user-management-service/users?system_id=...&full_name=...&email=...&page=1&size=10`
- **User + Approval**: `GET /api/v1/user-management-service/users/{user_id}/with-approval?system_id=...`
- **Approvals (search)**: `GET /api/v1/user-management-service/approvals?system_id=...&status=...&page=...&size=...`
- **Thống kê**: `GET /api/v1/user-management-service/approvals/statistics/{system_id}`
- **Danh sách theo trạng thái**:
  - Pending: `GET /api/v1/user-management-service/approvals/pending/{system_id}`
  - Approved: `GET /api/v1/user-management-service/approvals/approved/{system_id}`

### 7) Xóa người dùng (Cascade xử lý dữ liệu liên quan)
- **Endpoint**: `DELETE /api/v1/user-management-service/users/{user_id}?system_id=...`
- **Hành vi**:
  - Xóa avatar trên S3 (nếu có).
  - Xóa các bản ghi `UserApproval` liên quan.
  - Xóa `UserProfile`.

### 8) Health Check
- **Endpoints**:
  - `GET /` → ping nhanh dịch vụ.
  - `GET /health` → chi tiết hơn (version, trạng thái database).

### Ghi chú thiết kế và ràng buộc
- **system_id-bắt buộc**: Mọi thao tác cần đặt trong bối cảnh hệ thống (tenant) cụ thể.
- **Tính toàn vẹn dữ liệu**:
  - User: ràng buộc `email + system_id` không trùng.
  - Approval: một user trong một `system_id` có một dòng theo dõi; update thay vì tạo mới khi đã tồn tại.
- **Nhất quán liên dịch vụ**:
  - Approval cập nhật → đồng bộ ngay sang Identity Service (fire-and-forget với log, có xử lý mã lỗi cơ bản).
- **Upload an toàn**:
  - Kiểm tra loại file và kích thước trước khi upload S3.
  - Xóa file tạm sau khi upload xong.

---

## License
MIT
