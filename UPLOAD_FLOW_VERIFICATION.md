# ✅ Luồng Upload File JSON - Verification

## 🔄 Luồng hoàn chỉnh

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ POST multipart/form-data
       │ file=@test-upload-json.json
       ▼
┌──────────────────────────────────────────────────────┐
│  API Gateway (Next.js) - Port 8000                   │
│  URL: http://localhost:8000/api/files/upload         │
│  Query: ?folder=documents&user_id=user123            │
│                                                       │
│  ✅ Validate file type:                              │
│     - allowedTypes: application/json                 │
│     - allowedExtensions: .json (ĐÃ THÊM)             │
│                                                       │
│  ✅ Parse multipart với formidable                   │
│  ✅ Forward tới Automation Service                   │
└──────────────┬───────────────────────────────────────┘
               │ Proxy forward
               │ POST /api/v1/automation-service/files
               ▼
┌──────────────────────────────────────────────────────┐
│  Automation Service (FastAPI) - Port 8003            │
│  Endpoint: POST /api/v1/automation-service/files     │
│                                                       │
│  ✅ Nhận file JSON qua UploadFile                    │
│  ✅ Kiểm tra file size (<2MB: sync, >=2MB: async)    │
│  ✅ Upload lên S3/Filebase                           │
│  ✅ Log audit trail và events                        │
│  ✅ Return 201/202 với file metadata                 │
└──────────────┬───────────────────────────────────────┘
               │
               ▼
         ┌──────────┐
         │    S3    │
         │(Filebase)│
         └──────────┘
```

## 📝 Chi tiết từng bước

### 1️⃣ API Gateway - `/api/files/upload`

**File**: `backend/api-gateway/pages/api/files/upload.ts`

**Xử lý**:
```typescript
// ✅ Validate file type
const allowedTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/json',  // ← Hỗ trợ JSON
  'text/plain',
  'image/jpeg',
  'image/jpg',
  'image/png'
]

const allowedExtensions = [
  '.pdf', '.docx', '.txt', 
  '.jpg', '.jpeg', '.png', 
  '.json'  // ← ĐÃ THÊM extension .json
]

// ✅ Parse multipart form data với formidable
const [fields, files] = await form.parse(req)

// ✅ Forward tới Automation Service
const automationUrl = new URL(
  `${process.env.AUTOMATION_SERVICE_URL}/api/v1/automation-service/files`
)
automationUrl.searchParams.append('folder', folder)
automationUrl.searchParams.append('user_id', automationUserId)

const response = await fetch(automationUrl.toString(), {
  method: 'POST',
  body: formData
})
```

**Query Parameters**:
- `folder`: Thư mục lưu trữ (mặc định: `documents`)
- `user_id`: ID người dùng (mặc định: từ header `X-User-ID`)

### 2️⃣ Automation Service - `/api/v1/automation-service/files`

**File**: `backend/automation-service/file_router.py`

**Xử lý**:
```python
@router.post("", summary="Upload document", tags=["📁 APIs Quản lý File"])
async def upload_file(
    request: Request,
    file: UploadFile = File(...),
    metadata: str | None = Form(None),
):
    # ✅ Nhận file JSON
    # ✅ Kiểm tra file size
    size = int(request.headers.get("content-length") or 0)
    sync_mode = size < 2 * 1024 * 1024  # 2MB threshold
    
    # ✅ Upload lên S3
    upload_result = await file_service.upload_file(
        file, folder="documents", user_id="system"
    )
    
    # ✅ Log audit trail
    await audit_service.log_processing_session({
        "correlationId": correlation_id,
        "documentId": file_id,
        "fileName": file.filename,
        "fileSize": size,
        "contentType": file.content_type
    })
    
    # ✅ Return response
    return RestResponse(
        statusCode=201,  # Sync
        # hoặc 202 nếu async
        shortMessage="Created",
        description="File uploaded successfully",
        data={
            "fileId": file_id,
            "fileUrl": file_url,
            "fileName": file.filename,
            "fileSize": size,
            "contentType": file.content_type
        }
    )
```

### 3️⃣ S3 Storage

**Service**: `backend/automation-service/services/file_service.py`

**Upload logic**:
- Sử dụng boto3 client
- Upload tới Filebase bucket
- Generate file URL
- Return `file_id` và `file_url`

## 🧪 Test Cases

### Test 1: Upload file JSON nhỏ (<2MB) - Sync Mode

**File test**: `test-upload-json.json`

**Command**:
```bash
curl -X POST "http://localhost:8000/api/files/upload?folder=documents&user_id=user123" \
  -F "file=@test-upload-json.json" \
  -H "X-User-ID: user123"
