# Upload Success Notification Components

## Tổng quan

Bộ component thông báo upload thành công với giao diện đẹp và nhiều lựa chọn hành động, thay thế cho thông báo cũ: "Tải lên thành công. Bạn có muốn thực hiện thao tác gì thêm không?"

## 🎯 Mục tiêu

- ✅ **Giao diện đẹp**: Icon, màu sắc, animation
- ✅ **Nhiều lựa chọn**: Xem tệp, tải xuống, tải thêm, xem chi tiết
- ✅ **UX tốt**: Toast tự động ẩn, Modal có thể đóng
- ✅ **Dễ sử dụng**: Hook và Manager component
- ✅ **Responsive**: Hoạt động tốt trên mọi thiết bị

## 📦 Components

### 1. UploadSuccessNotification (Modal)
- **Mô tả**: Modal popup với đầy đủ thông tin và actions
- **Sử dụng**: Khi cần hiển thị chi tiết và nhiều lựa chọn
- **Features**: 
  - Hiển thị tên file, kích thước, loại file
  - 4 action buttons: Xem tệp, Chi tiết, Tải xuống, Tải thêm
  - Có thể đóng bằng nút X hoặc nút Đóng

### 2. UploadSuccessToast (Toast)
- **Mô tả**: Toast notification nhỏ gọn ở góc màn hình
- **Sử dụng**: Khi cần thông báo nhanh, không làm gián đoạn workflow
- **Features**:
  - Tự động ẩn sau 5 giây
  - 2 action buttons: Xem tệp, Chi tiết
  - Progress bar animation

### 3. UploadSuccessManager (Wrapper)
- **Mô tả**: Component wrapper để quản lý state và hiển thị
- **Sử dụng**: Wrap toàn bộ app hoặc component cha
- **Features**:
  - Tự động quản lý state
  - Hỗ trợ cả Modal và Toast
  - Callback functions cho các actions

### 4. useUploadSuccess (Hook)
- **Mô tả**: Custom hook để quản lý state
- **Sử dụng**: Khi cần control trực tiếp
- **Features**:
  - showUploadSuccess()
  - hideUploadSuccess()
  - State: isVisible, uploadData

## 🚀 Cách sử dụng

### Cách 1: Sử dụng Manager (Recommended)

```tsx
import UploadSuccessManager from './components/UploadSuccessManager';

const App = () => {
  const handleViewFile = (fileName: string) => {
    console.log('Viewing file:', fileName);
    // Navigate to file viewer
  };

  const handleDownloadFile = (fileName: string) => {
    console.log('Downloading file:', fileName);
    // Trigger download
  };

  const handleUploadMore = () => {
    console.log('Upload more files');
    // Open file picker
  };

  const handleViewDetails = (fileName: string) => {
    console.log('Viewing details for:', fileName);
    // Navigate to details page
  };

  return (
    <UploadSuccessManager
      variant="toast" // hoặc "modal"
      onViewFile={handleViewFile}
      onDownloadFile={handleDownloadFile}
      onUploadMore={handleUploadMore}
      onViewDetails={handleViewDetails}
    >
      <div>
        {/* Your app content */}
      </div>
    </UploadSuccessManager>
  );
};
```

### Cách 2: Sử dụng Hook trực tiếp

```tsx
import { useUploadSuccess } from './hooks/useUploadSuccess';

const FileUploadComponent = () => {
  const { showUploadSuccess } = useUploadSuccess();

  const handleFileUpload = async (file: File) => {
    try {
      // Upload file logic
      const response = await uploadFile(file);
      
      // Show success notification
      showUploadSuccess({
        fileName: file.name,
        fileSize: formatFileSize(file.size),
        fileType: getFileType(file.name)
      });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <input
      type="file"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
      }}
    />
  );
};
```

### Cách 3: Sử dụng component trực tiếp

```tsx
import UploadSuccessNotification from './components/UploadSuccessNotification';

const MyComponent = () => {
  const [showNotification, setShowNotification] = useState(false);

  return (
    <div>
      <button onClick={() => setShowNotification(true)}>
        Upload File
      </button>

      {showNotification && (
        <UploadSuccessNotification
          fileName="report_2025.pdf"
          fileSize="2.5 MB"
          fileType="pdf"
          onViewFile={() => console.log('View file')}
          onDownloadFile={() => console.log('Download file')}
          onUploadMore={() => console.log('Upload more')}
          onViewDetails={() => console.log('View details')}
          onClose={() => setShowNotification(false)}
        />
      )}
    </div>
  );
};
```

## 🎨 Customization

### Styling
- Sử dụng Tailwind CSS classes
- Có thể override styles bằng CSS custom
- Responsive design sẵn có

### Icons
- Sử dụng emoji icons (✅, 👁️, 📄, ⬇️, ➕, ✕)
- Có thể thay thế bằng icon library khác

### Colors
- Green: Success, Download
- Blue: View, Primary actions
- Gray: Details, Secondary actions
- Purple: Upload more

## 📱 Responsive Design

- **Desktop**: Modal full size, Toast ở góc phải
- **Tablet**: Modal responsive, Toast điều chỉnh kích thước
- **Mobile**: Modal full screen, Toast ở top

## 🔧 Props Interface

### UploadSuccessNotification
```tsx
interface UploadSuccessNotificationProps {
  fileName: string;           // Tên file (bắt buộc)
  fileSize?: string;          // Kích thước file (tùy chọn)
  fileType?: string;          // Loại file (tùy chọn)
  onViewFile?: () => void;    // Callback xem file
  onDownloadFile?: () => void; // Callback tải xuống
  onUploadMore?: () => void;  // Callback tải thêm
  onViewDetails?: () => void; // Callback xem chi tiết
  onClose?: () => void;       // Callback đóng modal
  showActions?: boolean;      // Hiển thị action buttons
}
```

### UploadSuccessToast
```tsx
interface UploadSuccessToastProps {
  fileName: string;           // Tên file (bắt buộc)
  fileSize?: string;          // Kích thước file (tùy chọn)
  isVisible: boolean;         // Hiển thị toast
  onClose: () => void;        // Callback đóng toast
  onViewFile?: () => void;    // Callback xem file
  onViewDetails?: () => void; // Callback xem chi tiết
  autoHide?: boolean;         // Tự động ẩn (default: true)
  duration?: number;          // Thời gian hiển thị (default: 5000ms)
}
```

## 🎯 So sánh với thông báo cũ

| Aspect | Thông báo cũ | Thông báo mới |
|--------|--------------|---------------|
| **Giao diện** | Text đơn giản | Icon + màu sắc + animation |
| **Thông tin** | Chỉ có text | Tên file + kích thước + loại |
| **Actions** | 1 câu hỏi | 4 buttons rõ ràng |
| **UX** | Phải đọc và suy nghĩ | Click trực tiếp |
| **Responsive** | Không | Có |
| **Customizable** | Không | Có |

## 🚀 Demo

Xem file `UploadSuccessDemo.tsx` để test các component:

```tsx
import UploadSuccessDemo from './components/UploadSuccessDemo';

// Sử dụng trong app để test
<UploadSuccessDemo />
```

## 📝 Notes

- Components sử dụng Tailwind CSS
- Không phụ thuộc vào external icon libraries
- TypeScript support đầy đủ
- Có thể customize theo nhu cầu
- Performance optimized với React.memo (có thể thêm)

