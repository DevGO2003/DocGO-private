<!-- 7a1a2264-1112-4600-9bdf-41a0bc3a81e5 dea65b73-ef62-4625-893b-9af94ae04bd1 -->
# Redesign Upload UI

## Mục tiêu
Tái thiết kế giao diện upload file để gọn gàng hơn với layout 2 cột (khung upload bên trái, thông tin bên phải), header panel giống trang documents với breadcrumbs và nút upload, hỗ trợ drag-and-drop với preview file.

## Thay đổi chi tiết

### 1. Cập nhật Header Panel
File: `frontend/web-app/src/app/(documents)/upload-document/page.tsx`

Thay đổi HeaderPanel:
- Thêm breadcrumbs: `[{ label: 'Tài liệu', href: '/documents' }, { label: 'Upload', current: true }]`
- Đổi title: "Upload tài liệu"
- Thêm nút "Xác nhận tải hợp đồng" vào `right` prop của HeaderPanel (di chuyển từ vị trí cũ)
- Nút này chỉ hiển thị khi `selectedFile !== null`
- Nút có state loading khi `ocrLoading === true`

### 2. Layout 2 cột compact
File: `frontend/web-app/src/app/(documents)/upload-document/page.tsx`

Thay đổi layout từ center-aligned sang 2 cột:
- Container: `max-w-7xl` thay vì `max-w-6xl`
- Grid 2 cột: `grid grid-cols-1 lg:grid-cols-2 gap-6`
- Cột trái: Khung upload file (compact)
  - Giảm padding từ `p-12` xuống `p-6`
  - Giảm kích thước icon
  - Thu gọn text và spacing
- Cột phải: Thông tin hướng dẫn và versioning
  - Di chuyển phần "Công nghệ AI OCR tiên tiến" sang cột phải
  - Di chuyển phần "Tạo phiên bản từ hợp đồng cũ" sang cột phải
  - Di chuyển phần "Additional Features Info" sang cột phải

### 3. Drag-and-drop với preview
File: `frontend/web-app/src/app/(documents)/upload-document/page.tsx`

Cải thiện drag-and-drop:
- Khi drag file vào trang, file preview hiển thị ngay trong khung upload
- Preview bao gồm:
  - Icon file type
  - Tên file
  - Kích thước file
  - Loại file
- Có 2 nút: "Chọn file khác" và "Thay đổi"
- Nút "Xác nhận tải hợp đồng" ở header panel để user review trước khi upload

### 4. Loại bỏ các phần không cần thiết
- Loại bỏ heading "Tải lên tệp hợp đồng để trích xuất văn bản" (đã có trong header panel)
- Loại bỏ subtitle dưới heading (duplicate với header panel subtitle)
- Thu gọn phần empty state của upload zone

### 5. Responsive
- Desktop (lg+): 2 cột song song
- Mobile/Tablet: Stack 1 cột, upload zone ở trên, thông tin ở dưới

## Files cần chỉnh sửa
- `frontend/web-app/src/app/(documents)/upload-document/page.tsx` (chỉnh sửa toàn bộ layout và logic)

## Các trường hợp cần xử lý
1. Chưa chọn file: Hiển thị empty state trong upload zone
2. Đã chọn file (drag hoặc click): Hiển thị preview, nút upload ở header
3. Đang upload: Nút ở header hiển thị loading state
4. Upload thành công: Modal hiện như hiện tại

### To-dos

- [ ] Setup Redis Event Publisher/Consumer cho Document Management Service (Java)
- [ ] Tạo FileUploadController với S3 integration và Redis event publishing
- [ ] Thêm fields OCR và processing vào DocumentEntity
- [ ] Tạo OCR Service với Tesseract cho Automation Service (Python)
- [ ] Tạo Document Processor pipeline (OCR → Classify → Summary)
- [ ] Setup Redis Event Consumer trong Automation Service
- [ ] Tạo API update processing result trong Document Management Service
- [ ] Cập nhật Upload Page để gọi API mới và hiển thị buttons sau upload
- [ ] Tạo OCR Tab trong Document Detail Page với retry button
- [ ] Tạo API Gateway endpoints cho upload và retry OCR
- [ ] Test toàn bộ flow và import references