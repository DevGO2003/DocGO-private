# Development Workflow Standards

## Mô tả
Các quy chuẩn nhằm giữ workspace sạch, quy trình làm việc ổn định và nhất quán giữa các thành viên. Bao gồm quy tắc chống tạo file markdown tự động và khuyến nghị vận hành trong quá trình phát triển.

- Công nghệ: Git, CI, công cụ soạn thảo/IDE
- Khi sử dụng: Trong suốt vòng đời phát triển, review, và bảo trì mã nguồn

---

## No Auto Markdown Creation (tham chiếu 07_no-auto-md-creation.md)

- Không tự động tạo file `.md` khi không có yêu cầu rõ ràng
- Không tạo các file tài liệu phụ (README phụ, changelog, summary) trừ khi được chỉ định
- Nếu phát hiện file `.md` được tạo tự động: xoá và thông báo để tránh rác
- Ngoại lệ được phép: `README.md` chính, tài liệu hướng dẫn chạy service, file trong `prompt/`, hoặc khi người dùng yêu cầu cụ thể

Checklist nhanh:
- Mọi file `.md` mới phải có yêu cầu rõ ràng hoặc nằm trong danh sách cho phép
- Duy trì repo sạch, tránh tài liệu rác khó kiểm soát

---

## Khuyến nghị bổ sung

- Commit nhỏ, mô tả rõ ràng; tuân theo convention đã thống nhất
- Bảo vệ nhánh chính với PR + review
- Tự động kiểm tra lint/test trong CI trước khi merge

















