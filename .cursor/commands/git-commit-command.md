# Git Commit

Tạo commit với message mô tả thay đổi.

## Mô tả
Command này sẽ tạo commit với message theo chuẩn conventional commits cho dự án DocGO.

## Cách sử dụng
Gõ /git-commit trong Agent input để chạy command này.

## Lệnh thực thi
```bash
git commit -m "feat: thêm tính năng mới"
```

## Các loại commit message
- `feat:` - Tính năng mới
- `fix:` - Sửa lỗi
- `docs:` - Cập nhật tài liệu
- `style:` - Format code, không thay đổi logic
- `refactor:` - Refactor code
- `test:` - Thêm hoặc sửa test
- `chore:` - Cập nhật build, dependencies

## Ví dụ
```bash
git commit -m "feat(auth): thêm OAuth2 Google login"
git commit -m "fix(contract): sửa lỗi validation contract number"
git commit -m "docs(api): cập nhật API documentation"
```

## Lưu ý
- Sử dụng git-add-all trước khi commit
- Message ngắn gọn, rõ ràng
- Theo chuẩn conventional commits
- Sử dụng git-push để push lên remote
