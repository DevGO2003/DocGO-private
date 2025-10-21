---
id: "rule-terminal-basics"
trigger: model_decision
description: Quy tắc chuẩn hóa PowerShell command mapping và terminal operations cho DocGO development workflow bao gồm file operations, Docker commands với sleep delays, và environment variable management. Đảm bảo consistent command usage across Windows PowerShell environment, proper Docker compose execution với timeout prevention, và reliable file system operations. Quy tắc bao gồm Unix to PowerShell command translation, path handling, special character escaping, và comprehensive error handling để duy trì robust terminal operations.
globs:
  - "**/*.java"
  - "**/*.py"
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
  - "**/*.json"
  - "**/*.yaml"
  - "**/*.yml"
  - "**/*.xml"
  - "**/*.md"
  - "**/*.txt"
  - "**/*.html"
  - "**/src/**/*.*"
  - "**/config/**/*.*"
  - "**/scripts/**/*.*"
tags:
  - terminal
  - powershell
  - commands
  - docker
  - file-operations
  - environment
  - windows
  - unix
---

# Terminal Commands Standards cho DocGO

## Mục tiêu
- Chuẩn hóa PowerShell commands thay vì Unix commands
- Đồng nhất file operations và text processing
- Tối ưu hóa Docker commands với sleep delay
- Đảm bảo compatibility với Windows environment

## 1. Quy tắc bắt buộc

### PowerShell Priority
- **Sử dụng PowerShell commands** thay vì Unix commands
- **Hạn chế sử dụng PowerShell** tối đa có thể
- **Chỉ chạy lệnh** khi thực sự cần thiết
- **Luôn thêm `--no-pager`** cho git commands

## 2. Commands Mapping

### File Operations
| Unix Command | PowerShell Equivalent | Ghi chú |
|--------------|----------------------|---------|
| `ls -la` | `Get-ChildItem -Force` | Hiển thị tất cả files kể cả hidden |
| `cat file.txt` | `Get-Content file.txt` | Đọc nội dung file |
| `head -n 10` | `Get-Content file.txt -TotalCount 10` | Lấy 10 dòng đầu |
| `tail -f` | `Get-Content log.txt -Wait` | Theo dõi file real-time |
| `find . -name "*.js"` | `Get-ChildItem -Recurse -Filter "*.js"` | Tìm files theo pattern |

### Text Processing
| Unix Command | PowerShell Equivalent | Ghi chú |
|--------------|----------------------|---------|
| `grep "error"` | `Select-String "error"` | Tìm kiếm text |
| `grep -r "pattern"` | `Select-String "pattern" -Recurse` | Tìm kiếm recursive |
| `wc -l` | `(Get-Content file.txt).Count` | Đếm số dòng |
| `sort` | `Get-Content file.txt \| Sort-Object` | Sắp xếp dòng |
| `uniq` | `Get-Content file.txt \| Sort-Object \| Get-Unique` | Loại bỏ duplicate |

### Git Commands
| Unix Command | PowerShell Equivalent | Ghi chú |
|--------------|----------------------|---------|
| `git log` | `git log --oneline -10 --no-pager` | Xem log không mở pager |
| `git diff` | `git diff --no-pager` | Xem diff không mở pager |
| `git status` | `git status --porcelain` | Xem status không mở pager |
| `git show` | `git show --no-pager` | Xem show không mở pager |
| `git blame` | `git blame --no-pager` | Xem blame không mở pager |

## 3. Path và Spaces Handling

### Path Quoting
```powershell
# Escape spaces trong path
"file with spaces.txt"

# Dùng quotes cho path
"C:\path with spaces"

# Relative paths
".\backend\user-management-service"
```

### Special Characters
```powershell
# Escape quotes
git commit -m "fix: update code with `"quotes`""

# Handle parentheses
git add "file with `(parentheses`).txt"

# Path separators
"C:\path\to\file"  # Windows style
```

## 4. Environment Variables

### Environment Variable Access
```powershell
# Unix: echo $HOME
Write-Host $env:HOME

# Unix: echo $PATH
Write-Host $env:PATH

# Set environment variable
$env:MY_VAR = "value"

# Check if variable exists
if ($env:MY_VAR) { Write-Host "Variable exists" }
```

### Common Environment Variables
```powershell
# System paths
$env:USERPROFILE
$env:APPDATA
$env:PROGRAMFILES
$env:TEMP

# Project specific
$env:NODE_ENV
$env:DATABASE_URL
$env:API_BASE_URL
```

## 5. Command Chaining

### PowerShell Operators
```powershell
# Sequential execution
command1; command2

# Pipeline
command1 | command2

# Conditional execution
command1 && command2  # Not supported, use if statement
if (command1) { command2 }

# Background execution
Start-Job -ScriptBlock { command }
```

### Examples
```powershell
# Build and start
npm run build; npm start

