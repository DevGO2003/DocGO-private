### How to run this microservice

**Prerequisites:**
- Python 3.11+
- S3-compatible storage (Filebase recommended)
- ClamAV (tùy chọn, cho malware scanning)

**Bước 1: Cấu hình môi trường**
```powershell
cd backend/file-storage-asset-service
Copy-Item env.example .env -Force
```

**Bước 2: Chỉnh sửa file .env**
Mở file `.env` và cập nhật các thông tin sau:
```env
# S3 / Filebase Configuration
S3_ENDPOINT=https://s3.filebase.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=your_access_key_here
S3_SECRET_ACCESS_KEY=your_secret_key_here
S3_BUCKET=docgo-assets

# Optional IPFS (Filebase RPC) Configuration
IPFS_RPC_ENDPOINT=https://rpc.filebase.io
IPFS_RPC_TOKEN=your_ipfs_token_here

# ClamAV Configuration (Malware Scanner)
CLAMD_HOST=localhost
CLAMD_PORT=3310
USE_CLAMD=false

# File Storage Configuration
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=pdf,docx,txt,jpg,jpeg,png,gif
UPLOAD_DIR=uploads
TEMP_DIR=temp
```

**Bước 3: Tạo bucket S3**
Trước khi chạy service, bạn cần tạo bucket `docgo-assets` trong Filebase hoặc S3 của bạn.

**Bước 4: Cài đặt và chạy**
```powershell
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8017
```

**Docs:** `http://localhost:8017/docs#/`

## API Endpoints

### 🔹 File Management
- `POST /api/v1/file-storage-asset-service/files` - Upload file
- `GET /api/v1/file-storage-asset-service/files` - Liệt kê files (có phân trang)
- `GET /api/v1/file-storage-asset-service/files/{key}/url` - Tạo presigned URL
- `DELETE /api/v1/file-storage-asset-service/files/{key}` - Xóa file

### 🔹 Advanced File Operations
- `POST /api/v1/file-storage-asset-service/files/upload-with-scan` - Upload với malware scan
- `GET /api/v1/file-storage-asset-service/files/{file_id}/download` - Download file
- `POST /api/v1/file-storage-asset-service/files/{file_id}/signed-url` - Tạo signed URL
- `GET /api/v1/file-storage-asset-service/files/{file_id}/versions` - Lấy phiên bản file
- `DELETE /api/v1/file-storage-asset-service/files/{file_id}` - Xóa file/phiên bản

### 🔹 Malware Scanning
- `POST /api/v1/file-storage-asset-service/scan/directory` - Quét malware thư mục
- `POST /api/v1/file-storage-asset-service/scan/statistics` - Thống kê quét malware

**Lưu ý quan trọng:**
- Đảm bảo bucket `docgo-assets` đã được tạo trong S3/Filebase trước khi chạy service
- Nếu không có ClamAV, set `USE_CLAMD=false` trong file `.env`
- Service sẽ tự động tạo thư mục `uploads/` và `temp/` nếu chưa tồn tại
- Tất cả API đều trả về format `RestResponse` chuẩn hóa
- Prefix mặc định cho files là `documents/` thay vì `assets/`

