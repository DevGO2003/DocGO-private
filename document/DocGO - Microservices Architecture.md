# DocGO - Kiến trúc Microservices

## Tổng quan hệ thống

DocGO là hệ thống quản lý tài liệu và hợp đồng thông minh được xây dựng theo kiến trúc microservices, sử dụng các công nghệ hiện đại để đảm bảo tính mở rộng, bảo mật và hiệu suất cao.

## Danh sách Microservices

| Tên Service | Công nghệ | Chức năng chính | Ghi chú/DB |
|-------------|-----------|-----------------|------------|
| **API Gateway BFF** | Next.js | Điều hướng request, load balancing, authentication, rate limiting | Port: 8000, Docs: `/docs#/` |
| **Authentication Identity Service** | Spring Boot | Xác thực, phân quyền, quản lý session, JWT token | Port: 8001, DB: MariaDB, Redis cache |
| **User Management Service** | FastAPI | Tạo, sửa, xóa, quản lý user, phân quyền | Port: 8002, DB: MariaDB, cache: Redis, lưu trữ profile, roles, JWT, email, audit, search, multi-tenant |
| **Contract Management Service** | Spring Boot | Quản lý hợp đồng, lifecycle, events, attachments | Port: 8003, DB: MariaDB, Kafka integration |
| **Versioning Document History Service** | FastAPI | Quản lý phiên bản tài liệu, lịch sử thay đổi, diff | Port: 8004, DB: MariaDB, file storage integration |
| **Commenting Collaboration Service** | FastAPI | Bình luận, thảo luận, collaboration trên tài liệu | Port: 8005, DB: MariaDB, real-time notifications |
| **Approval Workflow Service** | FastAPI | Quy trình phê duyệt, workflow engine, approval chains | Port: 8006, DB: MariaDB, workflow engine |
| **Reminder Scheduler Service** | FastAPI | Lập lịch nhắc nhở, notifications, cron jobs | Port: 8007, DB: MariaDB, Redis scheduler, email/SMS integration |
| **E-Signature Integration Service** | FastAPI | Tích hợp chữ ký điện tử, digital signatures | Port: 8008, DB: MariaDB, third-party e-signature APIs |
| **Notification Service** | FastAPI | Gửi thông báo, email, SMS, push notifications | Port: 8009, DB: MariaDB, email/SMS providers, WebSocket |
| **Reporting Analytics Service** | FastAPI | Báo cáo, thống kê, analytics, dashboards | Port: 8010, DB: MariaDB, Redis cache, data aggregation |
| **OCR Document Extraction Service** | FastAPI | OCR, trích xuất text từ hình ảnh, PDF | Port: 8011, DB: MariaDB, OCR engines (Tesseract, Google Vision) |
| **File Storage Asset Service** | FastAPI | Lưu trữ file, quản lý assets, malware scanning | Port: 8012, DB: MariaDB, S3/Filebase, virus scanning |
| **Audit Activity Log Service** | FastAPI | Ghi log hoạt động, audit trail, compliance | Port: 8013, DB: MariaDB, log aggregation, search |
| **Integration Connectors Service** | FastAPI | Tích hợp hệ thống bên ngoài, APIs, webhooks | Port: 8014, DB: MariaDB, third-party integrations |
| **Batch ETL Service** | FastAPI | Xử lý dữ liệu hàng loạt, ETL pipelines | Port: 8015, DB: MariaDB, data processing, scheduling |
| **Health Monitoring Agent** | FastAPI | Giám sát sức khỏe service, metrics, alerting | Port: 8016, DB: MariaDB, Prometheus, Grafana |
| **AI Processing Service** | FastAPI | Xử lý AI, machine learning, document analysis | Port: 8017, DB: MariaDB, Gemini AI, model inference |
| **General File Management Service** | FastAPI | Quản lý file tổng quát, metadata, organization | Port: 8018, DB: MariaDB, file categorization, search |

## Công nghệ sử dụng

### Backend Frameworks
- **Spring Boot (Java)**: 2 services
  - Authentication Identity Service
  - Contract Management Service
- **FastAPI (Python)**: 16 services
  - User Management Service
  - Versioning Document History Service
  - Commenting Collaboration Service
  - Approval Workflow Service
  - Reminder Scheduler Service
  - E-Signature Integration Service
  - Notification Service
  - Reporting Analytics Service
  - OCR Document Extraction Service
  - File Storage Asset Service
  - Audit Activity Log Service
  - Integration Connectors Service
  - Batch ETL Service
  - Health Monitoring Agent
  - AI Processing Service
  - General File Management Service
- **Next.js (Node.js)**: 1 service
  - API Gateway BFF

### Cơ sở dữ liệu
- **MariaDB**: Database chính cho tất cả services
- **Redis**: Cache, session storage, rate limiting
- **S3/Filebase**: File storage và assets

### Message Queue & Integration
- **Kafka**: Event streaming cho Contract Management Service
- **WebSocket**: Real-time notifications
- **REST APIs**: Giao tiếp giữa các services

### AI & Machine Learning
- **Google Gemini AI**: Document processing, text extraction
- **OCR Engines**: Tesseract, Google Vision API
- **Custom ML Models**: Document classification, analysis

### Monitoring & Observability
- **Prometheus**: Metrics collection
- **Grafana**: Visualization và dashboards
- **Health Checks**: Service health monitoring

### Security & Authentication
- **JWT Tokens**: Stateless authentication
- **OAuth 2.0**: Third-party authentication
- **Role-based Access Control (RBAC)**: Phân quyền người dùng
- **API Rate Limiting**: Bảo vệ API endpoints

## Kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/Vue)                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                API Gateway BFF (Next.js)                    │
│                         Port: 8000                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Load Balancer                            │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Microservices Layer                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Auth Service│ │ User Mgmt   │ │ Contract    │          │
│  │ (Spring)    │ │ (FastAPI)   │ │ (Spring)    │          │
│  │ Port: 8001  │ │ Port: 8002  │ │ Port: 8003  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Versioning  │ │ Commenting  │ │ Approval    │          │
│  │ (FastAPI)   │ │ (FastAPI)   │ │ (FastAPI)   │          │
│  │ Port: 8004  │ │ Port: 8005  │ │ Port: 8006  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Reminder    │ │ E-Signature │ │ Notification│          │
│  │ (FastAPI)   │ │ (FastAPI)   │ │ (FastAPI)   │          │
│  │ Port: 8007  │ │ Port: 8008  │ │ Port: 8009  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Reporting   │ │ OCR Service │ │ File Storage│          │
│  │ (FastAPI)   │ │ (FastAPI)   │ │ (FastAPI)   │          │
│  │ Port: 8010  │ │ Port: 8011  │ │ Port: 8012  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Audit Log   │ │ Integration │ │ Batch ETL   │          │
│  │ (FastAPI)   │ │ (FastAPI)   │ │ (FastAPI)   │          │
│  │ Port: 8013  │ │ Port: 8014  │ │ Port: 8015  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │ Health      │ │ AI          │ │ General     │          │
│  │ Monitoring  │ │ Processing  │ │ File Mgmt   │          │
│  │ (FastAPI)   │ │ (FastAPI)   │ │ (FastAPI)   │          │
│  │ Port: 8016  │ │ Port: 8017  │ │ Port: 8018  │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Data Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐          │
│  │   MariaDB   │ │    Redis    │ │ S3/Filebase │          │
│  │  (Primary)  │ │   (Cache)   │ │ (Storage)   │          │
│  └─────────────┘ └─────────────┘ └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

## Quy tắc thiết kế

### 1. API Design
- **Base URL**: `/api/v1/{service-name}/...`
- **Response Format**: Chuẩn hóa `RestResponse<T>` cho tất cả services
- **Error Handling**: Global exception handler với HTTP status codes chuẩn
- **Documentation**: OpenAPI/Swagger tại `/docs#/` cho mọi service

### 2. Database Design
- **Multi-tenancy**: Hỗ trợ nhiều tenant với `system_id`
- **Soft Delete**: Sử dụng `is_deleted` và `deleted_at` thay vì xóa thật
- **Audit Trail**: Ghi log mọi thay đổi với `created_by`, `updated_by`, `created_at`, `updated_at`
- **Versioning**: Hỗ trợ version control cho documents và contracts

### 3. Security
- **Authentication**: JWT tokens với expiration
- **Authorization**: Role-based access control (RBAC)
- **Rate Limiting**: Bảo vệ API endpoints
- **Input Validation**: Validate tất cả input data
- **SQL Injection Protection**: Sử dụng prepared statements

### 4. Performance
- **Caching**: Redis cache cho data thường xuyên truy cập
- **Connection Pooling**: Database connection pooling
- **Async Processing**: Xử lý bất đồng bộ cho heavy operations
- **Load Balancing**: Distribute load giữa các service instances

### 5. Monitoring & Observability
- **Health Checks**: Endpoint `/health` cho mọi service
- **Metrics**: Prometheus metrics collection
- **Logging**: Structured logging với correlation IDs
- **Tracing**: Distributed tracing cho request flows

## Deployment & DevOps

### Containerization
- **Docker**: Mọi service đều có Dockerfile
- **Docker Compose**: Development environment setup
- **Multi-stage builds**: Optimize image sizes

### CI/CD Pipeline
- **Automated Testing**: Unit tests, integration tests
- **Code Quality**: Linting, formatting, security scanning
- **Automated Deployment**: Staging và production deployment
- **Rollback Strategy**: Quick rollback khi có vấn đề

### Environment Management
- **Configuration**: Environment-specific configs
- **Secrets Management**: Secure handling of sensitive data
- **Feature Flags**: Toggle features without deployment

## Scalability & Reliability

### Horizontal Scaling
- **Stateless Services**: Có thể scale horizontally
- **Load Balancing**: Distribute traffic across instances
- **Auto-scaling**: Scale based on metrics

### Fault Tolerance
- **Circuit Breaker**: Prevent cascade failures
- **Retry Logic**: Exponential backoff retry
- **Fallback Mechanisms**: Graceful degradation

### Data Consistency
- **Eventual Consistency**: Acceptable for most use cases
- **Saga Pattern**: Distributed transactions
- **CQRS**: Command Query Responsibility Segregation

## Future Enhancements

### Planned Features
- **GraphQL API**: Flexible data querying
- **gRPC**: High-performance inter-service communication
- **Event Sourcing**: Complete audit trail
- **Machine Learning**: Advanced document analysis
- **Blockchain Integration**: Immutable contract storage

### Technology Upgrades
- **Kubernetes**: Container orchestration
- **Service Mesh**: Istio for advanced networking
- **Observability**: Jaeger, Zipkin for tracing
- **Security**: OAuth 2.1, OpenID Connect

---

*Tài liệu này được cập nhật lần cuối: [Ngày hiện tại]*
*Phiên bản: 1.0.0*