# Check status and log
git status; git log --oneline -5

# Conditional execution
if (Test-Path "file.txt") { Get-Content "file.txt" }
```

## 6. Docker Commands

### Docker with Sleep Delay (BẮT BUỘC)
```powershell
# Start services with sleep
docker-compose up -d; Start-Sleep -Seconds 20

# Restart with sleep
docker-compose restart; Start-Sleep -Seconds 20

# Rebuild with sleep
docker-compose up --build -d; Start-Sleep -Seconds 30

# Stop and start with sleep
docker-compose down; docker-compose up -d; Start-Sleep -Seconds 20
```

### Docker Commands Mapping
```powershell
# Unix: $(pwd)
${PWD}

# Volume mount example
docker run -v ${PWD}:/app -p 8000:8000 service

# Check running containers
docker ps

# Check container logs
docker-compose logs -f service-name

# Execute command in container
docker-compose exec service-name /bin/bash
```

### Why Sleep is Required
- **Docker Compose** mất thời gian khởi động services
- **Tool agent** có thể timeout nếu không đợi đủ lâu
- **Sleep 20s** đảm bảo services đã khởi động hoàn toàn
- **Background processes** cần thời gian để stabilize

## 7. File Operations

### Reading Files
```powershell
# Read entire file
Get-Content "file.txt"

# Read first 10 lines
Get-Content "file.txt" -TotalCount 10

# Read last 10 lines
Get-Content "file.txt" -Tail 10

# Read with encoding
Get-Content "file.txt" -Encoding UTF8

# Read as raw bytes
Get-Content "file.bin" -AsByteStream
```

### Writing Files
```powershell
# Write text to file
"Hello World" | Out-File "output.txt"

# Append to file
"New line" | Add-Content "output.txt"

# Write with encoding
"Content" | Out-File "output.txt" -Encoding UTF8

# Write multiple lines
@("Line 1", "Line 2", "Line 3") | Out-File "output.txt"
```

### File Management
```powershell
# Copy file
Copy-Item "source.txt" "destination.txt"

# Move file
Move-Item "source.txt" "destination.txt"

# Delete file
Remove-Item "file.txt"

# Create directory
New-Item -ItemType Directory -Path "newdir"

# Check if file exists
Test-Path "file.txt"
```

## 8. Text Processing

### Search and Replace
```powershell
# Search in file
Select-String "pattern" "file.txt"

# Search in multiple files
Select-String "pattern" "*.txt"

# Search with context
Select-String "pattern" "file.txt" -Context 2

# Case insensitive search
Select-String "pattern" "file.txt" -CaseSensitive:$false
```

### Text Manipulation
```powershell
# Split text
"a,b,c" -split ","

# Join text
@("a", "b", "c") -join ","

# Replace text
"Hello World" -replace "World", "PowerShell"

# Trim whitespace
"  text  ".Trim()
```

## 9. Process Management

### Process Operations
```powershell
# List processes
Get-Process

# Find specific process
Get-Process -Name "node"

# Kill process
Stop-Process -Name "node" -Force

# Kill process by ID
Stop-Process -Id 1234 -Force

# Start process
Start-Process "notepad.exe"
```

### Service Management
```powershell
# List services
Get-Service

# Start service
Start-Service "ServiceName"

# Stop service
Stop-Service "ServiceName"

# Restart service
Restart-Service "ServiceName"
```

## 10. Error Handling

### Error Prevention
```powershell
# Check if command exists
Get-Command "command" -ErrorAction SilentlyContinue

# Suppress errors
command -ErrorAction SilentlyContinue

# Continue on error
try { command } catch { Write-Warning "Command failed" }

# Check exit code
if ($LASTEXITCODE -eq 0) { Write-Host "Success" }
```

### Common Error Scenarios
```powershell
# File not found
if (Test-Path "file.txt") { Get-Content "file.txt" } else { Write-Warning "File not found" }

# Permission denied
try { Remove-Item "file.txt" } catch { Write-Warning "Permission denied" }

# Network timeout
try { Invoke-WebRequest "url" -TimeoutSec 30 } catch { Write-Warning "Request timeout" }
```

## 11. Best Practices

### Performance
- **Use specific commands** instead of generic ones
- **Avoid unnecessary operations** in loops
- **Use pipeline** for data processing
- **Cache results** when possible

### Readability
- **Use descriptive variable names**
- **Add comments** for complex operations
- **Break long commands** into multiple lines
- **Use consistent formatting**

### Reliability
- **Always check return codes**
- **Handle errors gracefully**
- **Validate inputs** before processing
- **Test commands** before using in scripts

---

**Lưu ý**: Terminal commands standards này đảm bảo tính nhất quán và compatibility với Windows PowerShell environment của DocGO.