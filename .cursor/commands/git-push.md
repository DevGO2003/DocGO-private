# Git Push

Push commits lên remote repository.

## Mô tả
- Tự động xác định/chuẩn hóa nhánh và push lên remote `origin` (không hỏi xác nhận).
- Nếu không xác định được nhánh hiện tại (HEAD detached), ưu tiên dùng `thaiGO`, sau đó `LocTruongLuan`; nếu không tồn tại thì tự tạo mới và checkout.
- Tự động stage & commit trước khi push.

## Cách sử dụng
Gõ /git-push trong Agent input để chạy command này. Không yêu cầu xác nhận.

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

# 2) Stage & commit không cần xác nhận
git add -A
git commit -m "chore: push pending changes" --no-verify 2>$null
if ($LASTEXITCODE -ne 0) { Write-Output "No changes to commit" }

# 3) Push lên origin/<branch>
git push origin $branch
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

# 2) Stage & commit không cần xác nhận
git add -A
git commit -m "chore: push pending changes" --no-verify || true

# 3) Push lên origin/<branch>
git push origin "$branch"
```

## Tùy chọn khác
- Push branch cụ thể: git push origin <branch-name>
- Push và set upstream: git push -u origin <branch-name>
- Force push (cẩn thận): git push --force-with-lease

## Lưu ý
- Đảm bảo đã commit trước khi push
- Kiểm tra branch hiện tại với git-status
- Sử dụng git-pull để sync trước khi push
- Không force push trên main/master branch
