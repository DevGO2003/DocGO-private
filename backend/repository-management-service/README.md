# Repository Management Service

## Tổng quan
Repository Management Service là microservice Spring Boot quản lý kho lưu trữ tài liệu với kiến trúc **8 sections v3 schema** và tích hợp **Kafka event-driven processing**.

## Tính năng chính

### 1. **8 Sections v3 Schema Architecture**
- **Overview**: Thông tin cơ bản (title, status, documentType, ownerUserId)
- **Metadata**: Thông tin file (mimeType, size, encoding, compression)
- **Contract**: Phân tích hợp đồng (parties, clauses, payment, risk)
- **Content**: Nội dung xử lý (extractedText, classification, summarization)
- **Storage**: Thông tin lưu trữ (S3, local, backup)
- **Security**: Bảo mật (encryption, access control, compliance)
- **Versioning**: Quản lý phiên bản (version, history, changes)
- **Audit**: Kiểm toán (createdAt, updatedAt, createdBy, isDeleted)

### 2. **Event-Driven Processing**
- **FILE_UPLOAD_COMPLETED**: Tạo skeleton với defaults
- **FILE_CONTENT_EXTRACTED**: Deep merge content section
- **CONTRACT_SUMMARY_GENERATED**: Deep merge contract section (conditional)
- Idempotency handling với ProcessedEventEntity
- Deep merge utilities cho 8 sections

### 3. **REST API Management**
- CRUD operations cho files
- Pagination, sorting, filtering
- Soft delete và restore functionality
- Comprehensive validation
- Standardized RestResponse format

### 4. **Kafka Integration**
- Consumer: Nhận events từ automation-service
- Event routing và processing
- Error handling và retry logic
- Correlation ID tracking

## Kiến trúc hệ thống

```
Frontend → API Gateway → Repository Service → MongoDB Atlas
                ↓
            Kafka Events ← Automation Service
```

## Luồng xử lý Event

### Event 1: FILE_UPLOAD_COMPLETED
1. Automation Service upload file lên S3
2. Gửi event FILE_UPLOAD_COMPLETED qua Kafka
3. Repository Service nhận event
4. Tạo skeleton FileEntity với status="UPLOADED"
5. Lưu vào MongoDB

### Event 2: FILE_CONTENT_EXTRACTED
1. Automation Service xử lý file và trích xuất nội dung
2. Gửi event FILE_CONTENT_EXTRACTED qua Kafka
3. Repository Service nhận event
4. Deep merge content section vào FileEntity
5. Cập nhật status="PROCESSED"

### Event 3: CONTRACT_SUMMARY_GENERATED (Conditional)
1. Nếu file là hợp đồng, Automation Service phân tích
2. Gửi event CONTRACT_SUMMARY_GENERATED qua Kafka
3. Repository Service nhận event
4. Deep merge contract section vào FileEntity
5. Cập nhật contract analysis data

## API Endpoints

### File Management
- `GET /api/v1/repository-management-service/files` - Danh sách files với phân trang
- `GET /api/v1/repository-management-service/files/{id}` - Chi tiết file
- `POST /api/v1/repository-management-service/files` - Tạo file mới
- `PUT /api/v1/repository-management-service/files/{id}` - Cập nhật file
- `DELETE /api/v1/repository-management-service/files/{id}` - Xóa file (soft delete)
- `PUT /api/v1/repository-management-service/files/{id}/restore` - Khôi phục file

### Health Check
- `GET /actuator/health` - Kiểm tra trạng thái service
- `GET /actuator/info` - Thông tin service

### Documentation
- `GET /docs` - Swagger UI documentation

## Cấu hình

### Database
- **MongoDB Atlas**: Primary database
- **Collection**: `files` (FileEntity documents)
- **Indexes**: Tự động tạo cho performance
- **Connection**: Sử dụng MONGODB_ATLAS_URI từ .env

### Kafka
- **Bootstrap servers**: kafka:9092 (Docker) / localhost:9092 (Local)
- **Topics**: `docgo-file-events`
- **Consumer group**: `docgo-repo-events-v1`
- **Event types**: FILE_UPLOAD_COMPLETED, FILE_CONTENT_EXTRACTED, CONTRACT_SUMMARY_GENERATED

### Service Configuration
- **Port**: 8002
- **Context path**: `/`
- **Documentation**: `/docs`
- **Health check**: `/actuator/health`

## Chạy ứng dụng

