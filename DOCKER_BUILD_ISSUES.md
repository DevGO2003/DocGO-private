# Vấn đề Docker Build và Giải pháp

## ✅ Đã sửa được
1. **Lombok annotation processing** - Đã fix bằng cách:
   - Sửa Java version từ 25 về 17 trong maven-compiler-plugin
   - Thêm annotationProcessorPaths cho Lombok
   - File `Party.java` trống đã được tạo lại

## 🚨 Vấn đề hiện tại
**CommentController cũ** đang gọi các methods không tồn tại trong **CommentService mới**:

### Lỗi chính:
- `CommentController.java` gọi 50+ methods không tồn tại trong `CommentService`
- Ví dụ: `getAllComments()`, `createComment()`, `getCommentById()`, etc.
- `CommentRepository` cũng thiếu các methods tương ứng

### Nguyên nhân:
- Tôi đã tạo **CommentService mới** với interface đơn giản (chỉ 4 methods)
- Nhưng **CommentController cũ** vẫn đang sử dụng interface phức tạp (50+ methods)
- Có xung đột giữa code cũ và code mới

## 🔧 Giải pháp

### Option 1: Sửa CommentController để match với CommentService mới
- Chỉ giữ lại 4 endpoints cơ bản: GET, POST, PUT, DELETE
- Xóa tất cả endpoints phức tạp khác
- **Ưu điểm**: Đơn giản, phù hợp với yêu cầu hiện tại
- **Nhược điểm**: Mất tính năng phức tạp

### Option 2: Tạo đầy đủ CommentService methods
- Implement tất cả 50+ methods mà CommentController đang gọi
- Tạo đầy đủ CommentRepository methods
- **Ưu điểm**: Giữ nguyên tất cả tính năng
- **Nhược điểm**: Phức tạp, mất thời gian

### Option 3: Tạm thời disable CommentController
- Comment out hoặc xóa CommentController cũ
- Chỉ giữ lại DocumentController với endpoints mới
- **Ưu điểm**: Build được ngay, test Document APIs
- **Nhược điểm**: Mất tính năng comments

## 🎯 Khuyến nghị
**Chọn Option 1** - Sửa CommentController để match với CommentService mới vì:
1. Phù hợp với yêu cầu hiện tại (chỉ cần CRUD cơ bản)
2. Đơn giản, dễ maintain
3. Có thể mở rộng sau này khi cần

## 📋 Các bước thực hiện
1. Backup CommentController cũ
2. Tạo CommentController mới với 4 endpoints cơ bản
3. Update imports và dependencies
4. Test build lại
5. Verify APIs hoạt động

