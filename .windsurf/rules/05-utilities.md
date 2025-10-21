---
id: "rule-utilities"
trigger: always_on
description: |
  This rule establishes comprehensive utility standards for DocGO development workflow including chat prompt generation, markdown file restrictions, automatic .cursorignore management, and workspace cleanup procedures.
  It ensures efficient development environment maintenance by preventing unnecessary file creation, managing build artifacts, and automating cleanup of temporary files and unused scripts.
  The rule covers prompt management, documentation restrictions, artifact detection, and systematic workspace organization to maintain clean, productive development environments.
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
  - utilities
  - prompts
  - generator
  - cleanup
  - housekeeping
  - cursorignore
  - ignore-patterns
  - artifacts
  - cache
  - logs
  - uploads
  - temp
  - md-creation
  - documentation
  - restrictions
  - scripts
  - tests
  - readme
  - policies
  - consistency
  - workspace
  - maintenance
  - standards
  - best-practices
---
# Cách sử dụng Rules

## 📚 Cách sử dụng
1. Phát triển API mới: xem `01-api-standards.mdc`
2. Tạo service mới: xem `02-service-structure.mdc`
3. Cấu hình môi trường: xem `03-environment-git.mdc`
4. Sử dụng MCP tools: xem `04-mcp-usage.mdc`
5. Tiện ích và tự động hóa: xem `05-utilities.mdc`

## 🔄 Cập nhật quy tắc
1. Sửa file rule tương ứng
2. Cập nhật file này nếu thay đổi cấu trúc
3. Commit và push theo workflow đã quy định

# Quy tắc tiện ích chat

## Tạo prompt nhanh
Khi người dùng yêu cầu "tạo prompt: <nội dung prompt>" thì:

1. **Tạo file prompt**: Tạo file trong thư mục `prompt/` với format:
   - Tên file: `<STT>.<Mục đích prompt tiếng việt>.md`
   - STT: Số thứ tự tăng dần (01, 02, 03...)
   - Mục đích: Mô tả ngắn gọn mục đích của prompt bằng tiếng Việt

2. **Nội dung file**:
   ```markdown
   # <Mục đích prompt>
   
   ## Prompt
   ```
   <nội dung prompt đầy đủ>
   ```
   
   ## Mục đích
   <giải thích mục đích sử dụng>
   
   ## Cách sử dụng
   Copy nội dung prompt trên và paste vào chat AI để thực hiện nhanh
   ```

3. **Dừng lại ở bước tạo prompt**: KHÔNG thực hiện prompt, chỉ tạo file để lưu trữ

4. **Thông báo**: Thông báo đã tạo file prompt thành công và đường dẫn file

## Ví dụ
- Input: "tạo prompt: lưu lại nội dung so sánh và yêu cầu ai thực hiện điều chỉnh tốt nhất"
- Output: Tạo file `prompt/01.luu-lai-noi-dung-so-sanh-va-yeu-cau-ai-thuc-hien-dieu-chinh-tot-nhat.md`

---

# Quy tắc ngăn chặn tạo file MD tự động

## Mục tiêu
- Ngăn chặn Cursor AI tự động tạo file markdown (.md) không cần thiết
- Chỉ cho phép tạo file MD khi được yêu cầu rõ ràng
- Giữ workspace sạch sẽ, tránh file rác

## Quy tắc nghiêm ngặt

### ❌ KHÔNG BAO GIỜ tự động tạo file MD:
- Không tạo file tài liệu tự động khi thực hiện task
- Không tạo file ghi chú thay đổi tự động
- Không tạo file README phụ trừ khi được yêu cầu
- Không tạo file documentation tự động
- Không tạo file changelog tự động
- Không tạo file summary tự động

### ✅ CHỈ tạo file MD khi:
- Người dùng yêu cầu rõ ràng: "tạo file MD", "viết tài liệu", "tạo README"
- Người dùng sử dụng lệnh "tạo prompt:" (theo quy tắc chat-utilities)
- Người dùng yêu cầu tạo file cụ thể với tên rõ ràng

### 📁 File MD được phép tồn tại:
- `README.md` (file chính của project)
- `How to run this microservice.md` (hướng dẫn chạy service)
- File trong thư mục `prompt/` (theo quy tắc chat-utilities)
- File được tạo theo yêu cầu rõ ràng của người dùng

## Xử lý vi phạm
- Nếu phát hiện file MD được tạo tự động, xóa ngay lập tức
- Thông báo cho người dùng về việc xóa file không cần thiết
- Ghi nhớ để tránh lặp lại

## Ghi chú
- Quy tắc này áp dụng cho mọi file có extension .md
- Không áp dụng cho file .mdc (Cursor rules)
- Ưu tiên giữ workspace sạch sẽ hơn việc tạo tài liệu tự động

---

# Tự động thêm các tệp/thư mục không cần thiết vào .cursorignore

