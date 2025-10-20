---
id: "rule-environment-git"
alwaysApply: true
tags:
  - env
  - environment
  - secrets
  - git
  - gitignore
  - workflow
  - remotes
  - origin
  - private-remote
  - ci
  - cd
  - .env
  - .env.example
  - docker-compose
  - sleep-delay
  - powershell
  - windows
  - branching
  - commit
  - push
  - security
  - config
  - variables
  - production
  - development
  - staging
  - version-control
description: "Quy ước .env theo service, bảo mật secrets, chuẩn .gitignore, quản lý remotes public/private, và workflow đẩy code an toàn."
---
# Environment & Git Standards for DocGO

## Environment File Management
- Mỗi microservice có file `.env` riêng
- Automation Service: HOST, PORT, GEMINI_API_KEY, KAFKA_*
- File Management Service: DATABASE_URL, KAFKA_*
- User Management Service: DATABASE_URL, KAFKA_*

- API Gateway: USER_MANAGEMENT_SERVICE_URL, FILE_MANAGEMENT_SERVICE_URL, AUTOMATION_SERVICE_URL
- Frontend: NEXT_PUBLIC_API_URL, NEXTAUTH_SECRET, NEXTAUTH_URL

## Docker Compose với .env
- Chỉnh sửa file `.env` của service tương ứng
- Mapping trong docker-compose: environment, env_file


## Quy tắc đặt tên
- `.env.example` (template cho team)
- `.env` (cho development, không commit)
- `.env.production` (không commit lên git)

## Workflow
1. Chỉnh sửa file `.env` của service tương ứng
2. Docker Compose tự động load environment
3. Commit `.env.example`, không commit `.env` chứa secrets  

## .env Files
- Mỗi microservice có `.env.example` (template, commit vào git)
- Developer tạo `.env` từ `.env.example`: `Copy-Item .env.example .env -Force`
- Python: dùng python-dotenv, Java: env override properties

## .gitignore
- KHÔNG commit: `.env`, `__pycache__/`, `target/`, `node_modules/`, `*.log`, `.DS_Store`
- Python: `__pycache__/`, `venv/`, `.pytest_cache/`
- Java: `target/`, `*.class`, `.gradle/`
- Node.js: `node_modules/`, `.next/`, `.env.local`
- **KIỂM TRA** `.gitignore` trước mỗi commit để đảm bảo không có file nhạy cảm
- **SỬ DỤNG** `.gitignore` global cho workspace nếu cần thiết

## Git Remote
- `origin`: public repo (code nguồn, không chứa secrets)
- `private`: private repo (API keys, database credentials, file nhạy cảm)
- Thêm remote: `git remote add private https://github.com/DevGO2003/DocGO-private.git`

## Push Workflow
- Code công khai: `git push origin main` → `git push private main`
- Code nhạy cảm: chỉ `git push private main`

- Kiểm tra trạng thái remote trước khi push để tránh conflict

---

# PowerShell Terminal Commands

## Quy tắc bắt buộc
- Sử dụng PowerShell commands thay vì Unix commands
- Hạn chế sử dụng PowerShell tối đa có thể
- Chỉ chạy lệnh khi thực sự cần thiết

## Commands
- Unix: `ls -la` → PowerShell: `Get-ChildItem -Force`
- Unix: `cat file.txt` → PowerShell: `Get-Content file.txt`
- Unix: `grep pattern` → PowerShell: `Select-String pattern`
- Git: luôn thêm `--no-pager` để tránh kẹt

## Path và Spaces
- Escape spaces: `"file with spaces.txt"`
- Dùng quotes cho path: `"C:\path with spaces"`

## Environment Variables
- Unix: `echo $HOME` → PowerShell: `Write-Host $env:HOME`
- Unix: `echo $PATH` → PowerShell: `Write-Host $env:PATH`

