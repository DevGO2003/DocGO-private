# DocGO Microservices Overview

## Tổng quan hệ thống
DocGO sử dụng kiến trúc microservices với 19 services chính, mỗi service có port riêng biệt và công nghệ phù hợp.

## Danh sách Microservices

### 1. API Gateway BFF (Next.js) - Port 8000
- **Công nghệ**: Next.js (Node.js)
- **Chức năng**: Điều hướng request, load balancing, authentication, rate limiting
- **Health Check**: `/health`
- **Docs**: `http://localhost:8000/docs`

### 2. Authentication Identity Service (Spring Boot) - Port 8001
- **Công nghệ**: Spring Boot (Java)
- **Chức năng**: Xác thực, phân quyền, quản lý session, JWT token
- **Health Check**: `/actuator/health`
- **Docs**: `http://localhost:8001/docs`

### 3. User Management Service (FastAPI) - Port 8002
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Tạo, sửa, xóa, quản lý user, phân quyền
- **Health Check**: `/health`
- **Docs**: `http://localhost:8002/docs`

### 4. Contract Management Service (Spring Boot) - Port 8003
- **Công nghệ**: Spring Boot (Java)
- **Chức năng**: Quản lý hợp đồng, workflow, approval
- **Health Check**: `/actuator/health`
- **Docs**: `http://localhost:8003/docs`

### 5. Versioning Document History Service (FastAPI) - Port 8004
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Quản lý phiên bản tài liệu, lịch sử thay đổi
- **Health Check**: `/health`
- **Docs**: `http://localhost:8004/docs`

### 6. Commenting Collaboration Service (FastAPI) - Port 8005
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Bình luận, cộng tác, thảo luận
- **Health Check**: `/health`
- **Docs**: `http://localhost:8005/docs`

### 7. Approval Workflow Service (FastAPI) - Port 8006
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Quy trình phê duyệt, workflow management
- **Health Check**: `/health`
- **Docs**: `http://localhost:8006/docs`

### 8. Reminder Scheduler Service (FastAPI) - Port 8007
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Lập lịch nhắc nhở, notification scheduling
- **Health Check**: `/health`
- **Docs**: `http://localhost:8007/docs`

### 9. E-Signature Integration Service (FastAPI) - Port 8008
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Tích hợp chữ ký điện tử, digital signature
- **Health Check**: `/health`
- **Docs**: `http://localhost:8008/docs`

### 10. Notification Service (FastAPI) - Port 8009
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Gửi thông báo, email, SMS, push notification
- **Health Check**: `/health`
- **Docs**: `http://localhost:8009/docs`

### 11. Reporting Analytics Service (FastAPI) - Port 8010
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Báo cáo, phân tích dữ liệu, dashboard
- **Health Check**: `/health`
- **Docs**: `http://localhost:8010/docs`

### 12. OCR Document Extraction Service (FastAPI) - Port 8011
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: OCR, trích xuất text từ hình ảnh/tài liệu
- **Health Check**: `/health`
- **Docs**: `http://localhost:8011/docs`

### 13. File Storage Asset Service (FastAPI) - Port 8012
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Lưu trữ file, quản lý tài sản, malware scan
- **Health Check**: `/health`
- **Docs**: `http://localhost:8012/docs`

### 14. Audit Activity Log Service (FastAPI) - Port 8013
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Ghi log hoạt động, audit trail, compliance
- **Health Check**: `/health`
- **Docs**: `http://localhost:8013/docs`

### 15. Integration Connectors Service (FastAPI) - Port 8014
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Kết nối hệ thống bên ngoài, API integration
- **Health Check**: `/health`
- **Docs**: `http://localhost:8014/docs`

### 16. Batch ETL Service (FastAPI) - Port 8015
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Xử lý dữ liệu hàng loạt, ETL pipeline
- **Health Check**: `/health`
- **Docs**: `http://localhost:8015/docs`

### 17. Health Monitoring Agent (FastAPI) - Port 8016
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Giám sát sức khỏe hệ thống, metrics collection
- **Health Check**: `/health`
- **Docs**: `http://localhost:8016/docs`

### 18. AI Processing Service (FastAPI) - Port 8017
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Xử lý AI, machine learning, natural language processing
- **Health Check**: `/health`
- **Docs**: `http://localhost:8017/docs`

### 19. General File Management Service (FastAPI) - Port 8018
- **Công nghệ**: FastAPI (Python)
- **Chức năng**: Quản lý file tổng quát, metadata, organization
- **Health Check**: `/health`
- **Docs**: `http://localhost:8018/docs`

## Công nghệ sử dụng

### Spring Boot (Java) - 2 services
- Authentication Identity Service (8001)
- Contract Management Service (8003)

### FastAPI (Python) - 16 services
- Tất cả services còn lại từ port 8002-8018

### Next.js (Node.js) - 1 service
- API Gateway BFF (8000)

## Health Check Endpoints

### Spring Boot Services
- **Pattern**: `/actuator/health`
- **Services**: Authentication Identity, Contract Management

### FastAPI Services
- **Pattern**: `/health`
- **Services**: Tất cả Python services

### Next.js Service
- **Pattern**: `/health`
- **Services**: API Gateway BFF

## Database Distribution

### MariaDB (Structured Data)
- Authentication Identity Service
- User Management Service
- Contract Management Service
- General File Management Service

### MongoDB (Unstructured Data)
- OCR Document Extraction Service
- Audit Activity Log Service
- Batch ETL Service
- AI Processing Service

### Redis (Cache & Message Broker)
- Tất cả services sử dụng Redis cho cache và communication

## Message Broker Events

### File Processing Flow
1. **File Uploaded** → File Storage Service
2. **AI Processing Started** → AI Processing Service
3. **File Classification** → Contract/General File Management
4. **Processing Completed** → Notification Service

### Contract Workflow
1. **Contract Created** → Contract Management Service
2. **Approval Required** → Approval Workflow Service
3. **Notification Sent** → Notification Service
4. **Audit Logged** → Audit Activity Log Service

## Environment Variables

Tất cả service URLs được cấu hình qua environment variables trong `docker-compose.local.yml`:

```yaml
environment:
  - AUTHENTICATION_SERVICE_URL=http://authentication-identity-service:8001
  - USER_MANAGEMENT_SERVICE_URL=http://user-management-service:8002
  - CONTRACT_MANAGEMENT_SERVICE_URL=http://contract-management-service:8003
  # ... và các services khác
```

## Development Workflow

### Hot Reload
- Tất cả services sử dụng volume mount cho development
- Code changes được reflect ngay lập tức
- Không cần rebuild Docker images

### Service Discovery
- Services giao tiếp qua tên container trong Docker network
- Health checks tự động monitor trạng thái services
- API Gateway route requests đến services tương ứng

### Testing
- Mỗi service có `/health` endpoint để kiểm tra
- API documentation có sẵn tại `/docs` cho mỗi service
- Test scripts có sẵn trong `autofiles/` directory