## Mục tiêu
- Chuẩn hóa việc loại trừ các tệp/thư mục phát sinh (build artifacts, cache, logs, dữ liệu tạm/nhị phân lớn) khỏi index của Cursor.
- Không tự động áp dụng cho các tệp môi trường (env). Các tệp env KHÔNG được thêm vào .cursorignore bởi cơ chế này.

## Quy tắc
- Khi tạo MỚI thư mục/tệp có dấu hiệu là artefact build, cache, log, tệp tạm, dữ liệu upload, snapshot, hoặc nhị phân lớn → thêm pattern tương ứng vào `.cursorignore` nếu chưa tồn tại.
- KHÔNG áp dụng tự động cho file môi trường như: `.env`, `*.env`, `.env.*`, `env.local`, `.env.local`.
- Danh mục mẫu nghi ngờ (ví dụ, không giới hạn):
  - Node/JS: `**/node_modules/`, `**/.next/`, `**/out/`, `**/dist/`, `**/build/`
  - Python: `**/venv/`, `**/.venv/`, `**/__pycache__/`, `**/.pytest_cache/`, `**/*.pyc`, `**/*.pyo`
  - Java/Maven/Gradle: `**/target/`, `**/.mvn/`, `**/.gradle/`
  - Cache/Logs/Tạm: `**/.cache/`, `**/logs/`, `**/*.log`, `**/tmp/`, `**/temp/`, `**/coverage/`, `**/.nyc_output/`
  - Dữ liệu dự án: `**/uploads/`, `**/documents/`, `**/contract_uploads/`, `**/results/`
  - Hệ điều hành & IDE: `.DS_Store`, `Thumbs.db`, `**/*.iml`
  - Nhị phân/lưu trữ lớn: `**/*.zip`, `**/*.rar`, `**/*.7z`, `document/**/*.pdf|doc|docx|xls|xlsx|ppt|pptx`

### Ignore bổ sung cho thư mục scripts tạm
- Bỏ qua thư mục scripts tạm của Cursor:
  - `**/.cursor/scripts/temp/**`

## Hướng dẫn thực thi
- Khi phát hiện một thư mục/tệp MỚI thuộc danh mục nghi ngờ ở trên và chưa có trong `.cursorignore`, hãy thêm pattern theo dạng dùng tiền tố `**/` để áp dụng toàn workspace.
- Tránh trùng lặp dòng; chỉ thêm khi chưa có.
- Không tự động thêm bất kỳ pattern nào liên quan tới file env.
- Nếu có nghi ngờ nhầm lẫn, ưu tiên thêm ở mức thư mục cao nhất (ví dụ: `**/dist/` thay vì từng file bên trong).

## Ghi chú
- Quy tắc này chỉ tác động đến index của Cursor, không ảnh hưởng đến Git.
- Có thể cập nhật bổ sung danh mục mẫu nghi ngờ khi phát sinh công cụ build/test mới.

---

# Quy tắc tự động dọn dẹp file test và README

## Mục tiêu
- Tự động xóa file test scripts không được sử dụng sau khi hoàn thành task
- Giới hạn README files chỉ ở các vị trí quan trọng
- Giữ workspace sạch sẽ và dễ quản lý

## Quy tắc Test Scripts

### Khi nào xóa test scripts
- Sau khi thực hiện xong yêu cầu của user
- File test script không được sử dụng trong 1 session
- File test script được tạo tạm để thử nghiệm

### Các loại test scripts cần xóa
- `test*.sh`, `test*.bat`, `test*.ps1`
- Scripts tạm trong thư mục root
- Scripts không có documentation

## Quy tắc README Files

### README files được phép tồn tại (5 files)
1. `README.md` (root project)
2. `backend/user-management-service/README.md`
3. `backend/file-management-service/README.md`
4. `backend/automation-service/README.md`
5. `backend/api-gateway/README.md`

### Vị trí không được phép có README
- Frontend folders (trừ root frontend nếu cần)
- Component folders
- Documents folders
- Test data folders
- Architecture folders (nên dùng .mdc trong .cursor/rules)

### Ngoại lệ
- README trong `.cursor/**` được phép
- README có nội dung quan trọng cần được review trước khi xóa

## Workflow

1. Sau khi hoàn thành task
2. Kiểm tra các file test scripts được tạo ra
3. Kiểm tra các README files không nằm trong danh sách cho phép
4. Thông báo user về các files sẽ bị xóa
5. Thực hiện xóa sau khi user confirm (hoặc tự động nếu alwaysApply=true)

## Lưu ý
- Không xóa test scripts có documentation rõ ràng
- Không xóa README nếu có nội dung quan trọng chưa được chuyển đi đâu
- Luôn log actions để có thể rollback nếu cần

---

# Quy tắc kiểm tra file tồn tại

## Mục tiêu
- Tránh ghi đè file đã tồn tại
- Sử dụng đúng công cụ để kiểm tra file
- Đảm bảo an toàn khi chỉnh sửa file quan trọng

