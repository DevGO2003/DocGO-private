# Git Push

Push commits lên remote repository.

## Mô tả
Command này sẽ push tất cả commits đã tạo lên remote repository (origin).

## Cách sử dụng
Gõ /git-push trong Agent input để chạy command này.

## Lệnh thực thi
`ash
git push origin
`

## Tùy chọn khác
- Push branch cụ thể: git push origin <branch-name>
- Push và set upstream: git push -u origin <branch-name>
- Force push (cẩn thận): git push --force-with-lease

## Lưu ý
- Đảm bảo đã commit trước khi push
- Kiểm tra branch hiện tại với git-status
- Sử dụng git-pull để sync trước khi push
- Không force push trên main/master branch
