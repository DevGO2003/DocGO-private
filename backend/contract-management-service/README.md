# Contract Management Service

## Tổng quan
Contract Management Service là microservice Spring Boot quản lý hợp đồng với tính năng **xử lý file upload tự động bằng AI** thông qua Kafka.

## Tính năng chính

### 1. Quản lý hợp đồng cơ bản
- CRUD operations cho hợp đồng
- Phân trang, sắp xếp, tìm kiếm
- Quản lý trạng thái hợp đồng
- Lịch sử sự kiện và file đính kèm

### 2. **File Upload & AI Processing (MỚI)**
- Upload file với multipart/form-data
- Tự động phát hiện loại file (PDF, DOCX, TXT)
- Phân loại file: hợp đồng hoặc tài liệu thường
- Gửi yêu cầu xử lý AI qua Kafka
- Nhận kết quả xử lý và tự động tạo hợp đồng

### 3. **Contract Summary & AI Insights (MỚI)**
- Tóm tắt hợp đồng tự động
- Phân loại loại hợp đồng
- Đánh giá mức độ rủi ro
- Trích xuất điều khoản chính
- Trạng thái xử lý AI

### 4. **Kafka Integration (MỚI)**
- Producer: Gửi yêu cầu xử lý hợp đồng
- Consumer: Nhận kết quả xử lý từ AI service
- Asynchronous processing
- Event-driven architecture

## Kiến trúc hệ thống

```
Frontend → Contract Service → Kafka → AI Processing Service
                ↓
            Database (MariaDB)
                ↓
            File Storage (Local)
```

## Luồng xử lý

### Upload file thường
1. Frontend gửi file với `isContract=false`
2. Contract Service lưu file và metadata
3. Trả về response thành công

### Upload file hợp đồng
1. Frontend gửi file với `isContract=true`
2. Contract Service lưu file và metadata
3. Gửi yêu cầu xử lý qua Kafka
4. AI Processing Service xử lý file
5. Gửi kết quả qua Kafka
6. Contract Service tạo hợp đồng với thông tin AI
7. Cập nhật trạng thái xử lý

## API Endpoints

### File Upload
- `POST /api/v1/contract-management-service/files/upload` - Upload file
- `GET /api/v1/contract-management-service/files/{fileId}/status` - Trạng thái xử lý

### Contract Management
- `POST /api/v1/contract-management-service/contracts` - Tạo hợp đồng
- `GET /api/v1/contract-management-service/contracts` - Danh sách hợp đồng
- `GET /api/v1/contract-management-service/contracts/{id}` - Chi tiết hợp đồng
- `PUT /api/v1/contract-management-service/contracts/{id}` - Cập nhật hợp đồng
- `DELETE /api/v1/contract-management-service/contracts/{id}` - Xóa hợp đồng

## Cấu hình

### Database
- MariaDB 11.2+
- Schema tự động cập nhật (Hibernate DDL)

### Kafka
- Bootstrap servers: localhost:9092
- Topics: `contract-processing-requests`, `contract-processing-results`
- Consumer group: `contract-service-group`

### File Upload
- Thư mục upload: `uploads/`
- Kích thước tối đa: 50MB
- Hỗ trợ: PDF, DOCX, TXT

## Chạy ứng dụng

### Yêu cầu
- Java 17+
- Maven 3.6+
- MariaDB 11.2+
- Kafka 3.0+

### Cách chạy
```bash
# 1. Cài đặt dependencies
mvn clean install

# 2. Cấu hình database và Kafka
# 3. Chạy ứng dụng
mvn spring-boot:run
```

Ứng dụng chạy tại: http://localhost:8003
API Documentation: http://localhost:8003/docs

## Development

### Cấu trúc project
```
src/main/java/com/devgo2003/docgo/contract_service/
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
- `SERVER_PORT=8003`

### Health Check
```
GET /actuator/health
```

### Monitoring
```
GET /actuator/metrics
```

## Troubleshooting

### Lỗi thường gặp
1. **Database connection**: Kiểm tra MariaDB và thông tin kết nối
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
- [MariaDB Documentation](https://mariadb.org/documentation/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)

## Liên hệ

- **Service**: Contract Management Service
- **Port**: 8003
- **Base URL**: `/api/v1/contract-management-service`
- **Documentation**: `/docs`
