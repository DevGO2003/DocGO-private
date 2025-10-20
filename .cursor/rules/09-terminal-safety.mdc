---
id: "rule-terminal-safety"
description: "Quy tắc an toàn terminal: tránh lệnh interactive, hạn chế gộp lệnh, best practices, và error handling cho DocGO"
alwaysApply: false
globs:
  - "**/*.ps1"
  - "**/*.bat"
  - "**/*.sh"
tags:
  - terminal
  - safety
  - interactive
  - commands
  - best-practices
  - error-handling
  - pager
  - editor
  - security
---

# Terminal Safety Standards cho DocGO

## Mục tiêu
- Tránh các lệnh gây kẹt terminal (interactive commands)
- Hạn chế gộp lệnh phức tạp
- Đảm bảo terminal luôn responsive
- Tối ưu hóa error handling và recovery

## 1. TRÁNH CÁC LỆNH GÂY KẸT TERMINAL

### ❌ TUYỆT ĐỐI KHÔNG sử dụng các lệnh interactive

#### Git Commands (Mở Pager)
```powershell
# ❌ KHÔNG BAO GIỜ - Các lệnh mở pager
git log                    # Mở pager (less/more)
git diff                   # Mở pager
git show                   # Mở pager
git blame                  # Mở pager
git log --oneline -10      # Mở pager
git status                 # Mở pager
git add -p                 # Interactive mode
git rebase -i              # Mở editor
git commit                 # Mở editor
git merge                  # Mở editor
```

#### Editor Commands
```powershell
# ❌ KHÔNG BAO GIỜ - Các lệnh mở editor
vim file.txt               # Mở Vim editor
nano file.txt              # Mở Nano editor
notepad file.txt           # Mở Notepad
code file.txt              # Mở VS Code
```

#### Pager Commands
```powershell
# ❌ KHÔNG BAO GIỜ - Các lệnh mở pager
less file.txt              # Mở less pager
more file.txt              # Mở more pager
man command                # Mở manual pager
```

### ✅ SỬ DỤNG các lệnh non-interactive

#### Git Commands An toàn
```powershell
# ✅ AN TOÀN - Các lệnh không mở pager
git log --oneline -10 --no-pager
git diff --no-pager
git show --no-pager
git status --porcelain
git add -A
git commit -m "message" --no-verify
git log --oneline -5 --no-pager
git diff --name-only
git diff --stat
git log --stat --no-pager
```

#### File Reading An toàn
```powershell
# ✅ AN TOÀN - Đọc file không mở pager
Get-Content file.txt
Select-String pattern file.txt
Get-ChildItem
```

## 2. HẠN CHẾ GỘP LỆNH

### ❌ TRÁNH - Gộp nhiều lệnh phức tạp

```powershell
# ❌ KHÔNG nên - quá nhiều lệnh gộp chung
git add .; git commit -m "fix"; git push; npm run build; npm start

# ❌ KHÔNG nên - lệnh phức tạp với nhiều parameters
Get-ChildItem -Recurse -Filter "*.js" | Select-String "error" | ForEach-Object { Write-Host $_.Line }
```

### ✅ KHUYẾN KHÍCH - Chia nhỏ thành từng bước

```powershell
# ✅ Tốt - Chia nhỏ thành từng bước
# Bước 1: Add files
git add .

# Bước 2: Commit changes
git commit -m "fix: resolve issues"

# Bước 3: Push to remote
git push

# Bước 4: Build project
npm run build

# Bước 5: Start application
npm start
```

### Khi nào được phép gộp lệnh

#### ✅ Chỉ gộp khi:
- Lệnh đơn giản, ít parameters
- Đã test riêng từng lệnh
- Có mối quan hệ logic rõ ràng
- Không có special characters phức tạp

#### ✅ Ví dụ gộp lệnh AN TOÀN:
```powershell
# OK - lệnh đơn giản
git status; git log --oneline -5

# OK - có mối quan hệ logic
cd "C:\project"; Get-ChildItem

# OK - đã test riêng
npm install; npm run build
```

## 3. XỬ LÝ KHI BỊ KẸT TERMINAL

### 🚨 Khi terminal bị kẹt trong pager/editor

#### Cách thoát khỏi pager (less/more)
```powershell
q                          # Thoát khỏi less/more
Ctrl+C                     # Thoát khỏi pager
Ctrl+Z                     # Suspend process
```

#### Cách thoát khỏi Vim
```powershell
:q!                        # Thoát không lưu
:wq                        # Lưu và thoát
ESC + :q!                  # Thoát không lưu
```

#### Cách thoát khỏi Nano
```powershell
Ctrl+X                     # Thoát Nano
```

### 🔧 Cách tránh bị kẹt

