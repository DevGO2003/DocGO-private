---
id: "rule-chat-utilities"
trigger: model_decision
description:
  This rule establishes comprehensive chat utility standards for DocGO development workflow including prompt generation, markdown file restrictions, and workspace management procedures.
  It ensures efficient development environment maintenance by preventing unnecessary file creation, managing documentation standards, and automating workspace organization tasks.
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
  - "**/README.md"
tags:
  - chat
  - utilities
  - prompts
  - markdown
  - readme
  - documentation
  - automation
  - restrictions
---

# Chat Utilities cho DocGO

## Mục tiêu
- Tự động hóa việc tạo prompt nhanh
- Ngăn chặn tạo file markdown tự động không cần thiết
- Quản lý README files ở các vị trí quan trọng
- Tối ưu hóa workflow chat và documentation

## 1. Tạo Prompt Nhanh

### Khi người dùng yêu cầu "tạo prompt: <nội dung prompt>"

#### Quy trình:
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

#### Ví dụ:
- Input: "tạo prompt: lưu lại nội dung so sánh và yêu cầu ai thực hiện điều chỉnh tốt nhất"
- Output: Tạo file `prompt/01.luu-lai-noi-dung-so-sanh-va-yeu-cau-ai-thuc-hien-dieu-chinh-tot-nhat.md`

### Prompt File Structure
```
prompt/
├── 01.luu-lai-noi-dung-so-sanh-va-yeu-cau-ai-thuc-hien-dieu-chinh-tot-nhat.md
├── 02.tao-api-endpoint-moi-cho-microservice.md
├── 03.debug-loi-database-connection.md
└── 04.optimize-performance-frontend.md
```

## 2. Ngăn chặn tạo file MD tự động

### Mục tiêu
- Ngăn chặn Cursor AI tự động tạo file markdown (.md) không cần thiết
- Chỉ cho phép tạo file MD khi được yêu cầu rõ ràng
- Giữ workspace sạch sẽ, tránh file rác

### Quy tắc nghiêm ngặt

#### ❌ KHÔNG BAO GIỜ tự động tạo file MD:
- Không tạo file tài liệu tự động khi thực hiện task
- Không tạo file ghi chú thay đổi tự động
- Không tạo file README phụ trừ khi được yêu cầu
- Không tạo file documentation tự động
- Không tạo file changelog tự động
- Không tạo file summary tự động

#### ✅ CHỈ tạo file MD khi:
- Người dùng yêu cầu rõ ràng: "tạo file MD", "viết tài liệu", "tạo README"
- Người dùng sử dụng lệnh "tạo prompt:" (theo quy tắc chat-utilities)
- Người dùng yêu cầu tạo file cụ thể với tên rõ ràng

#### 📁 File MD được phép tồn tại:
- `README.md` (file chính của project)
- `How to run this microservice.md` (hướng dẫn chạy service)
- File trong thư mục `prompt/` (theo quy tắc chat-utilities)
- File được tạo theo yêu cầu rõ ràng của người dùng

### Xử lý vi phạm
- Nếu phát hiện file MD được tạo tự động, xóa ngay lập tức
- Thông báo cho người dùng về việc xóa file không cần thiết
- Ghi nhớ để tránh lặp lại

### Ghi chú
- Quy tắc này áp dụng cho mọi file có extension .md
- Không áp dụng cho file .mdc (Cursor rules)
- Ưu tiên giữ workspace sạch sẽ hơn việc tạo tài liệu tự động

## 3. Quản lý README Files

### README files được phép tồn tại (5 files)
1. `README.md` (root project)
2. `backend/user-management-service/README.md`
3. `backend/repository-management-service/README.md`
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

### README Content Standards
```markdown
# Service Name

## Mô tả
Ngắn gọn về chức năng của service

## Cách chạy
```bash
# Development
npm install
npm run dev

# Production
npm run build
npm start
```

## API Endpoints
- `GET /api/v1/service/health` - Health check
- `POST /api/v1/service/endpoint` - Main endpoint

## Environment Variables
- `PORT` - Service port
- `DATABASE_URL` - Database connection string

## Dependencies
- Node.js 18+
- MongoDB
- Redis
```

## 4. Workspace Cleanup

### Workflow
1. Sau khi hoàn thành task
2. Kiểm tra các file test scripts được tạo ra
3. Kiểm tra các README files không nằm trong danh sách cho phép
4. Thông báo user về các files sẽ bị xóa
5. Thực hiện xóa sau khi user confirm (hoặc tự động nếu alwaysApply=true)

### Test Scripts Cleanup
#### Khi nào xóa test scripts
- Sau khi thực hiện xong yêu cầu của user
- File test script không được sử dụng trong 1 session
- File test script được tạo tạm để thử nghiệm

#### Các loại test scripts cần xóa
- `test*.sh`, `test*.bat`, `test*.ps1`
- Scripts tạm trong thư mục root
- Scripts không có documentation

### Lưu ý
- Không xóa test scripts có documentation rõ ràng
- Không xóa README nếu có nội dung quan trọng chưa được chuyển đi đâu
- Luôn log actions để có thể rollback nếu cần

## 5. Prompt Management

### Prompt Categories
- **API Development**: Tạo API endpoints, controllers, routers
- **Database Operations**: Queries, migrations, optimizations
- **Frontend Development**: Components, hooks, state management
- **DevOps**: Docker, deployment, monitoring
- **Debugging**: Error resolution, performance issues
- **Documentation**: Technical writing, guides, tutorials

### Prompt Naming Convention
```
<STT>.<Mục đích prompt tiếng việt>.md
```

Examples:
- `01.tao-api-endpoint-moi-cho-microservice.md`
- `02.debug-loi-database-connection.md`
- `03.optimize-performance-frontend.md`
- `04.tao-docker-compose-cho-service-moi.md`

### Prompt Content Structure
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

## Tags
- <tag1>
- <tag2>
- <tag3>

## Created
<ngày tạo>

## Last Used
<ngày sử dụng cuối>
```

## 6. Best Practices

### Do's
- **Tạo prompt** khi user yêu cầu rõ ràng
- **Kiểm tra README** trước khi xóa
- **Log actions** để có thể rollback
- **Sử dụng naming convention** nhất quán
- **Cập nhật prompt** khi cần thiết

### Don'ts
- **Không tạo MD files** tự động
- **Không xóa README** có nội dung quan trọng
- **Không tạo prompt** khi không được yêu cầu
- **Không ignore** cleanup workflow
- **Không hardcode** file paths

---

**Lưu ý**: Chat utilities này đảm bảo tính nhất quán và hiệu quả cho việc quản lý prompts và documentation trong DocGO development workflow.