## Command Chaining
- Unix: `&&` → PowerShell: `;` hoặc `|`
- Ví dụ: `npm run build; npm start`

## Special Characters
- Escape quotes: `git commit -m "fix: update code with `"quotes`""`
- Path separators: dùng `\` thay vì `/`
## File Operations
- Unix: `cat config.json` → PowerShell: `Get-Content config.json`
- Unix: `head -n 10` → PowerShell: `Get-Content file.txt -TotalCount 10`
- Unix: `tail -f` → PowerShell: `Get-Content log.txt -Wait`

## Text Processing
- Unix: `grep "error"` → PowerShell: `Select-String "error"`
- Unix: `grep -r "pattern"` → PowerShell: `Select-String "pattern" -Recurse`

## Git Commands
- Escape special characters: `git log --grep="fix: bug `(critical`)"`
- Handle parentheses: `git add "file with `(parentheses`).txt"`

## Docker Commands
- Unix: `$(pwd)` → PowerShell: `${PWD}`
- Ví dụ: `docker run -v ${PWD}:/app -p 8000:8000 service`

## Docker Compose - BẮT BUỘC có Sleep
- LUÔN có sleep 20s để tránh timeout
- Ví dụ: `docker-compose up -d; Start-Sleep -Seconds 20`

## Lý do bắt buộc có sleep
- Docker Compose mất thời gian khởi động services
- Tool agent có thể timeout nếu không đợi đủ lâu
- Sleep 20s đảm bảo services đã khởi động hoàn toàn

## Pipeline Commands
- Dùng Write-Output hoặc gán biến trực tiếp
- Tránh dùng cat (alias Get-Content) để nhận output

##### Cách 1: In thẳng ra
```powershell
git rev-parse --abbrev-ref HEAD | Write-Output
```

##### Cách 2: Lưu vào biến rồi in
```powershell
$branch = git rev-parse --abbrev-ref HEAD
Write-Output $branch
```

## Quy tắc đặc biệt

### PowerShell Execution Policy
- Luôn kiểm tra execution policy trước khi chạy scripts
- Sử dụng `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser` nếu cần

### Vị trí thư mục scripts trong dự án
- Scripts tái sử dụng: đặt tại `.cursor/scripts/reusable/` (được track)
- Scripts tạm thời: đặt tại `.cursor/scripts/temp/` (được ignore bởi `.cursorignore`)
- Khi tham chiếu đường dẫn script trong lệnh, luôn dùng đường dẫn đầy đủ từ gốc repo, ví dụ:
```powershell
powershell -ExecutionPolicy Bypass -File .cursor/scripts/reusable/my-script.ps1
```

### Long Commands
- Sử dụng backtick ` để xuống dòng trong PowerShell
- Ví dụ:
```powershell
git log --oneline --since="yesterday 00:00:00 +0700" `
        --until="today 00:00:00 +0700" `
        --stat --pretty=format:"%h - %an, %ad : %s"
```

### Error Handling
- Luôn sử dụng `-ErrorAction SilentlyContinue` cho commands có thể fail
- Ví dụ:
```powershell
Remove-Item "temp.txt" -ErrorAction SilentlyContinue
```

## Mapping Commands Chuẩn

