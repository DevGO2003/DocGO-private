---
id: "rule-cursor-cleanup"
trigger: model_decision
description:
  This rule establishes comprehensive .cursor folder cleanup standards for DocGO development workflow including cache management, log file cleanup, and artifact removal procedures.
  It ensures efficient development environment maintenance by automatically detecting and removing unnecessary .cursor files, cache directories, and temporary artifacts.
  The rule covers cleanup procedures, artifact detection, workspace optimization, and systematic maintenance to maintain optimal development environment performance.
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
  - cursor
  - cleanup
  - backup
  - scripts
  - temp
  - workspace
  - maintenance
---

# Cursor Workspace Cleanup cho DocGO

## Mục tiêu
- Quản lý file rác trong thư mục `.cursor`
- Tự động cleanup backup files, scripts tạm
- Duy trì workspace sạch sẽ và hiệu quả
- Ngăn chặn tích lũy file không cần thiết

## 1. Các loại file cần cleanup

### Backup Files
```
.cursor/backup/
├── env/
│   ├── 08-38-30-09-2025/
│   ├── 10-27-05-10-2025/
│   ├── 10-51-09-10-2025/
│   ├── 14-15-05-10-2025/
│   └── latest/
└── metadata.json
```

**Quy tắc**: Chỉ giữ lại `latest/`, xóa các backup cũ hơn 7 ngày

### Scripts tạm
```
.cursor/scripts/
├── reusable/
│   └── user-management-service-debug.ps1
└── temp/
    └── [các file tạm]
```

**Quy tắc**: 
- Giữ lại `reusable/` nếu có documentation
- Xóa `temp/` sau mỗi session
- Xóa scripts không có documentation

### Command Files
```
.cursor/workflows/
├── ask.md
├── browser.md
├── chrome.md
├── cursor-todo.md
├── delete-all-scripts.md
├── discord-*.md
├── docker-*.md
├── git-*.md
├── health.md
├── make-report.md
├── mongo.md
├── send-discord-message.md
├── setup-windsurf.md
└── summarize-chat.md
```

**Quy tắc**: 
- Giữ lại commands có documentation rõ ràng
- Xóa commands tạm hoặc không sử dụng
- Chỉ giữ commands thường xuyên sử dụng

### Plan Files
```
.cursor/plans/
├── split--8c53077d.plan.md
├── upload-file-get-one-enhanced-6332af1c.plan.md
└── [các plan files khác]
```

**Quy tắc**: 
- Xóa plan files sau khi hoàn thành
- Chỉ giữ lại plans đang active
- Archive completed plans nếu cần

### Document Files
```
.cursor/documents/
├── api-docs/
│   ├── contract-analysis-example.json
│   ├── document-management-sample.json
│   └── document-management-schema.json
└── architecture/
    └── sequence-kafka-mongodb.md
```

**Quy tắc**: 
- Giữ lại documents có giá trị tham khảo
- Xóa example files tạm
- Chỉ giữ documents chính thức

### Screenshot Files
```
.cursor/screenshots/
└── [các file ảnh tạm]
```

**Quy tắc**: 
- Xóa screenshots cũ hơn 1 ngày
- Chỉ giữ screenshots quan trọng
- Compress screenshots nếu cần

## 2. Cleanup Workflow

### Automatic Cleanup
```powershell
# Cleanup backup files (giữ lại latest, xóa cũ hơn 7 ngày)
Get-ChildItem ".cursor/backup/env/" -Directory | 
Where-Object { $_.Name -ne "latest" -and $_.CreationTime -lt (Get-Date).AddDays(-7) } | 
Remove-Item -Recurse -Force

# Cleanup temp scripts
Remove-Item ".cursor/scripts/temp/*" -Recurse -Force -ErrorAction SilentlyContinue

# Cleanup old screenshots
Get-ChildItem ".cursor/screenshots/" -File | 
Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-1) } | 
Remove-Item -Force
```

### Manual Cleanup
```powershell
# Cleanup completed plans
Get-ChildItem ".cursor/plans/*.plan.md" | 
Where-Object { $_.Name -match "completed|done|finished" } | 
Remove-Item -Force

# Cleanup unused commands
Get-ChildItem ".cursor/workflows/*.md" | 
Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
Remove-Item -Force
```

## 3. File Retention Rules

### Backup Files
- **Latest**: Giữ lại vĩnh viễn
- **Daily backups**: Giữ lại 7 ngày
- **Weekly backups**: Giữ lại 4 tuần
- **Monthly backups**: Giữ lại 3 tháng

### Scripts
- **Reusable scripts**: Giữ lại nếu có documentation
- **Temp scripts**: Xóa sau mỗi session
- **Debug scripts**: Xóa sau khi debug xong
- **Test scripts**: Xóa sau khi test xong

