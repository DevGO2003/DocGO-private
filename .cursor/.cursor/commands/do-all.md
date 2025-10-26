# Do All Command - Chạy toàn bộ tác vụ tự động, áp dụng mọi thay đổi không hỏi lại

## Mục đích
- Tự động chạy TOÀN BỘ workflow cho task hiện tại từ đầu đến cuối.
- Áp dụng tất cả thay đổi file ngay khi sẵn sàng, KHÔNG hỏi xác nhận từng bước.
- Giữ đúng chuẩn làm việc của DocGO (API Standards, Exception/Response, Service Structure, Docker, Git/ENV).

## Cách dùng nhanh
```bash
/do-all
```

## Hành vi tổng quát
- Không yêu cầu xác nhận ở từng bước; chỉ dừng khi gặp rủi ro cao (mất dữ liệu/ghi đè lớn) hoặc thiếu thông tin bắt buộc.
- Tự động lập/đọc TODO (nếu có) và thực thi tuần tự theo thứ tự ưu tiên.
- Tự động tạo và áp dụng "edits" vào codebase theo tiêu chuẩn format/linter hiện có.
- Tự động kiểm tra linter cho file vừa sửa và tự sửa lỗi đơn giản nếu có thể.
- Tự động cập nhật tài liệu `/docs` (Swagger) nếu thay đổi endpoint (không tạo file .md mới ngoài yêu cầu).
- Tự động tuân thủ các rule luôn áp dụng trong repo (API, Event/Exception, Service Structure, Docker, Ports, Actor/Audit, Ignore, Cleanup).

## Quy trình thực hiện

### 1) Chuẩn bị ngữ cảnh
- Đọc branch, trạng thái git (`modified/untracked`).
- Đọc các rule luôn áp dụng trong repo để đồng bộ tiêu chuẩn.
- Nếu task trước đó còn TODO dang dở: kế thừa và tiếp tục.

### 2) Phân tích và lập kế hoạch chạy
- Rà soát thay đổi cần làm theo yêu cầu người dùng và tiêu chuẩn kiến trúc.
- Xây dựng danh sách bước thực thi (TODO nội bộ) theo thứ tự:
  1. Edits mã nguồn (controller/router/service/config)
  2. Cập nhật cấu hình cần thiết (không đụng file env trừ khi có chỉ định)
  3. Kiểm tra compile/lint nhanh phạm vi file chỉnh sửa
  4. Cập nhật docs (Swagger/FastAPI) nếu liên quan

### 3) Thực thi không hỏi lại (apply all)
- Thực hiện các edits ngay khi bước sẵn sàng.
- Không yêu cầu xác nhận từng file; chỉ dừng nếu:
  - Nguy cơ xóa dữ liệu sản xuất
  - Ghi đè tệp lớn hoặc tệp đặc biệt (env, binary) khi không có chỉ định
- Giữ nguyên phong cách code hiện hữu, không tự ý refactor diện rộng ngoài phạm vi task.

### 4) Kiểm tra và tự sửa
- Chạy kiểm tra linter phạm vi file vừa chỉnh sửa; tự sửa lỗi đơn giản.
- Nếu không thể tự sửa trong 3 lần, ghi nhận cảnh báo và tiếp tục phần còn lại.

### 5) Cập nhật tiến độ
- Cập nhật trạng thái TODO sau từng bước lớn.
- Ghi ngắn gọn: đã làm gì, còn gì, rủi ro.

### 6) Kết thúc
- Đảm bảo tất cả edits đã áp dụng thành công.
- Tóm tắt thay đổi quan trọng ảnh hưởng đến API/behavior.
- Không tự động tạo/chỉnh README.md hay .md khác (trừ khi user yêu cầu rõ).

## Bảo vệ an toàn và giới hạn
- Không tạo file `.md` mới ngoài phạm vi `.cursor/commands/` hoặc theo yêu cầu rõ ràng.
- Không động chạm `.env`/secrets trừ khi có chỉ định cụ thể trong yêu cầu.
- Không trả HTTP 204; luôn 200 với `statusCode: 204` theo chuẩn response.
- Tự động tuân thủ đường dẫn `/api/v1/{service-name}/...` khi thêm sửa endpoint.
- Tự động giữ đúng port và đường dẫn `/docs#/` cho tài liệu.

## Kết quả mong đợi
- Toàn bộ thay đổi cần thiết của task được áp dụng ngay lập tức.
- Code biên dịch/lint sạch ở phạm vi chỉnh sửa (nếu có cấu hình linter).
- Tài liệu API (Swagger/FastAPI) đồng bộ với thay đổi endpoint.
- Báo cáo ngắn gọn cuối quá trình: thay đổi chính, rủi ro còn lại, bước tiếp theo.

## Ví dụ sử dụng
```
/do-all
→ Agent tự động thực hiện toàn bộ các edits và xác nhận hoàn tất mà không hỏi lại.
```

## Lưu ý quan trọng
- Ưu tiên an toàn dữ liệu và tiêu chuẩn codebase của DocGO.
- Dừng lại và báo cáo nếu phát hiện rủi ro cao hoặc thiếu thông tin nghiệp vụ cốt lõi.
- Mọi hành động đều được log ngắn gọn trong tiến trình để dễ trace.