| Unix Command | PowerShell Equivalent | Ghi chú |
|--------------|----------------------|---------|
| `ls -la` | `Get-ChildItem -Force` | Hiển thị tất cả files kể cả hidden |
| `cat file.txt` | `Get-Content file.txt` | Đọc nội dung file |
| `grep pattern` | `Select-String pattern` | Tìm kiếm text |
| `find . -name "*.js"` | `Get-ChildItem -Recurse -Filter "*.js"` | Tìm files theo pattern |
| `head -n 10` | `Get-Content -TotalCount 10` | Lấy 10 dòng đầu |
| `tail -f` | `Get-Content -Wait` | Theo dõi file real-time |
| `chmod +x` | `icacls file /grant Everyone:F` | Cấp quyền execute |
| `which command` | `Get-Command command` | Tìm đường dẫn command |
| `ps aux` | `Get-Process` | Liệt kê processes |
| `kill -9 PID` | `Stop-Process -Id PID -Force` | Dừng process |
| `git log` | `git log --oneline -10 --no-pager` | Xem log không mở pager |
| `git diff` | `git diff --no-pager` | Xem diff không mở pager |
| `git status` | `git status --porcelain` | Xem status không mở pager |
| `git show` | `git show --no-pager` | Xem show không mở pager |
| `git blame` | `git blame --no-pager` | Xem blame không mở pager |
| `cat file.txt` | `Get-Content file.txt` | Đọc file không mở pager |
| `less file.txt` | `Get-Content file.txt` | Đọc file không mở pager |
| `more file.txt` | `Get-Content file.txt` | Đọc file không mở pager |

## Best Practices

### 1. Luôn test commands trước khi chạy trong AI agent
### 2. Sử dụng `-WhatIf` parameter khi có thể để preview
### 3. Quote tất cả paths và strings có special characters
### 4. Sử dụng `$env:VAR` cho environment variables
### 5. Dùng `;` thay vì `&&` cho command chaining
### 6. Escape quotes với backtick ` trong PowerShell
### 7. Sử dụng `Get-ChildItem` thay vì `ls`
### 8. Sử dụng `Select-String` thay vì `grep`
### 9. Sử dụng `Get-Content` thay vì `cat`
### 10. Luôn kiểm tra PowerShell execution policy
### 11. **🚨 QUAN TRỌNG: LUÔN thêm `Start-Sleep -Seconds 20` sau docker-compose commands**

## Quy tắc Command Execution

### 11. TRÁNH CÁC LỆNH GÂY KẸT TERMINAL

#### ❌ TUYỆT ĐỐI KHÔNG sử dụng các lệnh interactive:
```powershell
# KHÔNG BAO GIỜ - Các lệnh mở editor/pager
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
vim file.txt               # Mở Vim editor
nano file.txt              # Mở Nano editor
less file.txt              # Mở less pager
more file.txt              # Mở more pager
man command                # Mở manual pager
```

#### ✅ SỬ DỤNG các lệnh non-interactive:
```powershell
# ĐÚNG - Các lệnh không mở pager/editor
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
Get-Content file.txt
Select-String pattern file.txt
```

### 12. HẠN CHẾ GỘP LỆNH - Chạy từng dòng lệnh riêng biệt

#### ❌ TRÁNH - Gộp nhiều lệnh phức tạp:
```powershell
# KHÔNG nên - quá nhiều lệnh gộp chung
git add .; git commit -m "fix"; git push; npm run build; npm start

# KHÔNG nên - lệnh phức tạp với nhiều parameters
Get-ChildItem -Recurse -Filter "*.js" | Select-String "error" | ForEach-Object { Write-Host $_.Line }
```

#### ✅ KHUYẾN KHÍCH - Chia nhỏ thành từng bước:
```powershell
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

### 13. Khi nào được phép gộp lệnh

#### ✅ **Chỉ gộp khi:**
- Lệnh đơn giản, ít parameters
- Đã test riêng từng lệnh
- Có mối quan hệ logic rõ ràng
- Không có special characters phức tạp

#### ✅ **Ví dụ gộp lệnh AN TOÀN:**
```powershell
# OK - lệnh đơn giản
git status; git log --oneline -5

# OK - có mối quan hệ logic
cd "C:\project"; Get-ChildItem

# OK - đã test riêng
npm install; npm run build
```

### 14. XỬ LÝ KHI BỊ KẸT TERMINAL

#### 🚨 **Khi terminal bị kẹt trong pager/editor:**
```powershell
# Cách thoát khỏi pager (less/more)
q                          # Thoát khỏi less/more
Ctrl+C                     # Thoát khỏi pager
Ctrl+Z                     # Suspend process

