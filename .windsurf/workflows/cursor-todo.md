# Cursor TODO Command

Thiết lập và thực hiện TODO list trong Cursor một cách đơn giản.

## Cách sử dụng
```bash
/cursor-todo
```

## Quy trình thực hiện

### 1. 📋 Thiết lập TODO List
- Tạo TODO list mới hoặc sử dụng TODO hiện có
- Phân loại theo status: pending, in_progress, completed, cancelled
- Mỗi TODO có ID, content, và status

### 2. 🎯 Thực hiện TODO
- Bắt đầu với TODO đầu tiên có status "pending"
- Chuyển status thành "in_progress" khi bắt đầu
- Chuyển status thành "completed" khi hoàn thành
- Tiếp tục với TODO tiếp theo

### 3. 📊 Hiển thị kết quả
- Hiển thị TODO list hiện tại
- Thống kê đơn giản: tổng số, đã hoàn thành, đang làm
- Gợi ý TODO tiếp theo cần làm

## Ví dụ sử dụng

### Thiết lập TODO mới
```
/cursor-todo
```
→ Tạo TODO list với các task cần làm

### Thực hiện TODO
```
/cursor-todo
```
→ Bắt đầu làm TODO đầu tiên, cập nhật status, hoàn thành và chuyển sang TODO tiếp theo

## Format hiển thị đơn giản

```
📋 CURSOR TODO LIST
═══════════════════════════════════════

🟡 ĐANG LÀM (1)
└── task-001: Sửa lỗi API authentication

⏳ CHỜ LÀM (3)
├── task-002: Cập nhật documentation
├── task-003: Implement user validation
└── task-004: Add error handling

✅ ĐÃ HOÀN THÀNH (2)
├── task-005: Setup project structure
└── task-006: Configure database

═══════════════════════════════════════
📊 Tổng: 6 | Đã làm: 2 | Đang làm: 1 | Chờ làm: 3
🎯 Tiếp theo: task-002 - Cập nhật documentation
```

## Quy tắc đơn giản

### 1. TODO Structure
- **ID**: Tự động (task-001, task-002, ...)
- **Content**: Mô tả ngắn gọn
- **Status**: pending → in_progress → completed

### 2. Workflow
1. **Thiết lập** TODO list
2. **Bắt đầu** TODO đầu tiên
3. **Hoàn thành** và chuyển sang TODO tiếp theo
4. **Lặp lại** cho đến khi hết TODO

### 3. Best Practices
- **Một TODO = Một task cụ thể**
- **Làm xong TODO này rồi mới chuyển sang TODO khác**
- **Cập nhật status ngay khi thay đổi**

## Kết quả mong đợi

- ✅ **TODO list được thiết lập** và sẵn sàng thực hiện
- ✅ **TODO được thực hiện** theo thứ tự ưu tiên
- ✅ **Status được cập nhật** real-time
- ✅ **Tiến độ được theo dõi** rõ ràng
- ✅ **Workflow đơn giản** và hiệu quả
