# Git Add All

Stage tất cả các thay đổi trong repository.

## Mô tả
Command này sẽ thêm tất cả các file đã thay đổi, thêm mới, và xóa vào staging area để chuẩn bị commit.

## Cách sử dụng
Gõ /git-add-all trong Agent input để chạy command này.

## Lệnh thực thi
`ash
git add .
`

## Tùy chọn khác
- Stage file cụ thể: git add <filename>
- Stage tất cả file đã modified: git add -u
- Stage interactively: git add -i

## Lưu ý
- Kiểm tra .gitignore để đảm bảo không stage file không cần thiết
- Sử dụng git-status để xem trạng thái trước khi add
- Sử dụng git-commit để commit sau khi add