# Cách thoát khỏi Vim
:q!                        # Thoát không lưu
:wq                        # Lưu và thoát
ESC + :q!                  # Thoát không lưu

# Cách thoát khỏi Nano
Ctrl+X                     # Thoát Nano
```

#### 🔧 **Cách tránh bị kẹt:**
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

#### ⚠️ **Các lệnh NGUY HIỂM - TUYỆT ĐỐI TRÁNH:**
```powershell
# KHÔNG BAO GIỜ chạy trong Cursor AI agent
git log                    # Mở pager
git diff                   # Mở pager  
git status                 # Mở pager
git add -p                 # Interactive mode
git rebase -i              # Mở editor
git commit                 # Mở editor
vim file.txt               # Mở Vim
nano file.txt              # Mở Nano
less file.txt              # Mở less
more file.txt              # Mở more
man command                # Mở manual
```

### 15. Quy tắc ưu tiên

#### 🥇 **Ưu tiên 1: Chạy từng dòng lệnh riêng biệt**
#### 🥈 **Ưu tiên 2: Gộp tối đa 2-3 lệnh đơn giản**
#### 🥉 **Ưu tiên 3: Gộp nhiều lệnh (chỉ khi thực sự cần thiết)**

## Lưu ý quan trọng

- **Cursor AI agent chạy trên Windows PowerShell** - không phải Unix shell
- **Tất cả terminal commands phải tuân thủ PowerShell syntax**
- **Không sử dụng Unix commands** - sẽ gây lỗi
- **Luôn quote paths có spaces** - tránh lỗi parsing
- **Sử dụng Windows path separators** - `\` thay vì `/`
- **🚨 TUYỆT ĐỐI TRÁNH các lệnh interactive** - sẽ gây kẹt terminal
- **Luôn sử dụng --no-pager** cho git commands
- **Ưu tiên PowerShell commands** thay vì Unix commands

## ⚠️ CẢNH BÁO QUAN TRỌNG

### 🚨 **CÁC LỆNH NGUY HIỂM - TUYỆT ĐỐI KHÔNG SỬ DỤNG:**
```powershell
# ❌ TUYỆT ĐỐI KHÔNG - Sẽ gây kẹt terminal
git log                    # Mở pager
git diff                   # Mở pager
git status                 # Mở pager
git show                   # Mở pager
git blame                  # Mở pager
git add -p                 # Interactive mode
git rebase -i              # Mở editor
git commit                 # Mở editor
vim file.txt               # Mở Vim
nano file.txt              # Mở Nano
less file.txt              # Mở less
more file.txt              # Mở more
man command                # Mở manual
```

### ✅ **CÁC LỆNH AN TOÀN - LUÔN SỬ DỤNG:**
```powershell
# ✅ AN TOÀN - Không gây kẹt terminal
git log --oneline -10 --no-pager
git diff --no-pager
git status --porcelain
git show --no-pager
git add -A
git commit -m "message" --no-verify
Get-Content file.txt
Select-String pattern file.txt
Get-ChildItem

# ✅ AN TOÀN - Docker Compose với sleep
docker-compose up -d; Start-Sleep -Seconds 20
docker-compose restart; Start-Sleep -Seconds 20
docker-compose down; docker-compose up -d; Start-Sleep -Seconds 20
```

### 🚨 **CÁC LỆNH NGUY HIỂM - TUYỆT ĐỐI KHÔNG SỬ DỤNG:**
```powershell
# ❌ TUYỆT ĐỐI KHÔNG - Docker Compose không có sleep (gây timeout)
docker-compose up
docker-compose up -d
docker-compose restart
docker-compose down
```

---

**Mục tiêu**: Đảm bảo 100% terminal commands chạy thành công trên Windows PowerShell environment của Cursor IDE mà không bị kẹt trong pager/editor.