# ✅ PHẦN 7 - File Download từ Automation Service

## 🎯 Vấn đề phát hiện

**User:** "muốn lấy thì phải lấy ở auto sv á, repo ko có kết nối với s3"

**Phân tích:**
- ❌ **Repository Service** - Chỉ quản lý metadata, **KHÔNG CÓ** kết nối S3
- ✅ **Automation Service** - Quản lý S3, upload/download file thực tế

---

## 📊 Architecture

### **Repository Service (Spring Boot)**
```
Chức năng:
- Lưu file metadata (MongoDB)
- Consume Kafka events
- CRUD metadata

KHÔNG CÓ:
- ❌ S3 connection
- ❌ File download endpoint
```

### **Automation Service (FastAPI Python)**
```
Chức năng:
- Upload file lên S3
- Download file từ S3
- OCR processing
- AI classification

CÓ:
- ✅ S3 connection (boto3)
- ✅ Download endpoint: GET /files/{file_id}/download
```

---

## 🔧 Automation Service Download Endpoint

**File:** `backend/automation-service/file_router.py`

**Endpoint:** `GET /api/v1/automation-service/files/{file_id}/download`

**Code:**
```python
@router.get("/{file_id}/download", summary="Download file")
async def download_file(
    file_id: str,
    user_id: Optional[str] = Query(None),
    version: Optional[int] = Query(None)
):
    try:
        # Call FileStorageService để lấy file từ S3
        response = file_service.download_file(file_id, user_id, version)
        
        # Return streaming response
        return StreamingResponse(
            io.BytesIO(response.file_content),
            media_type=response.content_type,
            headers={
                "Content-Disposition": f"attachment; filename=\"{response.filename}\"",
                "Content-Length": str(response.file_size)
            }
        )
    except HTTPException as e:
        raise e
```

**Response:**
- **Status:** 200 OK
- **Body:** Binary file content (Blob)
- **Headers:**
  - `Content-Type`: File MIME type
  - `Content-Disposition`: attachment; filename="..."
  - `Content-Length`: File size

---

## ✅ Frontend Fix

### **Before (SAI):**
```typescript
// repositoryApi.ts
downloadFile: async (id: string): Promise<Blob> => {
  const response = await apiClient.getRaw<Blob>(
    `${BASE_PATH}/files/${id}/download`, // ❌ Repository Service
    { responseType: 'blob' }
  );
  return response.data;
}

// BASE_PATH = '/api/v1/repository-management-service'
// ❌ Repository Service không có S3 connection!
```

### **After (ĐÚNG):**
```typescript
// repositoryApi.ts
downloadFile: async (id: string): Promise<Blob> => {
  // ✅ Download từ Automation Service (có kết nối S3)
  const response = await apiClient.getRaw<Blob>(
    `/api/v1/automation-service/files/${id}/download`,
    { responseType: 'blob' }
  );
  return response.data;
}

// ✅ Automation Service có S3 connection!
```

---

## 🔄 Full Download Flow

```
Frontend ContentTab
  ↓
useFileDownload hook
  ↓
repositoryApi.downloadFile(fileId)
  ↓
apiClient.getRaw()
  ↓
API Gateway: GET /api/v1/automation-service/files/{id}/download
  ↓
Automation Service (Python FastAPI)
  ↓
FileStorageService.download_file()
  ↓
S3 (boto3 client)
  ↓
Return file Blob
  ↓
Frontend creates File object
  ↓
Pass to PreviewPanel
  ↓
Render file preview (PDF/Image/Office/etc)
```

---

## 📝 Files Changed

### 1. `repositoryApi.ts` (Line 147-152)
**Change:** Update download endpoint
```diff
- const response = await apiClient.getRaw<Blob>(`${BASE_PATH}/files/${id}/download`, {
+ const response = await apiClient.getRaw<Blob>(`/api/v1/automation-service/files/${id}/download`, {
    responseType: 'blob',
  });
```

