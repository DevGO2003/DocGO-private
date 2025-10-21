---
id: "rule-file-check"
trigger: model_decision
description: |
  This rule establishes comprehensive file existence validation standards for DocGO development workflow including pre-operation file checks, tool priority guidelines, and robust error handling procedures.
  It ensures reliable file operations by prioritizing read_file over list_dir, implementing proper file existence validation, and maintaining consistent error handling patterns.
  The rule covers file validation procedures, tool selection guidelines, error recovery mechanisms, and comprehensive logging to maintain reliable file system operations.
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
  - file-check
  - read_file
  - list_dir
  - tools
  - priority
  - safety
  - best-practices
  - examples
---

# File Existence Check Standards cho DocGO

## Mục tiêu
- Tránh ghi đè file đã tồn tại
- Sử dụng đúng công cụ để kiểm tra file
- Đảm bảo an toàn khi chỉnh sửa file quan trọng
- Tối ưu hóa workflow file operations

## 1. Quy tắc nghiêm ngặt

### ❌ KHÔNG BAO GIỜ dùng `list_dir` để kiểm tra file cụ thể
- `list_dir` không hiển thị file ẩn (.env, .gitignore, .cursorignore)
- `list_dir` không phù hợp để tìm file cụ thể
- `list_dir` chỉ dùng để xem cấu trúc thư mục tổng quan

### ✅ LUÔN dùng các công cụ phù hợp

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

## 2. Quy trình chuẩn khi tạo/chỉnh sửa file

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

## 3. Ví dụ thực tế

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

## 4. Áp dụng cho các loại file quan trọng

### File cấu hình (.env, .properties, .yaml)
- **BẮT BUỘC** dùng `read_file` trước
- **KHÔNG** tạo mới nếu đã tồn tại
- **CHỈ** chỉnh sửa nội dung cần thiết

```javascript
// Kiểm tra .env file
const envContent = read_file(target_file: "backend/user-management-service/.env")
if (envContent.includes("File is empty")) {
  // File tồn tại nhưng trống
  write(target_file: "backend/user-management-service/.env", contents: "HOST=0.0.0.0\nPORT=8001")
} else if (envContent.includes("Error")) {
  // File không tồn tại
  write(target_file: "backend/user-management-service/.env", contents: "HOST=0.0.0.0\nPORT=8001")
} else {
  // File tồn tại và có nội dung
  search_replace(file_path: "backend/user-management-service/.env", old_string: "PORT=8000", new_string: "PORT=8001")
}
```

### File code (.java, .ts, .tsx, .py)
- **NÊN** dùng `read_file` để hiểu cấu trúc
- **DÙNG** `search_replace` để chỉnh sửa chính xác
- **TRÁNH** ghi đè toàn bộ file

```javascript
// Kiểm tra Java file
const javaContent = read_file(target_file: "src/main/java/com/example/UserController.java")
if (javaContent.includes("Error")) {
  // File không tồn tại, tạo mới
  write(target_file: "src/main/java/com/example/UserController.java", contents: "// New controller")
} else {
  // File tồn tại, chỉnh sửa
  search_replace(file_path: "src/main/java/com/example/UserController.java", old_string: "@GetMapping", new_string: "@PostMapping")
}
```

### File tài liệu (.md, .txt)
- **KIỂM TRA** nội dung hiện tại
- **THÊM** nội dung mới thay vì thay thế
- **GIỮ** cấu trúc và format hiện có

```javascript
// Kiểm tra README file
const readmeContent = read_file(target_file: "README.md")
if (readmeContent.includes("Error")) {
  // File không tồn tại, tạo mới
  write(target_file: "README.md", contents: "# Project Name\n\nDescription...")
} else {
  // File tồn tại, thêm nội dung
  search_replace(file_path: "README.md", old_string: "## Installation", new_string: "## Installation\n\n### Prerequisites\n- Node.js 18+\n- MongoDB\n- Redis")
}
```

## 5. Tool Priority

### Thứ tự ưu tiên:
1. **`read_file`** - Kiểm tra file tồn tại và đọc nội dung
2. **`grep`** - Tìm nội dung cụ thể trong file
3. **`glob_file_search`** - Tìm file theo pattern
4. **`list_dir`** - Xem cấu trúc thư mục (không dùng để tìm file cụ thể)

