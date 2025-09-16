# Git Push Private

Đẩy nhánh hiện tại lên remote `private`, kèm các file env template an toàn (`.env.example`) và cả file cấu hình local (`.env.local`) theo yêu cầu.

## Mô tả
- Tự động xác định nhánh hiện tại và push lên remote `private` (tạo upstream nếu chưa có).
- Đảm bảo các file `env/.env.example` và `env/.env.local` trong từng microservice được stage/commit trước khi push.
- Không thêm các file nhạy cảm khác như `.env` gốc, `.env.production` (đang bị ignore theo quy tắc Git của dự án).

## Yêu cầu
- Đã cấu hình remote tên `private` (ví dụ: `git remote add private <PRIVATE_GIT_URL>`).
- Lưu ý: `.env.local` sẽ được đưa vào commit theo yêu cầu. Hãy kiểm tra nội dung trước khi push.

## Cách sử dụng
- Gõ `/git-push-private` trong Agent input để chạy command này.

## Lệnh thực thi (PowerShell - Windows)
```powershell
$branch = git rev-parse --abbrev-ref HEAD
# Stage mọi thay đổi bình thường
git add -A
# Đảm bảo track các file env template và local
git add **/env/.env.example 2>$null
git add **/env/.env.local 2>$null
# Commit nếu có thay đổi đang được stage
git commit -m "chore(env): ensure env templates are tracked" --no-verify 2>$null || echo "No changes to commit"
# Push lên remote private, set upstream nếu cần
git push --set-upstream private $branch
```

## Lệnh thực thi (Bash)
```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
# Stage mọi thay đổi bình thường
git add -A
# Đảm bảo track các file env template và local
git add **/env/.env.example 2>/dev/null || true
git add **/env/.env.local 2>/dev/null || true
# Commit nếu có thay đổi đang được stage
git commit -m "chore(env): ensure env templates are tracked" --no-verify || true
# Push lên remote private, set upstream nếu cần
git push --set-upstream private "$branch"
```

## Tùy chọn khác
- Đặt remote `private`: `git remote add private <PRIVATE_GIT_URL>`
- Đổi remote url: `git remote set-url private <NEW_PRIVATE_GIT_URL>`
- Force push (cẩn thận): `git push --force-with-lease`

## Lưu ý
- Secrets (.env, .env.production, .env.staging…) vẫn bị ignore theo `.gitignore` của dự án và sẽ không được đẩy. Riêng `.env.local` được include theo yêu cầu.
- Kiểm tra branch hiện tại: `git rev-parse --abbrev-ref HEAD`.
- Nên chạy `git pull --rebase private <branch>` nếu có commit mới từ remote trước khi push.`}
