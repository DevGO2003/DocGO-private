---
description: Setup Windsurf Commands
---

# Setup Windsurf Commands

## Cách sử dụng
```bash
/setup-windsurf
```

## Lệnh dưới đây sẽ bổ sung vào Windsurf TODO:
  Phần 1: Thiết lập biến môi trường
  1) <you>: cách người dùng sẽ gọi cho Windsurf
  2) <me>: cách Windsurf gọi cho người dùng
  3) <mcp>: nội dung file trong đường dẫn: .windsurf\mcp.json
  Phần 2: 
  1) Xóa hết saved memories của Windsurf đi.
  2) Yêu cầu người dùng nhập <you> và <me>
  3) Lưu vào saved memories 3 nội dung tách biệt:
    - Luôn trả lời tiếng Việt.
    - Windsurf là <you>.
    - Người dùng là <me>.
  2) Mỏ <json> lên và thực thiện đọc. Đọc xong chạy từng powershell "npx -y --help" để cài các mcp server vào máy.