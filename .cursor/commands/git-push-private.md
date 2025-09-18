# Git Push Private

Đẩy nhánh hiện tại lên remote `private`, kèm TẤT CẢ file env theo yêu cầu: `.env`, `.env.local`, `.env.example` (force track kể cả khi bị .gitignore).

## Mô tả
- Tự động xác định nhánh hiện tại và push lên remote `private` (tạo upstream nếu chưa có).
- Đảm bảo các file env được force-add: `**/.env`, `**/.env.local`, `**/.env.example`.
- Không thêm các file nhạy cảm khác như `.env` gốc, `.env.production` (đang bị ignore theo quy tắc Git của dự án).

## Yêu cầu
- Đã cấu hình remote tên `private` (ví dụ: `git remote add private <PRIVATE_GIT_URL>`).
- Lưu ý QUAN TRỌNG: Hành động này force-add secrets (bao gồm `.env`). Hãy kiểm tra nội dung trước khi push.

## Cách sử dụng
- Gõ `/git-push-private` trong Agent input để chạy command này.

## Lệnh thực thi (PowerShell - Windows)
```powershell
$branch = git rev-parse --abbrev-ref HEAD
# Stage mọi thay đổi bình thường
git add -A
# Force track tất cả env (kể cả bị .gitignore)
git add -f **/.env 2>$null
git add -f **/.env.local 2>$null
git add -f **/.env.example 2>$null
# Commit nếu có thay đổi đang được stage
git commit -m "chore(env): force track env files (.env, .env.local, .env.example)" --no-verify 2>$null
if ($LASTEXITCODE -ne 0) { Write-Output "No changes to commit" }
# Push lên remote private, set upstream nếu cần
git push --set-upstream private $branch
```

## Lệnh thực thi (Bash)
```bash
branch="$(git rev-parse --abbrev-ref HEAD)"
# Stage mọi thay đổi bình thường
git add -A
# Force track tất cả env (kể cả bị .gitignore)
git add -f **/.env 2>/dev/null || true
git add -f **/.env.local 2>/dev/null || true
git add -f **/.env.example 2>/dev/null || true
# Commit nếu có thay đổi đang được stage
git commit -m "chore(env): force track env files (.env, .env.local, .env.example)" --no-verify || true
# Push lên remote private, set upstream nếu cần
git push --set-upstream private "$branch"
```

## Tùy chọn khác
- Đặt remote `private`: `git remote add private <PRIVATE_GIT_URL>`
- Đổi remote url: `git remote set-url private <NEW_PRIVATE_GIT_URL>`
- Force push (cẩn thận): `git push --force-with-lease`

## Lưu ý
- Cảnh báo: Lệnh này sẽ đẩy cả secrets trong `.env`. Chỉ sử dụng khi thật sự cần thiết và repo private.
- Kiểm tra branch hiện tại: `git rev-parse --abbrev-ref HEAD`.
- Nên chạy `git pull --rebase private <branch>` nếu có commit mới từ remote trước khi push.`}
