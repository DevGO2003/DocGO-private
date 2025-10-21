---
id: "rule-cursorignore-auto"
trigger: model_decision
description: |
  This rule establishes automatic .cursorignore management for DocGO development workflow including artifact detection, log file management, upload directory handling, and temporary file cleanup procedures.
  It ensures efficient development environment maintenance by automatically detecting and ignoring build artifacts, log files, uploads, and temporary files to maintain clean workspace organization.
  The rule covers pattern detection, automatic .cursorignore updates, artifact classification, and systematic workspace cleanup to maintain optimal development environment performance.
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
  - cursorignore
  - artifacts
  - cache
  - build
  - ignore
  - patterns
  - automation
  - workspace
---

# Tự động thêm Artifacts vào .cursorignore cho DocGO

## Mục tiêu
- Chuẩn hóa việc loại trừ các tệp/thư mục phát sinh (build artifacts, cache, logs, dữ liệu tạm/nhị phân lớn) khỏi index của Cursor
- Không tự động áp dụng cho các tệp môi trường (env)
- Tối ưu hóa performance của Cursor IDE
- Giữ workspace sạch sẽ và dễ quản lý

## 1. Quy tắc cơ bản

### Khi nào thêm vào .cursorignore
- Khi tạo MỚI thư mục/tệp có dấu hiệu là artefact build, cache, log, tệp tạm, dữ liệu upload, snapshot, hoặc nhị phân lớn
- Thêm pattern tương ứng vào `.cursorignore` nếu chưa tồn tại
- KHÔNG áp dụng tự động cho file môi trường như: `.env`, `*.env`, `.env.*`, `env.local`, `.env.local`

### Danh mục mẫu nghi ngờ (không giới hạn)

#### Node.js/JavaScript
```
**/node_modules/
**/.next/
**/out/
**/dist/
**/build/
**/.nuxt/
**/.cache/
**/.nyc_output/
**/coverage/
```

#### Python
```
**/venv/
**/.venv/
**/__pycache__/
**/.pytest_cache/
**/*.pyc
**/*.pyo
**/.mypy_cache/
**/.coverage
```

#### Java/Maven/Gradle
```
**/target/
**/.mvn/
**/.gradle/
**/*.class
**/*.jar
**/*.war
**/*.ear
```

#### Cache/Logs/Tạm
```
**/.cache/
**/logs/
**/*.log
**/tmp/
**/temp/
**/coverage/
**/.nyc_output/
**/.pytest_cache/
```

#### Dữ liệu dự án
```
**/uploads/
**/documents/
**/contract_uploads/
**/results/
**/data/
**/files/
**/media/
```

#### Hệ điều hành & IDE
```
.DS_Store
Thumbs.db
**/*.iml
**/.vscode/
**/.idea/
**/.settings/
```

#### Nhị phân/lưu trữ lớn
```
**/*.zip
**/*.rar
**/*.7z
**/*.tar.gz
**/*.tar.bz2
document/**/*.pdf
document/**/*.doc
document/**/*.docx
document/**/*.xls
document/**/*.xlsx
document/**/*.ppt
document/**/*.pptx
```

### Ignore bổ sung cho thư mục scripts tạm
```
**/.cursor/scripts/temp/**
```

## 2. Hướng dẫn thực thi

### Quy trình tự động
1. **Phát hiện** thư mục/tệp MỚI thuộc danh mục nghi ngờ
2. **Kiểm tra** xem pattern đã có trong `.cursorignore` chưa
3. **Thêm pattern** theo dạng dùng tiền tố `**/` để áp dụng toàn workspace
4. **Tránh trùng lặp** dòng; chỉ thêm khi chưa có
5. **Không tự động thêm** bất kỳ pattern nào liên quan tới file env

### Pattern Format
```
# Build artifacts
**/node_modules/
**/target/
**/__pycache__/

# Cache and logs
**/.cache/
**/logs/
**/*.log

# Uploads and data
**/uploads/
**/documents/
**/contract_uploads/

# IDE and OS
.DS_Store
Thumbs.db
**/.vscode/
**/.idea/

# Large files
**/*.zip
**/*.rar
**/*.7z
document/**/*.pdf
document/**/*.doc
document/**/*.docx
```

