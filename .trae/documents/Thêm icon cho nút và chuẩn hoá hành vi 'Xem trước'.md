## Mục Tiêu
- Bổ sung icon cho 3 nút dưới mỗi Card: Xem chi tiết, Xem trước, Tải xuống.
- Chuẩn hoá nút "Xem trước":
  - Hover: hiện panel preview nổi (inline) ngay trên card.
  - Click: mở tab mới để xem nội dung file.
- Không dùng endpoint download cho nút "Xem trước"; chỉ dùng cho nút "Tải xuống".

## Nguồn Icon
- Sử dụng `CommonIcon` từ `@shared/components` với các tên khả dụng: `file-text` (Xem chi tiết), `eye-off` hoặc thay bằng `file-text` + label (tuỳ thư viện icon có `eye`), `download` (Tải xuống).

## Kế Hoạch Cập Nhật
1. GeneralFileCard
- Import `CommonIcon`.
- Thêm panel preview inline:
  - State: `showPreviewPanel` (boolean) và `previewAnchorRect` để định vị.
  - Hover trên nút "Xem trước": set state để hiện `<PreviewPanel file={item} />` (hoặc dùng `PreviewFactory` nếu phù hợp).
  - Rời chuột: ẩn panel.
- Nút "Xem trước":
  - Hover: hiện panel.
  - Click: `window.open(detailHref, '_blank', 'noopener,noreferrer')` hoặc mở viewer route nếu có.
- Nút "Tải xuống": dùng `downloadUrl`.
- Thêm icon cho 3 nút.

2. ContractFileCard
- Cập nhật tương tự GeneralFileCard với panel preview và icon cho 3 nút.

3. RepositoryFilesList
- Truyền `openUrl` là đường dẫn chi tiết file (`buildPath(REPOSITORY_ROUTES.FILE_DETAIL, { id, fileId })`) để click mở tab.
- Truyền `downloadUrl` là endpoint download hiện tại.

## Triển Khai Preview Panel
- Ưu tiên dùng `@shared/components` `PreviewPanel` nếu có, hoặc `features/upload/.../FilePreview.tsx`/`PreviewFactory` theo MIME:
  - Nhận props tối thiểu: `mimeType`, `fileName`, `fileSize` và URL nếu có (từ `storage.s3.url` qua mapper; nếu không có, hiển thị placeholder N/A).
  - Panel hiển thị nhỏ, định vị theo button hover.

## Kiểm Chứng
- Hover nút "Xem trước": panel preview hiện đúng, không cuộn layout.
- Click nút "Xem trước": mở tab mới trang chi tiết file.
- Click nút "Tải xuống": tải file từ download endpoint.
- Icon hiển thị đẹp, căn giữa trong nút.

## Lưu Ý
- Nếu chưa có `eye` icon, dùng `file-text` hoặc `search` cho nút preview.
- Panel preview chỉ dùng dữ liệu sẵn có; nếu thiếu URL, hiển thị thông báo chưa có nguồn xem trực tiếp.