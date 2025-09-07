# Approval Workflow Service

Dịch vụ FastAPI xử lý luồng phê duyệt nhiều bước (sequential/parallel) cho DocGO.

## Endpoints (khái quát)
- POST `/api/v1/approval-workflow-service/approvals` — tạo workflow
- GET `/api/v1/approval-workflow-service/approvals` — danh sách
- GET `/api/v1/approval-workflow-service/approvals/{id}` — chi tiết
- PUT `/api/v1/approval-workflow-service/approvals/{id}` — cập nhật
- DELETE `/api/v1/approval-workflow-service/approvals/{id}` — xoá mềm

Docs: http://localhost:8006/docs#/

