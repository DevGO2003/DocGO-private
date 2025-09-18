# Git Push Private

Đẩy nhánh hiện tại lên remote `private`, kèm TẤT CẢ file env theo yêu cầu: `.env`, `.env.local`, `.env.example` (force track kể cả khi bị .gitignore).

## Mô tả
- Tự động xác định/chuẩn hóa nhánh và push lên remote `private` (không hỏi xác nhận).
- Nếu không xác định được nhánh hiện tại (HEAD detached), ưu tiên dùng `thaiGO`, sau đó `LocTruongLuan`; nếu không tồn tại thì tự tạo mới và checkout.
- Đảm bảo các file env được force-add: `**/.env`, `**/.env.local`, `**/.env.example`.
- Sau khi push `private` thành công, tự động khôi phục upstream về `origin/<branch>` để tiếp tục làm việc như cũ.
- Không thêm các file nhạy cảm khác như `.env` gốc, `.env.production` (đang bị ignore theo quy tắc Git của dự án).

## Yêu cầu
- Đã cấu hình remote tên `private` (ví dụ: `git remote add private <PRIVATE_GIT_URL>`).
- Lưu ý QUAN TRỌNG: Hành động này force-add secrets (bao gồm `.env`). Hãy kiểm tra nội dung trước khi push.

## Cách sử dụng
- Gõ `/git-push-private` trong Agent input để chạy command này. Không yêu cầu xác nhận.

## Lệnh thực thi (PowerShell - Windows)
```powershell
# 1) Xác định/chuẩn hóa nhánh làm việc
$branch = git rev-parse --abbrev-ref HEAD
if ($branch -eq 'HEAD' -or [string]::IsNullOrEmpty($branch)) {
  $cands = @('thaiGO','LocTruongLuan')
  $picked = $null
  foreach ($b in $cands) { if (git rev-parse --verify $b 2>$null) { $picked = $b; break } }
  if (-not $picked) { $picked = $cands[0]; git checkout -b $picked } else { git checkout $picked }
  $branch = $picked
}

# Lưu upstream cũ (nếu có) để khôi phục về origin
$prevUpstream = git rev-parse --abbrev-ref --symbolic-full-name "@{u}" 2>$null  # ví dụ: origin/thaiGO

# 2) Stage & commit không cần xác nhận
git add -A
# Force track env bất chấp .gitignore
git add -f **/.env 2>$null
git add -f **/.env.local 2>$null
git add -f **/.env.example 2>$null
# Commit nếu có thay đổi
git commit -m "chore(env): force track env files (.env, .env.local, .env.example)" --no-verify 2>$null
if ($LASTEXITCODE -ne 0) { Write-Output "No changes to commit" }

# 3) Push lên remote private cùng tên nhánh (set upstream nếu cần)
git push --set-upstream private $branch
if ($LASTEXITCODE -eq 0) {
  # 4) Khôi phục upstream về origin/<branch> để tiếp tục làm việc với origin
  if ($prevUpstream) {
    git branch --set-upstream-to=$prevUpstream $branch 2>$null
  } else {
    git branch --set-upstream-to=origin/$branch $branch 2>$null
  }
}
```

## Lệnh thực thi (Bash)
```bash
# 1) Xác định/chuẩn hóa nhánh làm việc
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "HEAD" ] || [ -z "$branch" ]; then
  for cand in thaiGO LocTruongLuan; do
    if git rev-parse --verify "$cand" >/dev/null 2>&1; then branch="$cand"; break; fi
  done
  if [ -z "$branch" ] || [ "$branch" = "HEAD" ]; then
    branch="thaiGO"
    git checkout -b "$branch"
  else
    git checkout "$branch"
  fi
fi

# Lưu upstream cũ (nếu có) để khôi phục về origin
prev_upstream="$(git rev-parse --abbrev-ref --symbolic-full-name '@{u}' 2>/dev/null || true)"  # vd: origin/thaiGO

# 2) Stage & commit không cần xác nhận
git add -A
# Force track env bất chấp .gitignore
git add -f **/.env 2>/dev/null || true
git add -f **/.env.local 2>/dev/null || true
git add -f **/.env.example 2>/dev/null || true
# Commit nếu có thay đổi
git commit -m "chore(env): force track env files (.env, .env.local, .env.example)" --no-verify || true

# 3) Push lên remote private cùng tên nhánh (set upstream nếu cần)
if git push --set-upstream private "$branch"; then
  # 4) Khôi phục upstream về origin/<branch> để tiếp tục làm việc với origin
  if [ -n "$prev_upstream" ]; then
    git branch --set-upstream-to="$prev_upstream" "$branch" >/dev/null 2>&1 || true
  else
    git branch --set-upstream-to="origin/$branch" "$branch" >/dev/null 2>&1 || true
  fi
fi
```

## Tùy chọn khác
- Đặt remote `private`: `git remote add private <PRIVATE_GIT_URL>`
- Đổi remote url: `git remote set-url private <NEW_PRIVATE_GIT_URL>`
- Force push (cẩn thận): `git push --force-with-lease`

## Lưu ý
- Cảnh báo: Lệnh này sẽ đẩy cả secrets trong `.env`. Chỉ sử dụng khi thật sự cần thiết và repo private.
- Kiểm tra branch hiện tại: `git rev-parse --abbrev-ref HEAD`.
- Nên chạy `git pull --rebase private <branch>` nếu có commit mới từ remote trước khi push.