### Ưu tiên mức thư mục
- **Ưu tiên thêm ở mức thư mục cao nhất** (ví dụ: `**/dist/` thay vì từng file bên trong)
- **Sử dụng wildcards** khi có thể (ví dụ: `**/*.log` thay vì liệt kê từng file)
- **Nhóm patterns** theo loại để dễ quản lý

## 3. File Environment - KHÔNG áp dụng

### Các file env KHÔNG được thêm vào .cursorignore
```
.env
.env.local
.env.development
.env.production
.env.test
.env.staging
*.env
.env.*
env.local
.env.local
```

### Lý do không áp dụng
- **Environment files** cần được track để quản lý configuration
- **.env.example** files cần được commit vào git
- **Environment variables** cần được index để search và reference
- **Configuration files** quan trọng cho development workflow

## 4. Performance Impact

### Lợi ích của .cursorignore
- **Tăng tốc độ indexing** của Cursor IDE
- **Giảm memory usage** khi load workspace
- **Cải thiện search performance** bằng cách loại trừ files không cần thiết
- **Tăng responsiveness** của IDE

### Files nên ignore
- **Build artifacts**: Không cần index, có thể regenerate
- **Cache files**: Temporary, không cần version control
- **Log files**: Thường xuyên thay đổi, không cần index
- **Large binary files**: Chậm index, không cần search
- **Generated files**: Tự động tạo, không cần edit

## 5. Maintenance

### Regular Review
- **Kiểm tra định kỳ** .cursorignore file
- **Loại bỏ patterns** không còn cần thiết
- **Thêm patterns mới** khi phát sinh công cụ build/test mới
- **Cập nhật patterns** khi thay đổi project structure

### Common Updates
```bash
# Thêm pattern mới cho tool mới
echo "**/.eslintcache/" >> .cursorignore
echo "**/.turbo/" >> .cursorignore
echo "**/.next/cache/" >> .cursorignore

# Loại bỏ pattern không cần thiết
# (Manual review required)
```

## 6. Troubleshooting

### Common Issues
1. **Pattern không hoạt động**: Kiểm tra syntax và path
2. **File vẫn được index**: Restart Cursor IDE
3. **Pattern trùng lặp**: Loại bỏ duplicates
4. **Pattern quá rộng**: Sử dụng pattern cụ thể hơn

### Debug Commands
```bash
# Kiểm tra .cursorignore syntax
cat .cursorignore

# Kiểm tra file có bị ignore không
# (Manual check in Cursor IDE)

# Restart Cursor IDE để apply changes
# (Manual action required)
```

## 7. Best Practices

### Do's
- **Sử dụng `**/` prefix** cho recursive matching
- **Nhóm patterns** theo loại với comments
- **Kiểm tra patterns** trước khi thêm
- **Review định kỳ** .cursorignore file
- **Sử dụng wildcards** khi có thể

### Don'ts
- **Không ignore** environment files
- **Không ignore** source code files
- **Không ignore** configuration files quan trọng
- **Không ignore** documentation files
- **Không tạo patterns** quá rộng

### Pattern Examples
```bash
# ✅ Good patterns
**/node_modules/
**/target/
**/__pycache__/
**/*.log
**/uploads/

# ❌ Bad patterns
node_modules/          # Too specific
**/*                   # Too broad
.env                   # Should not ignore env files
src/                   # Should not ignore source code
```

## 8. Integration với Git

### .gitignore vs .cursorignore
- **.gitignore**: Loại trừ files khỏi Git version control
- **.cursorignore**: Loại trừ files khỏi Cursor IDE indexing
- **Có thể khác nhau**: Một số files cần track trong Git nhưng không cần index trong Cursor

### Common Patterns
```bash
# Files cần ignore trong cả Git và Cursor
**/node_modules/
**/target/
**/__pycache__/
**/*.log

# Files chỉ ignore trong Cursor (không ignore trong Git)
**/.cursor/
**/.vscode/
**/.idea/

# Files chỉ ignore trong Git (không ignore trong Cursor)
.env
.env.local
```

---

**Lưu ý**: Cursorignore auto rules này đảm bảo Cursor IDE hoạt động hiệu quả và workspace được quản lý sạch sẽ trong DocGO development workflow.