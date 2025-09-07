# Versioning Document History Service

Dịch vụ FastAPI quản lý snapshot, lịch sử, diff và restore phiên bản hợp đồng cho DocGO.

## Endpoints
- GET `/api/v1/versioning-document-history-service/snapshots`
- GET `/api/v1/versioning-document-history-service/{contractId}/history`
- POST `/api/v1/versioning-document-history-service/{contractId}/diff`
- PUT `/api/v1/versioning-document-history-service/{contractId}/restore`

Docs: http://localhost:8004/docs#/

