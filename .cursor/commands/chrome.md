# Chrome Command - Điều khiển Chrome qua MCP Chrome DevTools

## Mục đích
Sử dụng Chrome DevTools MCP để:
- Mở/đóng Chrome, tạo tab mới, liệt kê tabs
- Điều hướng URL, chụp ảnh màn hình
- Lấy console logs, đánh giá script

## Cách sử dụng nhanh
```bash
/chrome open                         # Mở Chrome (stable, viewport 1280x720)
/chrome tabs                         # Liệt kê tabs hiện có
/chrome new-tab <url>                # Mở tab mới tới URL
/chrome navigate <url>               # Điều hướng tab hiện tại tới URL
/chrome screenshot [full]            # Chụp ảnh màn hình (full page tùy chọn)
/chrome console-logs                 # Lấy console logs của tab hiện tại
/chrome eval <expression>            # Chạy JS trong tab hiện tại
/chrome close                        # Đóng trình duyệt
```

## Yêu cầu
- Đã cấu hình `chrome-devtools` trong `.cursor/mcp.json` với `npx chrome-devtools-mcp@latest`
- Nếu vừa chỉnh `.cursor/mcp.json`, hãy restart Cursor để nạp MCP server

## Quy trình thực hiện

### 1. 🔌 Khởi tạo/ kết nối Chrome
- Nếu Chrome chưa chạy: khởi tạo phiên Chrome với channel `stable`, viewport `1280x720`
- Nếu đã chạy: kết nối tới phiên hiện có (ưu tiên reuse)

### 2. 🌐 Điều khiển phiên làm việc
- `tabs`: lấy danh sách tabs, xác định tab hiện tại
- `new-tab <url>`: tạo tab mới và chuyển thành tab hiện tại
- `navigate <url>`: điều hướng tab hiện tại tới URL

### 3. 📸 Quan sát & debug
- `screenshot [full]`: chụp ảnh tab hiện tại (full-page nếu có `full`)
- `console-logs`: lấy console logs
- `eval <expression>`: thực thi JS trong context trang

### 4. ⛔ Kết thúc phiên
- `close`: đóng toàn bộ phiên Chrome do MCP quản lý (nếu chạy ở chế độ isolated)

## Tham số
- `<url>`: URL hợp lệ (http/https)
- `<expression>`: Biểu thức JavaScript đơn giản (ví dụ: `document.title`)

## Lưu ý quan trọng
- **BẮT BUỘC** dùng MCP Chrome DevTools; không tạo script bên ngoài
- Nếu site chặn automation, một số thao tác có thể hạn chế
- Khi gặp SSL/self-signed, cân nhắc bật `--acceptInsecureCerts` trong `.cursor/mcp.json`

## Troubleshooting
- "Chrome MCP chưa sẵn sàng": Restart Cursor để nạp MCP
- "Không có tab hiện tại": Tạo tab bằng `/chrome new-tab <url>` trước
- "Navigation timeout": Kiểm tra URL, mạng hoặc thử lại
- "Eval bị chặn": Trang có CSP chặt, thử đọc-only như `document.title`




























