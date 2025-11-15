## Mục Tiêu
- Tham chiếu giao diện cũ để cải tiến Card hiển thị file.
- Mỗi Card có 3 nút phía dưới: Xem chi tiết, Xem trước, Tải xuống.
- Phân loại và dùng đúng Card cho file hợp đồng và file thường.

## Tham Chiếu src-old
- General: `frontend/src-old/app/(repositories)/repositories/_components/GeneralFileCard.tsx` (3 nút cố định phía dưới, preview/download)
- Contract: `frontend/src-old/app/(repositories)/repositories/_components/ContractCard.tsx` (cùng bố cục 3 nút)

## Hiện Trạng Webapp
- General Card: `frontend/webapp/src/features/repositories/views/components/GeneralFileCard/GeneralFileCard.tsx` (chưa có 3 nút)
- Contract Card: `frontend/webapp/src/features/repositories/views/components/ContractFileCard/ContractFileCard.tsx` (chưa có 3 nút, chưa được dùng)
- Trang Files: `frontend/webapp/src/features/repositories/views/pages/RepositoryFilesList/RepositoryFilesList.tsx` đang chỉ render General Card.
- Mapper: `frontend/webapp/src/features/repositories/models/mappers/file-mapper.ts` đã sẵn chuẩn hóa dữ liệu từ backend.
- Endpoint tải/ mở xem: `GET /api/v1/repository-management-service/files/{fileId}/download` (không có `/open`).

## Kế Hoạch Chi Tiết
1. Phân loại item và dùng đúng Card
   - Sử dụng `mapFileApiToUiDocument` để xác định `documentType` → `kind: 'contract' | 'general'`.
   - Cập nhật `RepositoryFilesList.tsx` để render `ContractFileCard` khi `kind==='contract'`, và `GeneralFileCard` khi `kind==='general'`.
   - Vị trí đổi: `RepositoryFilesList.tsx:172–201` (map dữ liệu), `361–399` (render grid), `133–170` (filter tab dùng `kind`).
2. Bổ sung 3 nút hành động vào mỗi Card
   - Props mới cho hai Card: `detailHref: string`, `openUrl?: string`, `downloadUrl?: string`.
   - UI: thanh nút cố định ở đáy Card, 3 nút: 
     - Xem chi tiết: điều hướng tới `detailHref`.
     - Xem trước: `window.open(openUrl || downloadUrl, '_blank', 'noopener,noreferrer')`.
     - Tải xuống: gọi `downloadUrl` (mở tab hoặc fetch blob rồi trigger download).
   - Vị trí cập nhật:
     - `GeneralFileCard.tsx` thêm thanh nút dưới `CardContent` (khoảng cuối file, sau phần thông tin: ~`GeneralFileCard.tsx:58–95`).
     - `ContractFileCard.tsx` thêm thanh nút tương tự (cuối file: ~`ContractFileCard.tsx:42–83`).
3. Truyền các URL từ trang Files vào Card
   - Trong `RepositoryFilesList.tsx`, khi render từng item:
     - `detailHref = buildPath(REPOSITORY_ROUTES.FILE_DETAIL, { id, fileId: item.fileId })`.
     - `downloadUrl = "/api/v1/repository-management-service/files/" + item.fileId + "/download"`.
     - (Tuỳ chọn) `openUrl = downloadUrl` nếu muốn mở xem trước trong tab; PDF/ảnh sẽ hiển thị inline.
   - Truyền thêm `detailHref`, `downloadUrl`, `openUrl` vào `GeneralFileCard` và `ContractFileCard`.
4. Giữ nguyên checkbox chọn và các thông tin đã hiển thị
   - Không thay đổi `isSelected`/`onSelect`.
   - Vẫn hiển thị `status`, `tags`, `fileType`, dung lượng, ngày upload… như hiện tại.

## Kiểm Chứng
- Mở `http://localhost:3000/repositories/{id}/files`.
- Kiểm tra mỗi Card có 3 nút hoạt động:
  - Xem chi tiết: chuyển đi trang chi tiết file.
  - Xem trước: mở tab mới hiển thị nội dung (PDF/ảnh inline, loại khác tải xuống).
  - Tải xuống: nhận file từ endpoint download.
- Xác nhận hợp đồng hiển thị bằng `ContractFileCard`, file thường bằng `GeneralFileCard`.

## Lưu Ý
- Nếu cần i18n cho text nút, dùng `t('repositories.files.card.view')`, `t('repositories.files.card.preview')`, `t('repositories.files.card.download')`.
- Với loại không hiển thị inline (docx/xlsx), cả preview và download đều dùng endpoint download; tuỳ chọn thêm `PreviewPanel` sau.