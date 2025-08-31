# Autofiles - Tự động hóa và Scripts

Thư mục này chứa tất cả các file tự động hóa, script và cấu hình Docker cho dự án DocGO.

## 📁 Cấu trúc thư mục

```
autofiles/
├── 📄 README.md                           # Hướng dẫn này
├── 🐳 Docker Files
│   ├── docker-compose.yml                 # Production mode (build context)
│   ├── docker-compose.dev.yml             # Development mode (volume mount)
│   └── Docker_Development_Guide.md        # Hướng dẫn Docker chi tiết
├── 🚀 Docker Scripts
│   ├── docker-dev.bat                     # Script Windows Batch (Development)
│   ├── docker-dev.ps1                     # Script PowerShell (Development)
│   ├── docker-build-and-run.bat           # Script Windows Batch (Production)
│   └── docker-build-and-run.ps1           # Script PowerShell (Production)
├── 🔧 Git Scripts
│   ├── git_push_and_sync.bat              # Script Windows Batch
│   ├── git_push_and_sync.ps1              # Script PowerShell
│   └── GIT_SYNC_README.md                 # Hướng dẫn Git sync
├── 🗄️ Database Scripts
│   └── create_db_symlink.bat              # Tạo symlink database
├── 📚 Documentation
│   ├── Docker_Setup_Guide.md              # Hướng dẫn cài đặt Docker
│   └── how devgo2003                      # Hướng dẫn sử dụng DevGO
└── 🔄 Utility Scripts
    └── reset_all_branches.bat             # Reset tất cả nhánh Git
```

## 🚀 Cách sử dụng

### Docker Development Mode
```bash
# Chạy nhanh với script
.\autofiles\docker-dev.bat

# Hoặc PowerShell
.\autofiles\docker-dev.ps1

# Chạy thủ công
docker-compose -f autofiles/docker-compose.dev.yml up -d
```

### Docker Production Mode
```bash
# Chạy với script
.\autofiles\docker-build-and-run.bat

# Hoặc PowerShell
.\autofiles\docker-build-and-run.ps1

# Chạy thủ công
docker-compose -f autofiles/docker-compose.yml up -d
```

### Git Sync
```bash
# Push và đồng bộ hóa tự động
.\autofiles\git_push_and_sync.bat

# Hoặc PowerShell
.\autofiles\git_push_and_sync.ps1
```

## 📍 Đường dẫn tương đối

Tất cả các file trong thư mục này đã được cập nhật để sử dụng đường dẫn tương đối từ thư mục gốc:

- `../backend/` → Thư mục backend services
- `../frontend/` → Thư mục frontend applications  
- `../database/` → Thư mục database scripts

## ⚠️ Lưu ý quan trọng

1. **Luôn chạy script từ thư mục gốc** của dự án (không phải từ thư mục `autofiles`)
2. **Các đường dẫn đã được cập nhật** để hoạt động từ thư mục gốc
3. **Script sẽ tự động tìm** các file cấu hình trong thư mục `autofiles`

## 🔧 Troubleshooting

### Nếu gặp lỗi đường dẫn:
```bash
# Đảm bảo bạn đang ở thư mục gốc của dự án
cd P:\DevGO2003\DocGO

# Sau đó chạy script
.\autofiles\docker-dev.bat
```

### Nếu script không tìm thấy file:
- Kiểm tra xem bạn có đang ở thư mục gốc không
- Kiểm tra xem thư mục `autofiles` có tồn tại không
- Kiểm tra quyền truy cập file

## 📚 Tài liệu liên quan

- [Docker Development Guide](Docker_Development_Guide.md) - Hướng dẫn chi tiết Docker
- [Docker Setup Guide](Docker_Setup_Guide.md) - Hướng dẫn cài đặt Docker
- [Git Sync README](GIT_SYNC_README.md) - Hướng dẫn đồng bộ Git

---

**Lưu ý**: Tất cả script trong thư mục này được thiết kế để chạy từ thư mục gốc của dự án DocGO.