## Quy tắc nghiêm ngặt

### ❌ KHÔNG BAO GIỜ dùng `list_dir` để kiểm tra file cụ thể:
- `list_dir` không hiển thị file ẩn (.env, .gitignore, .cursorignore)
- `list_dir` không phù hợp để tìm file cụ thể
- `list_dir` chỉ dùng để xem cấu trúc thư mục tổng quan

### ✅ LUÔN dùng các công cụ phù hợp:

#### 1. **`read_file`** - Ưu tiên cao nhất
```javascript
// Kiểm tra file đã tồn tại trước khi tạo mới
read_file(target_file: "path/to/file")
```
- **Dùng khi**: Kiểm tra file cụ thể đã tồn tại
- **Ưu điểm**: Đọc được nội dung, phát hiện file ẩn
- **Ví dụ**: `read_file(target_file: "backend/user-management-service/.env")`

#### 2. **`grep`** - Tìm nội dung trong file
```javascript
// Tìm biến trong file .env
grep(pattern: "GOOGLE_CLIENT_ID", path: "backend/user-management-service/.env")
```
- **Dùng khi**: Tìm nội dung cụ thể trong file
- **Ưu điểm**: Tìm được pattern, hiển thị context
- **Ví dụ**: `grep(pattern: "spring\.security", path: "application.properties")`

#### 3. **`glob_file_search`** - Tìm file theo pattern
```javascript
// Tìm tất cả file .env
glob_file_search(glob_pattern: "**/.env", target_directory: "backend")
```
- **Dùng khi**: Tìm file theo pattern, nhiều file
- **Ưu điểm**: Tìm được nhiều file cùng lúc
- **Ví dụ**: `glob_file_search(glob_pattern: "**/*.env*")`

#### 4. **`list_dir`** - Chỉ để xem cấu trúc
```javascript
// Xem cấu trúc thư mục (không dùng để tìm file cụ thể)
list_dir(target_directory: "backend/user-management-service")
```
- **Dùng khi**: Xem cấu trúc thư mục tổng quan
- **Hạn chế**: Không hiển thị file ẩn, không phù hợp tìm file cụ thể

## Quy trình chuẩn khi tạo/chỉnh sửa file

### Bước 1: Kiểm tra file đã tồn tại
```javascript
// LUÔN kiểm tra trước
read_file(target_file: "path/to/file")
```

### Bước 2: Xử lý theo kết quả
- **File tồn tại**: Chỉnh sửa nội dung bằng `search_replace` hoặc `MultiEdit`
- **File không tồn tại**: Tạo mới bằng `write`

### Bước 3: Xác nhận thay đổi
```javascript
// Đọc lại để xác nhận
read_file(target_file: "path/to/file")
```

## Ví dụ thực tế

### ❌ Cách sai:
```javascript
// SAI: Dùng list_dir để tìm .env
list_dir(target_directory: "backend/user-management-service")
// Kết quả: Không thấy .env → Tạo mới → Ghi đè file đã có
```

### ✅ Cách đúng:
```javascript
// ĐÚNG: Dùng read_file để kiểm tra
read_file(target_file: "backend/user-management-service/.env")
// Kết quả: Thấy file đã có → Chỉnh sửa nội dung
```

## Áp dụng cho các loại file quan trọng

### File cấu hình (.env, .properties, .yaml)
- **BẮT BUỘC** dùng `read_file` trước
- **KHÔNG** tạo mới nếu đã tồn tại
- **CHỈ** chỉnh sửa nội dung cần thiết

### File code (.java, .ts, .tsx, .py)
- **NÊN** dùng `read_file` để hiểu cấu trúc
- **DÙNG** `search_replace` để chỉnh sửa chính xác
- **TRÁNH** ghi đè toàn bộ file

### File tài liệu (.md, .txt)
- **KIỂM TRA** nội dung hiện tại
- **THÊM** nội dung mới thay vì thay thế
- **GIỮ** cấu trúc và format hiện có

## Ghi nhớ quan trọng
- **File ẩn** (.env, .gitignore, .cursorignore) chỉ thấy bằng `read_file`
- **Pattern matching** dùng `grep` hoặc `glob_file_search`
- **Cấu trúc thư mục** mới dùng `list_dir`
- **Ưu tiên**: `read_file` > `grep` > `glob_file_search` > `list_dir`

## Xử lý lỗi
- Nếu `read_file` trả về "File is empty": File tồn tại nhưng trống
- Nếu `read_file` trả về lỗi: File không tồn tại
- Nếu `grep` không tìm thấy: Pattern không có trong file
- Nếu `list_dir` không hiển thị: File có thể là file ẩn

---

**Lưu ý**: Quy tắc này áp dụng cho tất cả các file trong workspace để đảm bảo an toàn và tránh ghi đè nhầm.