### Commands
- **Frequently used**: Giữ lại vĩnh viễn
- **Occasionally used**: Giữ lại 30 ngày
- **Rarely used**: Giữ lại 7 ngày
- **Unused**: Xóa ngay lập tức

### Plans
- **Active plans**: Giữ lại
- **Completed plans**: Xóa sau 1 ngày
- **Cancelled plans**: Xóa ngay lập tức

## 4. Cleanup Commands

### Daily Cleanup
```powershell
# Daily cleanup script
Write-Host "Starting daily .cursor cleanup..."

# Cleanup temp files
Remove-Item ".cursor/scripts/temp/*" -Recurse -Force -ErrorAction SilentlyContinue

# Cleanup old screenshots
Get-ChildItem ".cursor/screenshots/" -File -ErrorAction SilentlyContinue | 
Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-1) } | 
Remove-Item -Force

# Cleanup completed plans
Get-ChildItem ".cursor/plans/*.plan.md" -ErrorAction SilentlyContinue | 
Where-Object { $_.Name -match "completed|done|finished" } | 
Remove-Item -Force

Write-Host "Daily cleanup completed."
```

### Weekly Cleanup
```powershell
# Weekly cleanup script
Write-Host "Starting weekly .cursor cleanup..."

# Cleanup old backups
Get-ChildItem ".cursor/backup/env/" -Directory -ErrorAction SilentlyContinue | 
Where-Object { $_.Name -ne "latest" -and $_.CreationTime -lt (Get-Date).AddDays(-7) } | 
Remove-Item -Recurse -Force

# Cleanup unused commands
Get-ChildItem ".cursor/workflows/*.md" -ErrorAction SilentlyContinue | 
Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-30) } | 
Remove-Item -Force

Write-Host "Weekly cleanup completed."
```

## 5. File Organization

### Recommended Structure
```
.cursor/
├── backup/
│   └── latest/          # Chỉ giữ latest backup
├── workflows/
│   ├── git/             # Git commands
│   ├── docker/          # Docker commands
│   ├── discord/         # Discord commands
│   └── common/          # Common commands
├── documents/
│   ├── api-docs/        # API documentation
│   └── architecture/    # Architecture docs
├── rules/               # Cursor rules
├── scripts/
│   └── reusable/        # Reusable scripts
└── tools/               # Tool configurations
```

### File Naming Conventions
- **Commands**: `action-description.md` (e.g., `git-commit.md`)
- **Plans**: `feature-description-{hash}.plan.md`
- **Scripts**: `service-action.ps1` (e.g., `user-service-debug.ps1`)
- **Documents**: `category-description.md`

## 6. Monitoring và Alerts

### File Size Monitoring
```powershell
# Check .cursor folder size
$cursorSize = (Get-ChildItem ".cursor/" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host ".cursor folder size: $cursorSize MB"

# Alert if size > 100MB
if ($cursorSize -gt 100) {
    Write-Warning ".cursor folder size exceeds 100MB. Consider cleanup."
}
```

### File Count Monitoring
```powershell
# Count files in .cursor
$fileCount = (Get-ChildItem ".cursor/" -Recurse -File).Count
Write-Host "Total files in .cursor: $fileCount"

# Alert if count > 1000
if ($fileCount -gt 1000) {
    Write-Warning "Too many files in .cursor. Consider cleanup."
}
```

## 7. Best Practices

### Do's
- **Regular cleanup**: Chạy cleanup hàng ngày/tuần
- **Monitor size**: Theo dõi kích thước thư mục
- **Keep organized**: Duy trì cấu trúc thư mục rõ ràng
- **Document scripts**: Viết documentation cho scripts
- **Archive important**: Lưu trữ files quan trọng

### Don'ts
- **Don't accumulate**: Không để tích lũy file rác
- **Don't delete important**: Không xóa files quan trọng
- **Don't ignore size**: Không bỏ qua kích thước thư mục
- **Don't skip cleanup**: Không bỏ qua cleanup định kỳ

## 8. Integration với Git

### .gitignore cho .cursor
```gitignore
# Cursor workspace files
.cursor/backup/
.cursor/scripts/temp/
.cursor/workflows/*.md
.cursor/plans/*.plan.md
.cursor/prompts/*.md
.cursor/screenshots/
.cursor/documents/
```

### Keep in Git
```gitignore
# Keep important cursor files
!.cursor/rules/
!.cursor/mcp.json
!.cursor/tools/
!.cursor/scripts/reusable/
```

---

**Lưu ý**: Cursor cleanup rules này đảm bảo workspace luôn sạch sẽ và hiệu quả trong DocGO development workflow.