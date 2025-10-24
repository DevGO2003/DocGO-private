# File Creation Examples

## Mục đích
File này demo cách sử dụng rule `08_file-creation-standards.mdc` để tạo file đúng vị trí trong cấu trúc `.cursor`.

## 📁 Cấu trúc thư mục .cursor hiện tại

```
.cursor/
├── commands/                    # 24 commands
│   ├── README.md               # Danh sách commands
│   ├── docker-*.md             # Docker commands
│   ├── git-*.md               # Git commands
│   └── *.md                    # Other commands
├── documents/                   # Tài liệu và showcase
│   ├── api-docs/               # API documentation samples
│   ├── samples/                # File mẫu (như file này)
│   └── architecture/           # Kiến trúc documents
├── plans/                      # Kế hoạch và roadmap
│   └── EVENT-ARCHITECTURE-V3.md
├── rules/                      # 8 rules (.mdc files)
│   ├── 00_project-architecture-overview.mdc
│   ├── 01_api-*.mdc            # API standards
│   ├── 02_*.mdc                # Event/Exception standards
│   ├── 03_*.mdc                # Service standards
│   ├── 05_*.mdc                # Utility standards
│   └── 08_file-creation-standards.mdc
├── screenshots/                # Screenshots và images
├── tools/                      # Tool configurations
│   ├── discord/               # Discord MCP config
│   └── github/                # GitHub MCP config
├── mcp.json                    # MCP server configuration
└── worktrees.json              # Git worktrees config
```

## 🎯 Ví dụ tạo file theo rule

### 1. **Tạo Command mới**
```bash
# Tạo command docker-restart
.cursor/commands/docker-restart.md

# Nội dung:
---
command: docker-restart
description: Restart Docker services với auto-recovery
usage: /cursor-todo docker-restart [service-name]
examples: 
  - /cursor-todo docker-restart
  - /cursor-todo docker-restart repository-management-service
---
```

### 2. **Tạo Document mới**
```bash
# Tạo API documentation sample
.cursor/documents/api-docs/user-service-api-v2.json

# Nội dung:
{
  "title": "User Service API v2",
  "version": "2.0.0",
  "description": "API documentation for User Management Service",
  "endpoints": [...]
}
```

### 3. **Tạo Plan mới**
```bash
# Tạo roadmap 2025
.cursor/plans/ROADMAP-2025.md

# Nội dung:
---
title: DocGO Roadmap 2025
version: 1.0.0
status: planning
timeline: Q1-Q4 2025
---
```

### 4. **Tạo Rule mới**
```bash
# Tạo rule testing standards
.cursor/rules/09_testing-standards.mdc

# Nội dung:
---
alwaysApply: true
**/*.java, **/*.py, **/*.ts, **/*.tsx
---
# Testing Standards
...
```

## 📋 Checklist tạo file

### ✅ Trước khi tạo file
- [ ] Xác định đúng loại file (command/document/plan/rule)
- [ ] Kiểm tra file đã tồn tại
- [ ] Chọn tên file phù hợp
- [ ] Xác định vị trí trong cấu trúc

### ✅ Khi tạo file
- [ ] Thêm metadata header
- [ ] Viết nội dung đầy đủ
- [ ] Bao gồm examples/usage
- [ ] Kiểm tra format đúng

### ✅ Sau khi tạo file
- [ ] Cập nhật index files
- [ ] Test file hoạt động
- [ ] Commit changes
- [ ] Document trong README

## 🚀 Quy trình thực tế

### 1. **Tạo Command mới**
```bash
# Bước 1: Xác định loại file
# -> Command (chat utility)

# Bước 2: Chọn tên file
# -> docker-restart.md

# Bước 3: Xác định vị trí
# -> .cursor/commands/docker-restart.md

# Bước 4: Tạo file với metadata
# -> Header với command info

# Bước 5: Cập nhật index
# -> .cursor/commands/README.md
```

### 2. **Tạo Document mới**
```bash
# Bước 1: Xác định loại file
# -> Document (showcase)

# Bước 2: Chọn tên file
# -> api-sample-v3.json

# Bước 3: Xác định vị trí
# -> .cursor/documents/api-docs/api-sample-v3.json

# Bước 4: Tạo file với metadata
# -> Header với document info

# Bước 5: Cập nhật index
# -> .cursor/documents/README.md
```

### 3. **Tạo Rule mới**
```bash
# Bước 1: Xác định loại file
# -> Rule (standards)

# Bước 2: Chọn tên file
# -> 09_testing-standards.mdc

# Bước 3: Xác định vị trí
# -> .cursor/rules/09_testing-standards.mdc

# Bước 4: Tạo file với metadata
# -> Header với alwaysApply và globs

# Bước 5: Cập nhật index
# -> .cursor/rules/00_project-architecture-overview.mdc
```

## 🔧 Tools hỗ trợ

### 1. **File Creation Script**
```bash
# Tạo command mới
./scripts/create-command.sh docker-restart

# Tạo document mới
./scripts/create-document.sh api-docs user-api-v2.json

# Tạo rule mới
./scripts/create-rule.sh 09 testing-standards
```

### 2. **Validation Script**
```bash
# Kiểm tra cấu trúc
./scripts/validate-structure.sh

# Kiểm tra naming
./scripts/validate-naming.sh

# Kiểm tra references
./scripts/validate-references.sh
```

### 3. **Index Update Script**
```bash
# Cập nhật commands index
./scripts/update-commands-index.sh

# Cập nhật rules index
./scripts/update-rules-index.sh

# Cập nhật plans index
./scripts/update-plans-index.sh
```

## 📊 Thống kê hiện tại

### Commands (24 files)
- Docker: 3 commands
- Git: 4 commands
- Development: 4 commands
- Web: 2 commands
- Database: 1 command
- Reporting: 1 command
- Task Management: 1 command
- Discord: 3 commands
- System: 3 commands

### Rules (8 files)
- Overview: 1 rule
- API Standards: 3 rules
- Event/Exception: 1 rule
- Service Standards: 1 rule
- Utility Standards: 2 rules

### Documents (1 file)
- API Docs: 1 sample
- Samples: 1 file (this file)

### Plans (1 file)
- Architecture: 1 plan

### Screenshots (10 files)
- Page screenshots: 10 images

### Tools (2 folders)
- Discord: 1 tool
- GitHub: 1 tool

## 🎯 Best Practices

### 1. **Naming Convention**
- **Commands**: `{action}-{target}.md` (docker-logs.md)
- **Documents**: `{type}-{name}-{version}.{ext}` (api-sample-v3.json)
- **Plans**: `{TYPE}-{VERSION}.md` (EVENT-ARCHITECTURE-V3.md)
- **Rules**: `{number}_{purpose}.mdc` (08_file-creation-standards.mdc)

### 2. **File Organization**
- Phân loại theo chức năng
- Sử dụng subfolders khi cần
- Giữ cấu trúc flat khi có thể
- Tránh nested quá sâu

### 3. **Content Standards**
- Luôn có header với metadata
- Bao gồm examples và usage
- Cập nhật index files
- Test file hoạt động

### 4. **Maintenance**
- Review định kỳ
- Xóa file không cần thiết
- Cập nhật references
- Backup quan trọng

---

**Lưu ý**: File này được tạo theo rule `08_file-creation-standards.mdc` để demo cách sử dụng. Khi tạo file mới, hãy tham khảo rule này để đảm bảo tính nhất quán.
