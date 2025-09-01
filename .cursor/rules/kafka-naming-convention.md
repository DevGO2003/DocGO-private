# 🏆 Quy ước Vàng cho việc đặt tên Topic Kafka

## 1. Cấu trúc cốt lõi: `Domain.Entity.Action`

Đây là cấu trúc mạnh mẽ và dễ mở rộng nhất. Mọi tên topic phải tuân theo mẫu này.

-   **`Domain`**: Tên của service hoặc lĩnh vực nghiệp vụ chịu trách nhiệm chính cho dữ liệu (ví dụ: `contract`, `file`, `ai`, `user`).
-   **`Entity`**: Đối tượng nghiệp vụ chính mà sự kiện nói về (ví dụ: `contract`, `summary`, `file`, `party`).
-   **`Action`**: Hành động đã xảy ra với đối tượng, **luôn ở thì quá khứ** (ví dụ: `created`, `uploaded`, `processing.completed`).

---

## 2. Các quy tắc bất biến

1.  **Dùng chữ thường (lowercase)**: `contract.summary.generated` (Không dùng `Contract.Summary.Generated`).
2.  **Phân cách bằng dấu chấm (.)**: Dấu chấm tạo ra một không gian tên có cấu trúc, dễ dàng cho việc quản lý và cấp quyền. (Không dùng gạch ngang `-` hay gạch dưới `_`).
3.  **Sử dụng thì quá khứ (Past Tense)**: Mọi sự kiện (event) là một bản ghi về một điều **đã xảy ra**. Ví dụ: `file.uploaded` thay vì `file.upload`.
4.  **Rõ ràng hơn ngắn gọn**: Tên topic phải tự mô tả. `ai.contract.summary.generated` tốt hơn nhiều so với `ai.events`.
5.  **Không chứa tên Consumer**: Tên topic mô tả dữ liệu, không phải ai sẽ dùng nó. `contract.created` tốt hơn `contract.created.for-notification-service`.

---

## 3. Bảng tham chiếu cho hệ thống DocGO

| Service Chịu Trách Nhiệm | Topic cũ | ✅ Topic theo Quy ước Vàng | Mô tả |
| :--- | :--- | :--- | :--- |
| **File Storage Service** | `file.events` | **`file.uploaded`** | (Produce) Một file đã được tải lên và xác thực thành công. |
| **AI Processing Service** | `file.events` | **`file.uploaded`** | (Consume) Nhận file để bắt đầu xử lý. |
| **AI Processing Service** | `ai.events` | **`ai.processing.started`** | (Produce) Bắt đầu quá trình xử lý AI cho một file. |
| **AI Processing Service** | `ai.events` | **`ai.processing.completed`** | (Produce) Hoàn thành toàn bộ quá trình xử lý AI. |
| **AI Processing Service** | `ai.events` | **`ai.processing.failed`** | (Produce) Xử lý AI thất bại. |
| **Contract Service** | `ai.events` | **`ai.processing.completed`** | (Consume) Nhận kết quả cuối cùng từ AI service. |
| **Contract Service** | `contract.events` | **`contract.created`** | (Produce) Một hợp đồng mới đã được tạo. |
| **Contract Service** | `contract.events` | **`contract.updated`** | (Produce) Thông tin hợp đồng đã được cập nhật. |
| **Contract Service** | `contract.events` | **`contract.status.changed`** | (Produce) Trạng thái của hợp đồng đã thay đổi. |
| **Contract Service** | `contract.summary.published` | **`contract.summary.updated`** | (Consume) Nhận và cập nhật bản tóm tắt từ AI. |

### Tại sao đây là quy ước "tốt nhất"?

-   **Tự động hóa (Automation-Friendly)**: Cấu trúc `Domain.Entity.Action` cho phép tự động cấp quyền (ACLs) hoặc định tuyến dữ liệu. Ví dụ: cấp cho `ai-service` quyền ghi vào tất cả topic `ai.*`.
-   **Khả năng khám phá (Discoverability)**: Lập trình viên mới có thể dễ dàng hiểu hệ thống đang làm gì chỉ bằng cách nhìn vào danh sách topic.
-   **Tránh xung đột (Collision-Proof)**: Việc tiền tố hóa bằng `Domain` đảm bảo các service khác nhau sẽ không vô tình tạo ra các topic có tên giống nhau cho các mục đích khác nhau.
-   **Dễ dàng giám sát (Monitoring)**: Dễ dàng theo dõi, cảnh báo và phân tích lưu lượng dữ liệu cho từng lĩnh vực nghiệp vụ (`contract.*`, `file.*`).