### Yêu cầu
- Java 17+
- Maven 3.6+
- MongoDB Atlas (MONGODB_ATLAS_URI trong .env)
- Kafka 3.0+

### Cách chạy
```bash
# 1. Cài đặt dependencies
mvn clean install

# 2. Cấu hình environment variables
cp .env.example .env
# Chỉnh sửa .env với MONGODB_ATLAS_URI

# 3. Chạy ứng dụng
mvn spring-boot:run
```

**URLs:**
- Service: http://localhost:8002
- API Documentation: http://localhost:8002/docs
- Health Check: http://localhost:8002/actuator/health

## Cấu trúc Response

Tất cả API đều trả về response theo format chuẩn:
```json
{
  "apiVersion": "v1",
  "statusCode": 200,
  "shortMessage": "Success",
  "description": "Mô tả kết quả",
  "data": {...},
  "timestamp": "2025-08-23T10:00:00Z",
  "requestId": "uuid-string",
  "path": "/api/v1/repository-management-service/contracts"
}
```

## Kafka Topics

### Producer Topics
- `contract-processing-requests`: Gửi yêu cầu xử lý hợp đồng

### Consumer Topics
- `contract-processing-results`: Nhận kết quả xử lý từ AI service

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MongoDB Atlas connection string
- Kiểm tra thông tin kết nối trong `.env`
- Đảm bảo database MongoDB đã được tạo và accessible

### Lỗi kết nối Kafka
- Kiểm tra Kafka đã chạy chưa: `docker ps | grep kafka`
- Kiểm tra cấu hình bootstrap servers
- Kiểm tra topics đã được tạo chưa

### Lỗi port đã sử dụng
- Thay đổi port trong `application.properties`
- Hoặc dừng service đang chạy trên port 8002

### Lỗi Docker build
- Đảm bảo Docker đã cài đặt và chạy
- Kiểm tra Dockerfile có lỗi syntax không
- Xóa image cũ: `docker rmi docgo-contract-service:latest`

## Development

### Hot reload
Khi chạy với Maven, ứng dụng sẽ tự động reload khi có thay đổi code nhờ Spring Boot DevTools.

### Logs
Logs được cấu hình trong `application.properties`:
- Spring Framework: INFO
- Contract Service: DEBUG
- Kafka: DEBUG (khi cần debug)

### Testing
```bash
mvn test
```

## Production Deployment

### Environment Variables
- `SPRING_PROFILES_ACTIVE=production`
- `SPRING_DATASOURCE_URL` - URL database production
- `SPRING_DATASOURCE_USERNAME` - Username database
- `SPRING_DATASOURCE_PASSWORD` - Password database
- `SERVER_PORT` - Port ứng dụng (mặc định: 8002)
- `SPRING_KAFKA_BOOTSTRAP_SERVERS` - Kafka servers production

### Health Check
```
GET http://localhost:8002/api/v1/repository-management-service/health
```

### Metrics
```
GET http://localhost:8002/actuator/metrics
```

## Development

### Cấu trúc project
```
src/main/java/com/devgo2003/docgo/document_service/
├── controller/          # REST controllers
├── service/            # Business logic
├── repository/         # Data access
├── entity/            # JPA entities
├── model/             # DTOs
├── config/            # Configuration
└── common/            # Shared components
```

### Hot reload
Spring Boot DevTools hỗ trợ hot reload khi development.

### Testing
```bash
mvn test
```

## Production

### Environment Variables
- `SPRING_PROFILES_ACTIVE=production`
- `SPRING_DATASOURCE_URL`
- `SPRING_KAFKA_BOOTSTRAP_SERVERS`
- `SERVER_PORT=8002`

### Health Check
```
GET /api/v1/repository-management-service/health
```

### Monitoring
```
GET /actuator/metrics
```

## Troubleshooting

### Lỗi thường gặp
1. **Database connection**: Kiểm tra MongoDB Atlas và thông tin kết nối
2. **Kafka connection**: Kiểm tra Kafka server và topics
3. **File upload**: Kiểm tra quyền ghi thư mục upload
4. **Port conflict**: Thay đổi port trong application.properties

### Logs
- Spring Framework: INFO
- Contract Service: DEBUG
- Kafka: DEBUG (khi cần)

## Tài liệu tham khảo

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Kafka Documentation](https://spring.io/projects/spring-kafka)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)

## Liên hệ

- **Service**: Repository Management Service
- **Port**: 8002
- **Base URL**: `/api/v1/repository-management-service`
- **Documentation**: `/docs`