```powershell
# Luôn sử dụng --no-pager cho git commands
git log --oneline -10 --no-pager
git diff --no-pager
git show --no-pager
git status --porcelain

# Sử dụng PowerShell commands thay vì Unix
Get-Content file.txt       # Thay vì cat
Select-String pattern      # Thay vì grep
Get-ChildItem              # Thay vì ls
```

## 4. QUY TẮC ƯU TIÊN

### 🥇 Ưu tiên 1: Chạy từng dòng lệnh riêng biệt
### 🥈 Ưu tiên 2: Gộp tối đa 2-3 lệnh đơn giản
### 🥉 Ưu tiên 3: Gộp nhiều lệnh (chỉ khi thực sự cần thiết)

## 5. ERROR HANDLING

### Error Prevention
```powershell
# Check if command exists before running
if (Get-Command "command" -ErrorAction SilentlyContinue) {
    command
} else {
    Write-Warning "Command not found"
}

# Use try-catch for risky operations
try {
    Remove-Item "file.txt" -Force
} catch {
    Write-Warning "Failed to remove file: $($_.Exception.Message)"
}

# Check exit codes
if ($LASTEXITCODE -ne 0) {
    Write-Error "Command failed with exit code $LASTEXITCODE"
}
```

### Safe Command Execution
```powershell
# Use -ErrorAction SilentlyContinue for commands that might fail
Get-Content "nonexistent.txt" -ErrorAction SilentlyContinue

# Use -WhatIf for destructive operations
Remove-Item "file.txt" -WhatIf

# Use -Confirm for interactive confirmation
Remove-Item "file.txt" -Confirm
```

## 6. BEST PRACTICES

### Command Safety
- **Always use --no-pager** for git commands
- **Test commands individually** before combining
- **Use PowerShell equivalents** instead of Unix commands
- **Quote paths with spaces** to avoid parsing errors
- **Use Windows path separators** (\ instead of /)

### Performance
- **Avoid unnecessary operations** in loops
- **Use specific commands** instead of generic ones
- **Cache results** when possible
- **Use pipeline** for data processing

### Readability
- **Use descriptive variable names**
- **Add comments** for complex operations
- **Break long commands** into multiple lines
- **Use consistent formatting**

## 7. DOCKER COMMANDS SAFETY

### Docker Compose với Sleep (BẮT BUỘC)
```powershell
# ✅ AN TOÀN - Docker Compose với sleep
docker-compose up -d; Start-Sleep -Seconds 20
docker-compose restart; Start-Sleep -Seconds 20
docker-compose down; docker-compose up -d; Start-Sleep -Seconds 20

# ❌ NGUY HIỂM - Docker Compose không có sleep (gây timeout)
docker-compose up
docker-compose up -d
docker-compose restart
docker-compose down
```

### Why Sleep is Required
- **Docker Compose** mất thời gian khởi động services
- **Tool agent** có thể timeout nếu không đợi đủ lâu
- **Sleep 20s** đảm bảo services đã khởi động hoàn toàn
- **Background processes** cần thời gian để stabilize

## 8. TROUBLESHOOTING

### Common Issues
1. **Terminal stuck in pager**: Use --no-pager flag
2. **Command not found**: Check if command exists first
3. **Permission denied**: Use -Force flag or check permissions
4. **Path not found**: Quote paths with spaces
5. **Timeout issues**: Add sleep delays for long operations

### Recovery Commands
```powershell
# Kill stuck processes
Get-Process | Where-Object {$_.ProcessName -eq "less"} | Stop-Process -Force

# Reset terminal
Clear-Host

# Check running processes
Get-Process | Where-Object {$_.ProcessName -match "git|vim|nano"}

# Force kill all instances
Stop-Process -Name "git" -Force -ErrorAction SilentlyContinue
```

## 9. SECURITY CONSIDERATIONS

### Safe File Operations
```powershell
# Check file exists before operations
if (Test-Path "file.txt") {
    Get-Content "file.txt"
}

# Use -WhatIf for destructive operations
Remove-Item "*.tmp" -WhatIf

# Backup before destructive operations
Copy-Item "file.txt" "file.txt.backup"
Remove-Item "file.txt"
```

### Input Validation
```powershell
# Validate file paths
if (Test-Path $filePath) {
    # Safe to proceed
} else {
    Write-Error "File not found: $filePath"
}

# Validate command parameters
if ($param -match "^[a-zA-Z0-9_-]+$") {
    # Safe parameter
} else {
    Write-Error "Invalid parameter format"
}
```

---

**Lưu ý**: Terminal safety standards này đảm bảo terminal luôn responsive và tránh các tình huống gây kẹt trong DocGO development workflow.