**Reason:** Repository Service không có S3, phải dùng Automation Service

---

## 🎯 S3 Configuration

**Automation Service** có S3 config:

**File:** `backend/automation-service/.env`
```env
S3_ENABLED=true
S3_BUCKET=devgo2003-docgo-bucket
S3_ENDPOINT=https://s3.filebase.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=xxx
S3_SECRET_ACCESS_KEY=xxx
```

**File:** `backend/automation-service/services/file_service.py`
```python
class FileStorageService:
    def __init__(self):
        if Config.S3_ENABLED:
            self.s3_client = boto3.client(
                's3',
                endpoint_url=Config.S3_ENDPOINT,
                region_name=Config.S3_REGION,
                aws_access_key_id=Config.S3_ACCESS_KEY_ID,
                aws_secret_access_key=Config.S3_SECRET_ACCESS_KEY
            )
    
    def download_file(self, file_id: str, user_id=None, version=None):
        # Download từ S3
        s3_object = self.s3_client.get_object(
            Bucket=Config.S3_BUCKET,
            Key=f"files/{file_id}"
        )
        
        return FileDownloadResponse(
            file_content=s3_object['Body'].read(),
            filename=...,
            content_type=...,
            file_size=...
        )
```

---

## ✅ Testing

### Test Download API:
```bash
# Test download endpoint
curl -X GET "http://localhost:8080/api/v1/automation-service/files/{file_id}/download" \
  -H "Authorization: Bearer {token}" \
  --output downloaded_file.pdf

# Check file size
ls -lh downloaded_file.pdf

# Check content type
file downloaded_file.pdf
```

### Test Frontend:
```
1. Navigate to: http://localhost:3000/repositories/{id}/files/{fileId}
2. Click tab "Content"
3. Observe:
   - Loading spinner appears
   - Console logs: "Downloading file from automation-service..."
   - File blob received
   - File object created
   - Preview renders
```

---

## 🔍 Debugging

### Console Logs (Frontend):
```typescript
// ContentTab.tsx
console.log('[ContentTab] Downloading file:', fileId);
console.log('[ContentTab] File blob received:', fileBlob?.size);
console.log('[ContentTab] File object created:', {
  name: file.name,
  size: file.size,
  type: file.type,
});
```

### Backend Logs (Automation Service):
```python
# file_router.py
print(f"[DEBUG] Download request: file_id={file_id}")
print(f"[DEBUG] Downloaded from S3: {file_size} bytes")
print(f"[DEBUG] Returning file: {filename}")
```

---

## 📊 Comparison

| Feature | Repository Service | Automation Service |
|---------|-------------------|-------------------|
| **Tech Stack** | Spring Boot (Java) | FastAPI (Python) |
| **Database** | MongoDB | - |
| **S3 Connection** | ❌ NO | ✅ YES (boto3) |
| **File Upload** | ❌ NO | ✅ YES |
| **File Download** | ❌ NO | ✅ YES |
| **Metadata CRUD** | ✅ YES | ❌ NO |
| **Kafka Consumer** | ✅ YES | ❌ NO |
| **OCR Processing** | ❌ NO | ✅ YES |
| **AI Classification** | ❌ NO | ✅ YES |

**Kết luận:**
- Repository Service = Metadata storage
- Automation Service = File storage + Processing

---

## ✅ Summary

**Vấn đề:**
- Frontend gọi Repository Service để download file
- Repository Service không có S3 connection → Fail

**Giải pháp:**
- Frontend gọi Automation Service để download file
- Automation Service có S3 connection → Success

**Thay đổi:**
```typescript
// OLD: /api/v1/repository-management-service/files/{id}/download ❌
// NEW: /api/v1/automation-service/files/{id}/download ✅
```

**Files changed:** 1 file
- `repositoryApi.ts` - Update download endpoint

**Status:** ✅ HOÀN THÀNH

🚀 **READY TO TEST!**
