<!-- 770354f1-cdeb-4094-8c3c-c7c7e1238d20 66996b4a-8f3d-41a5-8c61-bd80a65a978b -->
# Kế hoạch: Cập nhật Upload Document

## Mục tiêu
1. Đổi text nút upload từ "Xác nhận tải hợp đồng" thành "Xác nhận tải lên tài liệu"
2. Kết nối frontend với API backend thật qua API Gateway
3. Giữ nguyên flow hiện tại (confirm dialog → navigate)

## Chi tiết thực hiện

### 1. Cập nhật text nút upload
**File**: `frontend/web-app/src/app/(documents)/upload-document/_components/UploadPanel.tsx`
- **Dòng 104**: Đổi từ "Xác nhận tải hợp đồng" thành "Xác nhận tải lên tài liệu"

```tsx
// Trước:
Xác nhận tải hợp đồng

// Sau:
Xác nhận tải lên tài liệu
```

### 2. Kết nối với API backend qua API Gateway
**File**: `frontend/web-app/src/app/(documents)/upload-document/page.tsx`
- **Method**: `handleOcrExtract()` (dòng 107-146)
- **Thay đổi**:
  - Đổi endpoint từ `/api/files/upload` thành `http://localhost:8000/api/v1/document-management-service/v1/files/upload`
  - Backend trả về `RestResponse<FileUploadResponse>` với cấu trúc:
    - `statusCode`: 201
    - `shortMessage`: "Created"
    - `description`: "File đã được upload thành công và đang được xử lý"
    - `data.fileId`: ID của file
    - `data.fileUrl`: URL của file
  - Document được tạo tự động khi upload, không trả về `documentId` trong response
  - Cần điều chỉnh logic navigation để sử dụng `data.fileId` hoặc không navigate đến detail page

```tsx
// Cấu trúc response từ backend:
{
  "statusCode": 201,
  "shortMessage": "Created",
  "description": "File đã được upload thành công và đang được xử lý",
  "data": {
    "fileId": "...",
    "fileName": "...",
    "fileUrl": "...",
    "bucket": "...",
    "s3Key": "...",
    "uploadedAt": "..."
  },
  "timestamp": "...",
  "requestId": "...",
  "path": "..."
}
```

### 3. Điều chỉnh navigation logic
- Kiểm tra `response.ok` với `statusCode === 201`
- Vì backend không trả về `documentId` trong response, cần điều chỉnh:
  - Option 1: Chỉ navigate đến `/documents` (danh sách)
  - Option 2: Gọi thêm API để lấy document vừa tạo dựa trên `fileId`
- Giữ nguyên confirm dialog flow

## Lưu ý kỹ thuật
- Backend API endpoint: `POST /api/v1/document-management-service/v1/files/upload`
- Request format: `multipart/form-data` với field `file`
- Response format: `RestResponse<FileUploadResponse>`
- Backend tự động tạo DocumentEntity khi upload file
- Navigation cần điều chỉnh vì không có `documentId` trong response

## Testing
1. Upload file PDF/DOCX/TXT
2. Verify request đến đúng endpoint qua API Gateway
3. Verify response có format đúng
4. Verify navigation flow hoạt động
5. Verify file được lưu trong database

### To-dos

- [ ] Đổi text nút từ 'Xác nhận tải hợp đồng' thành 'Xác nhận tải lên tài liệu' trong UploadPanel.tsx
- [ ] Thay đổi API endpoint từ /api/files/upload thành http://localhost:8000/api/v1/document-management-service/v1/files/upload trong page.tsx
- [ ] Điều chỉnh logic navigation vì backend không trả về documentId - chỉ navigate đến /documents
- [ ] Test upload file và verify response format, navigation flow