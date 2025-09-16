# Git Status

Kiểm tra trạng thái Git của repository hiện tại.

## Mô tả
Command này sẽ hiển thị trạng thái của working directory và staging area, bao gồm các file đã thay đổi, thêm mới, hoặc chưa được track.

## Cách sử dụng
Gõ /git-status trong Agent input để chạy command này.

## Lệnh thực thi
`ash
git status
`

## Kết quả mong đợi
- Hiển thị branch hiện tại
- Danh sách file đã modified, added, deleted
- File untracked
- Thông tin về commits ahead/behind remote

## Lưu ý
- Sử dụng git-add để stage files
- Sử dụng git-commit để commit changes
- Sử dụng git-push để push lên remote