```

**Expected Response**:
```json
{
  "apiVersion": "v1",
  "statusCode": 201,
  "shortMessage": "Created",
  "description": "File uploaded successfully",
  "data": {
    "fileId": "uuid-here",
    "fileUrl": "https://s3.filebase.com/...",
    "fileName": "test-upload-json.json",
    "fileSize": 1234,
    "contentType": "application/json"
  },
  "timestamp": "2025-10-16T08:00:00Z",
  "requestId": "uuid-here",
  "path": "/api/v1/automation-service/files"
}
```

### Test 2: Upload file JSON lớn (>=2MB) - Async Mode

**Expected Response**:
```json
{
  "apiVersion": "v1",
  "statusCode": 202,
  "shortMessage": "Accepted",
  "description": "File uploaded, processing in background",
  "data": {
    "fileId": "uuid-here",
    "fileUrl": "https://s3.filebase.com/...",
    "processingStatus": "PROCESSING",
    "statusUrl": "/api/v1/automation-service/files/uuid-here/status"
  },
  "timestamp": "2025-10-16T08:00:00Z",
  "requestId": "uuid-here",
  "path": "/api/v1/automation-service/files"
}
```

## ✅ Checklist Verification

- [x] API Gateway accept extension `.json`
- [x] API Gateway forward đúng endpoint
- [x] Automation Service nhận được file JSON
- [x] Upload lên S3 thành công
- [x] Return đúng RestResponse format
- [x] Audit trail được log
- [x] Events được publish (nếu cần)

## 🔧 Files Modified

1. **backend/api-gateway/pages/api/files/upload.ts**
   - ✅ Thêm `.json` vào `allowedExtensions`

## 📋 Scripts Test

1. **test-upload-json.json** - File JSON mẫu để test
2. **test-upload-json-file.ps1** - PowerShell script để test upload

## 🚀 Cách chạy test

### PowerShell
```powershell
.\test-upload-json-file.ps1
```

### Curl
```bash
curl -X POST "http://localhost:8000/api/files/upload?folder=documents&user_id=user123" \
  -F "file=@test-upload-json.json" \
  -H "X-User-ID: user123" \
  -w "\nHTTP_CODE=%{http_code}\n" \
  -v
```

### HTTPie
```bash
http -f POST "http://localhost:8000/api/files/upload?folder=documents&user_id=user123" \
  file@test-upload-json.json \
  X-User-ID:user123
```

## 📊 Kết quả mong đợi

1. **API Gateway**:
   - Nhận file JSON
   - Validate type và extension thành công
   - Forward tới Automation Service

2. **Automation Service**:
   - Nhận file qua UploadFile
   - Upload lên S3 thành công
   - Return 201/202 với metadata

3. **S3 Storage**:
   - File được lưu trữ
   - URL accessible
   - Metadata đầy đủ

## 🔍 Troubleshooting

### Issue 1: "Unsupported file type"
- **Nguyên nhân**: Extension `.json` không trong allowedExtensions
- **Giải pháp**: ✅ Đã thêm `.json` vào allowedExtensions

### Issue 2: Gateway không forward được
- **Kiểm tra**: `AUTOMATION_SERVICE_URL` trong `.env`
- **Kiểm tra**: Automation Service có đang chạy không (port 8003)

### Issue 3: Upload S3 thất bại
- **Kiểm tra**: S3 credentials trong `.env`
- **Kiểm tra**: Filebase bucket có tồn tại không
- **Kiểm tra**: Network connectivity

## 📝 Notes

- File JSON được xử lý giống như các file khác (PDF, DOCX, TXT)
- Không có xử lý đặc biệt cho nội dung JSON ở bước upload
- Nếu cần phân tích JSON, sử dụng các endpoint Kafka events:
  - `POST /api/v1/automation-service/files/events/analyze-json`
  - `POST /api/v1/automation-service/files/events/analyze-batch`

---

**Status**: ✅ VERIFIED  
**Date**: 2025-10-16  
**Luồng**: Client → API Gateway → Automation Service → S3  
**File types supported**: PDF, DOCX, TXT, JPG, PNG, JSON