### Khi nào dùng tool nào:

#### `read_file` - Ưu tiên cao nhất
```javascript
// Kiểm tra file .env
read_file(target_file: "backend/user-management-service/.env")

// Kiểm tra package.json
read_file(target_file: "frontend/web-app/package.json")

// Kiểm tra Dockerfile
read_file(target_file: "backend/user-management-service/Dockerfile")
```

#### `grep` - Tìm nội dung
```javascript
// Tìm biến trong .env
grep(pattern: "DATABASE_URL", path: "backend/user-management-service/.env")

// Tìm import trong Java
grep(pattern: "import.*Spring", path: "src/main/java/**/*.java")

// Tìm function trong Python
grep(pattern: "def.*process", path: "backend/automation-service/**/*.py")
```

#### `glob_file_search` - Tìm file theo pattern
```javascript
// Tìm tất cả file .env
glob_file_search(glob_pattern: "**/.env", target_directory: ".")

// Tìm tất cả file Java
glob_file_search(glob_pattern: "**/*.java", target_directory: "backend")

// Tìm tất cả file test
glob_file_search(glob_pattern: "**/*test*.py", target_directory: "backend")
```

#### `list_dir` - Xem cấu trúc
```javascript
// Xem cấu trúc thư mục
list_dir(target_directory: "backend/user-management-service")

// Xem cấu trúc root
list_dir(target_directory: ".")
```

## 6. Ghi nhớ quan trọng

### File ẩn
- **File ẩn** (.env, .gitignore, .cursorignore) chỉ thấy bằng `read_file`
- **`list_dir`** không hiển thị file ẩn
- **Luôn dùng `read_file`** để kiểm tra file ẩn

### Pattern matching
- **`grep`** dùng cho tìm nội dung trong file
- **`glob_file_search`** dùng cho tìm file theo pattern
- **`list_dir`** dùng cho xem cấu trúc thư mục

### Tool selection
- **Ưu tiên**: `read_file` > `grep` > `glob_file_search` > `list_dir`
- **Mục đích**: Kiểm tra file tồn tại > Tìm nội dung > Tìm file > Xem cấu trúc

## 7. Xử lý lỗi

### Kết quả `read_file`
- **"File is empty"**: File tồn tại nhưng trống
- **"Error"**: File không tồn tại
- **Nội dung**: File tồn tại và có nội dung

### Kết quả `grep`
- **Không tìm thấy**: Pattern không có trong file
- **Tìm thấy**: Hiển thị dòng chứa pattern

### Kết quả `glob_file_search`
- **Không tìm thấy**: Không có file match pattern
- **Tìm thấy**: Danh sách file paths

### Kết quả `list_dir`
- **Không hiển thị file ẩn**: Sử dụng `read_file` thay thế
- **Hiển thị thư mục**: Chỉ hiển thị thư mục, không phải file cụ thể

## 8. Best Practices

### Do's
- **Luôn dùng `read_file`** để kiểm tra file tồn tại
- **Kiểm tra kết quả** trước khi xử lý
- **Sử dụng `search_replace`** để chỉnh sửa file
- **Xác nhận thay đổi** sau khi chỉnh sửa
- **Xử lý lỗi** một cách graceful

### Don'ts
- **Không dùng `list_dir`** để tìm file cụ thể
- **Không ignore** kết quả lỗi
- **Không ghi đè** file mà không kiểm tra
- **Không assume** file tồn tại
- **Không dùng** tool không phù hợp

### Error Handling
```javascript
try {
  const fileContent = read_file(target_file: "path/to/file")
  if (fileContent.includes("Error")) {
    // File không tồn tại, tạo mới
    write(target_file: "path/to/file", contents: "new content")
  } else {
    // File tồn tại, chỉnh sửa
    search_replace(file_path: "path/to/file", old_string: "old", new_string: "new")
  }
} catch (error) {
  console.error("Error handling file:", error)
  // Fallback action
}
```

---

**Lưu ý**: File check standards này đảm bảo an toàn và hiệu quả cho việc thao tác với files trong DocGO development workflow.