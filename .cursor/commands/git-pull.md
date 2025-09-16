# Git Pull

Pull changes từ remote repository về local.

## Mô tả
Command này sẽ fetch và merge changes từ remote repository vào branch hiện tại.

## Cách sử dụng
Gõ /git-pull trong Agent input để chạy command này.

## Lệnh thực thi
`ash
git pull origin
`

## Tùy chọn khác
- Pull branch cụ thể: git pull origin <branch-name>
- Pull với rebase: git pull --rebase origin
- Pull và force: git pull --force origin

## Lưu ý
- Commit hoặc stash changes trước khi pull
- Sử dụng git-status để kiểm tra trạng thái
- Resolve conflicts nếu có
- Sử dụng git-push sau khi pull thành công
