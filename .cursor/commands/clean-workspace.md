# Clean Workspace Command - Dọn dẹp toàn bộ workspace

## Mục đích
Khi người dùng yêu cầu "dọn dẹp workspace" hoặc "clean workspace", command này sẽ:
- **Tự động tìm và xóa** tất cả file rác trong toàn bộ workspace
- **Giữ lại** các file cấu hình quan trọng và thư mục được bảo vệ
- **Dọn dẹp workspace** để tránh file rác và tối ưu hiệu suất
- **Báo cáo chi tiết** về các file đã xóa và giữ lại

## Quy trình thực hiện

### 1. 🔍 Tìm kiếm file rác
- **Quét toàn bộ workspace** để tìm file rác
- **Phân loại** file theo loại: Scripts, Logs, Cache, Build artifacts, Temporary files
- **Kiểm tra** file nào cần giữ lại (README, requirements, config, .cursor, .windsurf)

### 2. 🗑️ Xóa file rác
- **Xóa từng file** rác một cách an toàn
- **Báo cáo** tên file và lý do xóa
- **Đếm tổng số** file đã xóa theo từng loại

### 3. 📊 Báo cáo kết quả
- **Danh sách file** đã xóa theo loại
- **Tổng số file** đã xóa
- **File được giữ lại** (nếu có)
- **Trạng thái** workspace sau khi dọn dẹp

## ⚠️ QUY TẮC NGHIÊM NGẶT
- **XÓA** file rác trong toàn bộ workspace
- **KHÔNG xóa** file trong thư mục `.cursor/` và `.windsurf/`
- **KHÔNG xóa** file cấu hình quan trọng
- **KHÔNG xóa** file README chính hoặc documentation
- **BÁO CÁO** trước khi xóa file quan trọng

## File được xóa tự động
- ✅ `*.py` - Python scripts (trừ trong .cursor, .windsurf)
- ✅ `*.js` - JavaScript scripts (trừ config files)
- ✅ `*.bat` - Batch scripts
- ✅ `*.ps1` - PowerShell scripts
- ✅ `*.sh` - Shell scripts
- ✅ `*.md` - Markdown files (trừ README.md chính và trong .cursor, .windsurf)
- ✅ `*.log` - Log files
- ✅ `*.tmp` - Temporary files
- ✅ `*.temp` - Temporary files
- ✅ `*.cache` - Cache files
- ✅ `*.bak` - Backup files
- ✅ `*.old` - Old files
- ✅ `*.orig` - Original files

## File được giữ lại
- ❌ `README.md` - Documentation chính
- ❌ `requirements*.txt` - Dependencies
- ❌ `package*.json` - Node.js config
- ❌ `*.config.*` - Configuration files
- ❌ `*.env*` - Environment files
- ❌ `.cursor/**` - Cursor configuration
- ❌ `.windsurf/**` - Windsurf configuration
- ❌ `backend/**/README.md` - Service documentation
- ❌ `frontend/**/README.md` - Frontend documentation

## Ví dụ sử dụng
```
clean-workspace: Dọn dẹp toàn bộ workspace
clean workspace: Làm sạch workspace
dọn dẹp: Loại bỏ file rác
clean: Tối ưu workspace
```

## Kết quả mong đợi
- 🗑️ **Xóa thành công** tất cả file rác không cần thiết
- 📊 **Báo cáo chi tiết** về file đã xóa theo loại
- 🧹 **Workspace sạch sẽ** không còn file rác
- ✅ **Giữ lại** file cấu hình quan trọng
- 📈 **Thống kê** tổng số file đã dọn dẹp
- 🚀 **Tối ưu hiệu suất** workspace

## Lưu ý quan trọng
- Command này **KHÔNG thể hoàn tác** - file đã xóa sẽ mất vĩnh viễn
- **Kiểm tra kỹ** trước khi xóa file quan trọng
- **Backup** file cần thiết trước khi chạy command
- **Chỉ chạy** khi chắc chắn muốn dọn dẹp workspace
- **Bảo vệ** thư mục .cursor và .windsurf
