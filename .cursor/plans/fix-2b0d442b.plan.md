<!-- 2b0d442b-61d3-4d26-8650-9e4a6675b90a 7ca19cb5-d8aa-45c8-a944-0ae751204252 -->
# Kế hoạch sửa trang /upload-document

## Phạm vi
- Khắc phục lỗi build của react-pdf và đảm bảo PDF preview hoạt động trong Next 14.
- Đảm bảo trang không SSR các preview nặng và không còn crash dev server.

## Việc sẽ làm

### 1) Ổn định import và worker cho react-pdf
- Sửa `src/components/preview/PdfPreview.tsx`:
  - Import từ `react-pdf` thay vì các entry nội bộ.
  - Cấu hình worker: `pdfjs.GlobalWorkerOptions.workerSrc = //unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`.
- Kiểm tra kích thước render, tắt text/annotation layer để nhẹ hơn.

### 2) Cấu hình Next để không chặn pdfjs-dist
- Sửa `frontend/web-app/next.config.js`:
  - Gỡ rule `null-loader` cho `pdfjs-dist` (đã gây lỗi import trace).
  - Giữ alias `canvas: false` để tránh native deps.

### 3) Tải lazy các preview để tránh SSR crash
- `src/lib/preview/registerPreviews.ts`:
  - Dùng `next/dynamic(..., { ssr:false })` cho toàn bộ preview components (PDF, Image, Video, Audio, Office, Code, Text, Generic).

### 4) Kiểm tra runtime & logs
- Restart dev server (`npm run dev`) để áp dụng `next.config.js`.
- Mở `http://localhost:3000/upload-document`, lấy console logs.
- Nếu còn lỗi module, khoanh vùng phiên bản:
  - Xác nhận `react-pdf@^7` và `pdfjs-dist@^3` (đúng hiện tại).
  - Nếu cần, pin về cặp tương thích (`react-pdf@7.7.x`, `pdfjs-dist@3.11.x`).

### 5) Smoke test chức năng trang
- Kéo thả/chọn file thử (pdf, png, docx, txt) để xác minh:
  - Upload button enable/disable đúng.
  - Preview hiển thị với từng loại.
  - Không có warning/hydration lỗi trong console.

### 6) Bảo trì & dọn dẹp
- Thêm `src/types/react-pdf-override.d.ts` nếu TS cần mapping type cho entry thay thế.
- Đảm bảo không tạo README/test script rác theo rules.

### 7) Sửa Docker web-app thiếu module (jszip)
- Cập nhật `frontend/web-app/Dockerfile` đổi `npm ci` → `npm install` để đồng bộ lại lock và cài đủ deps.
- Rebuild riêng service `web-app` với `--no-cache` sau khi đổi Dockerfile.
- Khởi động lại `web-app` và xác nhận `jszip` tồn tại: mở `/upload-document` không còn lỗi "Can't resolve 'jszip'".

## Acceptance Criteria
- Truy cập `/upload-document` không còn "Failed to compile".
- Preview PDF hoạt động ổn định; không crash khi chọn file.
- Không có SSR/hydration error liên quan preview.
- Upload thành công trả toast như hiện tại.
- Docker 3000 chạy không thiếu dependency (không còn lỗi 'jszip').


### To-dos

- [ ] Sửa import & worker trong PdfPreview.tsx
- [ ] Gỡ null-loader pdfjs-dist, giữ alias canvas=false
- [ ] Áp dụng dynamic import ssr:false cho preview components
- [ ] Restart dev server và kiểm tra console logs trang
- [ ] Kiểm tra kéo thả/preview nhiều định dạng và upload thành công
- [ ] Bổ sung .d.ts override nếu TS cảnh báo import