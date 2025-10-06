# Upload Components

## UploadSuccessControls

Component hiển thị các control nhanh sau khi upload file thành công.

### Tính năng

- **Xem file**: Chuyển đến trang chi tiết file
- **Danh sách**: Chuyển đến trang danh sách files
- **Preview**: Xem trước file
- **Copy link**: Copy link chia sẻ file
- **Tải xuống**: Tải file về máy
- **Chia sẻ**: Chia sẻ file qua Web Share API hoặc copy link
- **Chỉnh sửa**: Chỉnh sửa file
- **Upload thêm**: Upload thêm files khác
- **Xóa file**: Xóa file khỏi hệ thống

### Sử dụng

```tsx
import UploadSuccessControls from '@/components/upload/UploadSuccessControls'

<UploadSuccessControls
  fileId="file-123"
  fileName="document.pdf"
  fileType="application/pdf"
  fileSize="2.5 MB"
  onUploadMore={() => {
    // Reset form để upload file mới
  }}
  onEditFile={(fileId) => {
    // Chỉnh sửa file
  }}
  onDeleteFile={(fileId) => {
    // Xóa file
  }}
/>
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `fileId` | `string` | ✅ | ID của file đã upload |
| `fileName` | `string` | ✅ | Tên file |
| `fileType` | `string` | ❌ | Loại file (MIME type) |
| `fileSize` | `string` | ❌ | Kích thước file (đã format) |
| `onUploadMore` | `() => void` | ❌ | Callback khi upload thêm file |
| `onEditFile` | `(fileId: string) => void` | ❌ | Callback khi chỉnh sửa file |
| `onDeleteFile` | `(fileId: string) => void` | ❌ | Callback khi xóa file |
| `className` | `string` | ❌ | CSS class bổ sung |

### Tích hợp với Upload Page

Component được tích hợp tự động vào trang upload-document và hiển thị sau khi upload thành công. Controls sẽ tự động ẩn sau 10 giây để user có thời gian sử dụng.

### Chức năng đặc biệt

1. **Copy Link**: Tự động tạo link chia sẻ và copy vào clipboard
2. **Web Share API**: Sử dụng Web Share API nếu có sẵn, fallback về copy link
3. **Responsive**: Tối ưu cho mobile và desktop
4. **Loading States**: Hiển thị trạng thái loading khi copy link
5. **Toast Notifications**: Thông báo kết quả các thao tác
