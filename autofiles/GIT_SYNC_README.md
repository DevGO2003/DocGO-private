# Git Push and Sync Script

Script tự động hóa quá trình push code lên `origin` và đồng bộ hóa sang `private` remote.

## 🎯 Mục đích

- **Tự động hóa** quá trình push và đồng bộ hóa giữa 2 remote
- **Đảm bảo** code nguồn luôn được đồng bộ giữa `origin` và `private`
- **Bảo mật** - không push secrets lên `origin` public
- **Tiết kiệm thời gian** - không cần chạy nhiều lệnh Git riêng biệt

## 📁 Files

- `git_push_and_sync.ps1` - Script PowerShell chính
- `git_push_and_sync.bat` - Script batch wrapper (dễ sử dụng)
- `GIT_SYNC_README.md` - File hướng dẫn này

## 🚀 Cách sử dụng

### 1. Sử dụng script batch (khuyến nghị)

```bash
# Cú pháp cơ bản
git_push_and_sync.bat "commit message"

# Ví dụ
git_push_and_sync.bat "feat: thêm tính năng mới"
git_push_and_sync.bat "fix: sửa lỗi bug" main
git_push_and_sync.bat "docs: cập nhật tài liệu" main --SkipSync
```

### 2. Sử dụng PowerShell trực tiếp

```powershell
# Cú pháp cơ bản
.\git_push_and_sync.ps1 -CommitMessage "commit message"

# Với các tham số
.\git_push_and_sync.ps1 -CommitMessage "feat: thêm tính năng" -Branch "main" -Force

# Bỏ qua đồng bộ sang private
.\git_push_and_sync.ps1 -CommitMessage "feat: thêm tính năng" -SkipSync
```

## 📋 Tham số

| Tham số | Bắt buộc | Mô tả | Mặc định |
|---------|----------|-------|----------|
| `CommitMessage` | ✅ | Nội dung commit message | - |
| `Branch` | ❌ | Tên nhánh cần push | `main` |
| `SkipSync` | ❌ | Bỏ qua đồng bộ sang private | `false` |
| `Force` | ❌ | Force push (cẩn thận!) | `false` |

## 🔄 Quy trình hoạt động

### Bước 1: Kiểm tra trạng thái
- Kiểm tra Git repository
- Kiểm tra remote `origin` và `private`
- Kiểm tra có thay đổi cần commit không

### Bước 2: Commit changes
- `git add .` - Thêm tất cả thay đổi
- `git commit -m "message"` - Commit với message

### Bước 3: Push lên origin
- Kiểm tra trạng thái đồng bộ với origin
- Nếu cần, pull từ origin trước
- Push code lên origin

### Bước 4: Đồng bộ sang private
- Kiểm tra trạng thái đồng bộ với private
- Nếu cần, pull từ private trước
- Push code sang private để đồng bộ

## 🛡️ Bảo mật

### Quy tắc quan trọng:
- **KHÔNG BAO GIỜ** push file `.env` chứa secrets lên `origin`
- **LUÔN** kiểm tra `.gitignore` trước khi push
- **Ưu tiên** push lên `origin` trước, sau đó đồng bộ sang `private`

### Kiểm tra trước khi push:
```bash
# Kiểm tra file sẽ được commit
git status

# Kiểm tra .gitignore
cat .gitignore

# Kiểm tra file nhạy cảm
git diff --cached
```

## ⚠️ Lưu ý quan trọng

### 1. Remote setup
Đảm bảo đã có cả 2 remote:
```bash
git remote -v
# origin  https://github.com/DevGO2003/DocGO (fetch)
# origin  https://github.com/DevGO2003/DocGO (push)
# private https://github.com/DevGO2003/DocGO-private.git (fetch)
# private https://github.com/DevGO2003/DocGO-private.git (push)
```

### 2. Quyền truy cập
- Cần có quyền push lên cả 2 remote
- Kiểm tra authentication trước khi sử dụng

### 3. Conflict resolution
- Script sẽ tự động pull trước khi push nếu cần
- Nếu có conflict, cần resolve thủ công

## 🔧 Troubleshooting

### Lỗi thường gặp:

#### 1. "Không phải Git repository"
```bash
# Đảm bảo đang ở thư mục Git
cd /path/to/your/git/repo
```

#### 2. "Không tìm thấy remote 'origin'"
```bash
# Kiểm tra remote
git remote -v

# Thêm remote nếu cần
git remote add origin https://github.com/DevGO2003/DocGO.git
```

#### 3. "Permission denied"
```bash
# Kiểm tra authentication
git config --list | grep user

# Cập nhật credentials nếu cần
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### 4. "Merge conflict"
```bash
# Resolve conflict thủ công
git status
# Sửa file conflict
git add .
git commit -m "resolve merge conflict"
# Chạy lại script
```

## 📚 Ví dụ sử dụng

### 1. Push tính năng mới
```bash
git_push_and_sync.bat "feat: thêm upload file PDF với malware scan"
```

### 2. Push fix bug
```bash
git_push_and_sync.bat "fix: sửa lỗi validation trong contract service"
```

### 3. Push documentation
```bash
git_push_and_sync.bat "docs: cập nhật API documentation"
```

### 4. Push lên nhánh khác
```bash
git_push_and_sync.bat "feat: thêm tính năng mới" develop
```

### 5. Bỏ qua đồng bộ private
```bash
git_push_and_sync.bat "feat: thêm tính năng mới" main --SkipSync
```

## 🎉 Kết quả

Khi script chạy thành công, bạn sẽ thấy:

```
========================================
    HOÀN THÀNH!
========================================
✅ Code đã được push và đồng bộ thành công!

📋 Tóm tắt:
   - Origin: ✅ Đã push
   - Private: ✅ Đã đồng bộ
```

## 📞 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra log lỗi trong terminal
2. Đảm bảo đã setup đúng remote
3. Kiểm tra quyền truy cập repository
4. Liên hệ team để được hỗ trợ
