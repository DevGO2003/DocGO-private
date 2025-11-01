# Event & Payload Standards

## Mô tả
Tiêu chuẩn hóa event payload giữa các microservices nhằm đảm bảo khả năng tương thích, dễ mở rộng, và truy vết hệ thống. Xác định format, metadata, versioning, và quy ước đặt tên trong thông điệp.

- Công nghệ: Event-driven (Kafka), JSON payload
- Khi sử dụng: Thiết kế và phát hành/tiêu thụ sự kiện giữa các dịch vụ

---

## Payload Standards (tham chiếu 05_event-payload-standards.md)

- Envelope chung cho tất cả event: id, type, source, subject, data, time, specversion (CloudEvents-inspired)
- Trường metadata bắt buộc: correlationId/traceId, producer, schemaVersion, tenant (nếu đa tenant)
- Quy ước đặt tên event: `{domain}.{aggregate}.{action}` (vd: `repository.file.created`)
- Versioning: nâng `schemaVersion` khi thay đổi không tương thích; hỗ trợ backward-compat nếu có thể
- Quy ước idempotency và retry-safe để tránh xử lý trùng
- Bảo mật: tránh nhúng dữ liệu nhạy cảm; nếu cần thì mã hoá field hoặc sử dụng token tham chiếu

Checklist nhanh:
- Có correlationId/traceId để quan sát phân tán
- Có schemaVersion; mô tả thay đổi khi nâng version
- Tên event rõ ràng theo domain-aggregate-action
- Data gọn, không nhúng dữ liệu nhạy cảm

---

## Mô hình tiêu thụ (Consumer)

- Validate schema trước khi xử lý
- Xử lý idempotent (ghi nhận messageId đã xử lý)
- Ghi log với correlationId để dễ truy vết
- Dead-letter queue hoặc parking lot cho message lỗi không khắc phục ngay

---

## Mô hình phát hành (Producer)

- Kiểm tra tính đầy đủ của metadata
- Tôn trọng contract đã công bố (schema registry nếu có)
- Đảm bảo gửi một lần (at-least-once) + khả năng xử lý trùng phía consumer









