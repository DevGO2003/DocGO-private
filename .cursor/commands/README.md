# Cursor Commands

Danh sách các commands đã được chuyển hóa từ `.windsurf/workflows` sang `.cursor/commands`.

## 📋 Danh sách Commands

### 🐳 Docker Commands
- **[docker-logs.md](docker-logs.md)** - Xem logs Docker với auto-debug
- **[docker-start.md](docker-start.md)** - Khởi động Docker services
- **[docker-status.md](docker-status.md)** - Kiểm tra trạng thái Docker containers

### 🔧 Git Commands
- **[git-commit.md](git-commit.md)** - Tạo commit với conventional commits
- **[git-push.md](git-push.md)** - Push commits lên remote origin
- **[git-backup-env.md](git-backup-env.md)** - Backup environment files

### 🛠️ Development Commands
- **[do-it.md](do-it.md)** - Thực hiện công việc được gợi ý hoặc tiếp tục task
- **[do-all.md](do-all.md)** - Chạy toàn bộ workflow tự động
- **[ask.md](ask.md)** - Phân tích vấn đề và đưa ra giải pháp
- **[summarize-chat.md](summarize-chat.md)** - Tóm tắt cuộc trò chuyện

### 🌐 Web & Browser Commands
- **[browser.md](browser.md)** - Sử dụng MCP Browser để duyệt web
- **[chrome.md](chrome.md)** - Điều khiển Chrome qua MCP Chrome DevTools

### 📊 Database Commands
- **[mongo.md](mongo.md)** - Kết nối MongoDB qua MCP Server

### 📈 Reporting Commands
- **[make-report.md](make-report.md)** - Tạo báo cáo tiến độ hằng ngày

### 📝 Task Management Commands
- **[cursor-todo.md](cursor-todo.md)** - Quản lý TODO list trong Cursor

### 💬 Discord Commands
- **[discord-send.md](discord-send.md)** - Gửi tin nhắn Discord
- **[discord-create-listener.md](discord-create-listener.md)** - Tạo Discord listener
- **[discord-list-listeners.md](discord-list-listeners.md)** - Liệt kê Discord listeners

### 🔧 Git Commands Bổ Sung
- **[git-restore-env-local.md](git-restore-env-local.md)** - Khôi phục environment files
- **[git-push-private.md](git-push-private.md)** - Push lên remote private

### 🛠️ System Commands
- **[health.md](health.md)** - Kiểm tra sức khỏe hệ thống
- **[setup-cursor.md](setup-cursor.md)** - Thiết lập Cursor environment
- **[delete-all-scripts.md](delete-all-scripts.md)** - Xóa file scripts không cần thiết

## 🚀 Cách sử dụng

### 1. **Docker Management**
```bash
# Kiểm tra trạng thái
/cursor-todo docker-status

# Khởi động services
/cursor-todo docker-start

# Xem logs với auto-debug
/cursor-todo docker-logs
```

### 2. **Git Workflow**
```bash
# Tạo commit
/cursor-todo git-commit

# Push lên remote
/cursor-todo git-push

# Backup environment
/cursor-todo git-backup-env
```

### 3. **Development Workflow**
```bash
# Phân tích vấn đề
/cursor-todo ask

# Tóm tắt cuộc trò chuyện
/cursor-todo summarize-chat

# Thực hiện task tự động
/cursor-todo do-all

# Tiếp tục công việc
/cursor-todo do-it
```

### 4. **Web & Research**
```bash
# Duyệt web
/cursor-todo browser

# Điều khiển Chrome
/cursor-todo chrome
```

### 5. **Database Operations**
```bash
# Kết nối MongoDB
/cursor-todo mongo
```

### 6. **Reporting & Documentation**
```bash
# Tạo báo cáo
/cursor-todo make-report
```

### 7. **Task Management**
```bash
# Quản lý TODO
/cursor-todo cursor-todo
```

### 8. **Discord Integration**
```bash
# Gửi tin nhắn Discord
/cursor-todo discord-send

# Tạo Discord listener
/cursor-todo discord-create-listener

# Liệt kê Discord listeners
/cursor-todo discord-list-listeners
```

### 9. **Git Advanced**
```bash
# Khôi phục environment
/cursor-todo git-restore-env-local

# Push lên private remote
/cursor-todo git-push-private
```

### 10. **System Management**
```bash
# Kiểm tra sức khỏe hệ thống
/cursor-todo health

# Thiết lập Cursor
/cursor-todo setup-cursor

# Dọn dẹp scripts
/cursor-todo delete-all-scripts
```

## 📝 Ghi chú

- Tất cả commands đã được chuyển hóa từ `.windsurf/workflows` sang `.cursor/commands`
- Các commands giữ nguyên chức năng và quy trình thực hiện
- Đã cập nhật đường dẫn từ `.windsurf` sang `.cursor` trong các references
- Commands sử dụng Cursor TODO system thay vì Windsurf TODO

## 🔄 Migration Notes

### Thay đổi chính:
1. **Đường dẫn**: `.windsurf/workflows` → `.cursor/commands`
2. **TODO System**: Windsurf TODO → Cursor TODO
3. **MCP Configuration**: `.windsurf/mcp.json` → `.cursor/mcp.json`
4. **Environment Files**: `.windsurf/tools/` → `.cursor/tools/`

### Giữ nguyên:
- Chức năng và logic của từng command
- Quy trình thực hiện
- Cú pháp sử dụng
- Best practices và troubleshooting

## 🎯 Mục tiêu

Cung cấp bộ commands hoàn chỉnh cho việc phát triển dự án DocGO với:
- **Docker management** hiệu quả
- **Git workflow** chuẩn
- **Development tools** mạnh mẽ
- **Web research** capabilities
- **Database operations** an toàn
- **Task management** rõ ràng
- **Reporting** chuyên nghiệp
