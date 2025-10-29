---
alwaysApply: true
**/*.md, **/*.json, **/*.txt, **/*.yaml, **/*.yml, **/*.xml, **/*.py, **/*.java, **/*.ts, **/*.tsx, **/*.js, **/*.jsx

---
# Quy tắc tạo file và vị trí trong .windsurf

## Mục tiêu
- Hướng dẫn agent tạo file đúng vị trí trong cấu trúc `.windsurf`
- Phân loại file theo chức năng và mục đích sử dụng
- Đảm bảo tính nhất quán và dễ quản lý

## 📁 Cấu trúc thư mục .windsurf

```
.windsurf/
├── rules/               # Windsurf rules (.mdc files)
```

## 🎯 Quy tắc tạo file

### 1. **Rules** (`.windsurf/rules/`)
**Mục đích**: Windsurf rules và standards
**Định dạng**: `*.mdc`
**Cấu trúc**:
- `00_*.mdc` - Overview và architecture
- `01_*.mdc` - API standards
- `02_*.mdc` - Event/Exception standards
- `03_*.mdc` - Service standards
- `04_*.mdc` - Environment/Git standards
- `05_*.mdc` - Utility standards
- `06_*.mdc` - Chat utilities
- `07_*.mdc` - File creation rules
- `08_*.mdc` - Advanced rules

**Quy tắc**:
- Tên file theo format: `{NUMBER}_{PURPOSE}.mdc`
- Luôn có `alwaysApply: true/false`
- Bao gồm globs patterns
- Cập nhật `00_project-architecture-overview.mdc` khi thêm rule mới

## 🚀 Quy trình tạo file

### 1. **Xác định loại file**
```bash
# Rules (standards)
.windsurf/rules/{number}_{purpose}.mdc
```

### 2. **Kiểm tra file tồn tại**
```bash
# Kiểm tra file đã tồn tại
ls .windsurf/rules/{file-name}

# Kiểm tra naming conflict
grep -r "{file-name}" .windsurf/rules/
```

### 3. **Tạo file với metadata**
```markdown
# Rules
---
alwaysApply: {true/false}
globs: {file-patterns}
---
```

### 4. **Cập nhật index files**
```bash
# Cập nhật rules overview
.windsurf/rules/00_project-architecture-overview.mdc
```

## 📋 Checklist tạo file

### ✅ Trước khi tạo file
- [ ] Xác định đúng loại file (rule)
- [ ] Kiểm tra file đã tồn tại
- [ ] Chọn tên file phù hợp
- [ ] Xác định vị trí trong cấu trúc

### ✅ Khi tạo file
- [ ] Thêm metadata header
- [ ] Viết nội dung đầy đủ
- [ ] Kiểm tra format đúng

### ✅ Sau khi tạo file
- [ ] Cập nhật index files
- [ ] Commit changes
- [ ] Document trong README

## 🎯 Best Practices

### 1. **Naming Convention**
- **Rules**: `{number}_{purpose}.mdc` (08_file-creation-standards.mdc)

### 2. **File Organization**
- Phân loại theo chức năng
- Giữ cấu trúc flat khi có thể

### 3. **Content Standards**
- Luôn có header với metadata
- Cập nhật index files

### 4. **Maintenance**
- Review định kỳ
- Xóa file không cần thiết
- Cập nhật references
- Backup quan trọng

## 🔧 Tools và Automation

### 1. **File Creation Script**
```bash
# Tạo rule mới
./scripts/create-rule.sh {number} {purpose}
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
# Cập nhật rules index
./scripts/update-rules-index.sh
```

---

**Lưu ý**: Khi tạo file mới, luôn tuân thủ cấu trúc này để đảm bảo tính nhất quán và dễ quản lý. Nếu không chắc chắn, hãy tham khảo các file hiện có hoặc hỏi để được hướng dẫn cụ thể.