# Contract Management Service - Hướng dẫn chạy

## Tổng quan
Contract Management Service là một microservice Spring Boot quản lý hợp đồng với các tính năng CRUD, phân trang, sắp xếp, tìm kiếm và **xử lý file upload tự động bằng AI**.

## Tính năng mới
- **File Upload & AI Processing**: Upload file và tự động phát hiện, xử lý hợp đồng bằng AI
- **Kafka Integration**: Giao tiếp với các service khác qua Kafka để xử lý AI
- **Contract Summary**: Lưu trữ thông tin tóm tắt hợp đồng (loại, rủi ro, điều khoản chính)
- **Smart Processing**: Tự động phân loại file và xử lý theo loại

## Yêu cầu hệ thống
- Java 17 hoặc cao hơn
- Maven 3.6+
- MariaDB 11.2+
- **Kafka 3.0+** (bắt buộc cho tính năng AI processing)
- Docker (tùy chọn)

## Cách 1: Chạy trực tiếp với Maven

### 1. Cài đặt dependencies
```bash
mvn clean install
```

### 2. Cấu hình database
Tạo file `.env` từ `env.example`:
```bash
# Windows PowerShell
Copy-Item env.example .env -Force

# Linux/Mac
cp env.example .env
```

Cập nhật thông tin database trong file `.env`:
```properties
DB_HOST=localhost
DB_PORT=3306
DB_NAME=docgo_contract_service
DB_USERNAME=root
DB_PASSWORD=your_password_here
```

### 3. Cấu hình Kafka
Đảm bảo Kafka đang chạy và cập nhật cấu hình trong `application.properties`:
```properties
spring.kafka.bootstrap-servers=localhost:9092
app.kafka.topic.contract-processing=contract-processing-requests
app.kafka.topic.callback=contract-processing-results
```

### 4. Khởi động MariaDB
```bash
# Sử dụng Docker
docker run -d --name mariadb-contract \
  -e MYSQL_ROOT_PASSWORD=your_password_here \
  -e MYSQL_DATABASE=docgo_contract_service \
  -p 3306:3306 \
  mariadb:11.2

# Hoặc cài đặt MariaDB locally
```

### 5. Khởi động Kafka
```bash
# Sử dụng Docker
docker run -d --name kafka \
  -p 9092:9092 \
  -e KAFKA_CFG_NODE_ID=0 \
  -e KAFKA_CFG_PROCESS_ROLES=controller,broker \
  -e KAFKA_CFG_LISTENERS=PLAINTEXT://:9092,CONTROLLER://:9093 \
  -e KAFKA_CFG_LISTENER_SECURITY_PROTOCOL_MAP=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT \
  -e KAFKA_CFG_CONTROLLER_LISTENER_NAMES=CONTROLLER \
  -e KAFKA_CFG_INTER_BROKER_LISTENER_NAME=PLAINTEXT \
  -e KAFKA_CFG_CONTROLLER_QUORUM_VOTERS=0@kafka:9093 \
  -e KAFKA_CFG_LOG_DIRS=/tmp/kraft-combined-logs \
  -e KAFKA_CFG_OFFSETS_TOPIC_REPLICATION_FACTOR=1 \
  -e KAFKA_CFG_TRANSACTION_STATE_LOG_REPLICATION_FACTOR=1 \
  -e KAFKA_CFG_TRANSACTION_STATE_LOG_MIN_ISR=1 \
  confluentinc/cp-kafka:7.4.0

# Hoặc sử dụng docker-compose
cd autofiles
docker-compose -f docker-compose.dev.yml up kafka
```

### 6. Cập nhật database schema
Chạy script SQL để cập nhật schema:
```sql
-- Chạy file database/update_contract_schema.sql
-- Hoặc để Hibernate tự động tạo (spring.jpa.hibernate.ddl-auto=update)
```

### 7. Chạy ứng dụng
```bash
mvn spring-boot:run
```

Ứng dụng sẽ chạy tại: http://localhost:8003
API Documentation: http://localhost:8003/docs

## Cách 2: Chạy với Docker

### 1. Build Docker image
```bash
# Sử dụng script có sẵn
cd autofiles
./build-contract-service.bat  # Windows
./build-contract-service.ps1  # PowerShell

# Hoặc build thủ công
cd backend/contract-management-service
docker build -t docgo-contract-service:latest .
```

### 2. Chạy với docker-compose (khuyến nghị)
```bash
cd autofiles
docker-compose -f docker-compose.dev.yml up contract-management-service
```

### 3. Chạy standalone
```bash
docker run -p 8003:8003 \
  -e SPRING_DATASOURCE_URL=jdbc:mariadb://host.docker.internal:3306/docgo_contract_service \
  -e SPRING_DATASOURCE_USERNAME=root \
  -e SPRING_DATASOURCE_PASSWORD=your_password_here \
  -e SPRING_KAFKA_BOOTSTRAP_SERVERS=host.docker.internal:9092 \
  --name contract-service \
  docgo-contract-service:latest
```

## API Endpoints

### Base URL
```
http://localhost:8003/api/v1/contract-management-service
```

### Các endpoint chính
- `POST /contracts` - Tạo hợp đồng mới
- `GET /contracts` - Lấy danh sách hợp đồng (có phân trang)
- `GET /contracts/{id}` - Lấy chi tiết hợp đồng
- `PUT /contracts/{id}` - Cập nhật hợp đồng
- `DELETE /contracts/{id}` - Xóa mềm hợp đồng
- `PUT /contracts/{id}/restore` - Khôi phục hợp đồng
- `GET /contracts/{id}/events` - Lấy lịch sử sự kiện
- `GET /contracts/{id}/attachments` - Lấy file đính kèm

### **API File Upload mới**
- `POST /files/upload` - Upload file và xử lý hợp đồng
- `GET /files/{fileId}/status` - Kiểm tra trạng thái xử lý file

### Query Parameters cho phân trang
- `pageNumber` (mặc định: 0)
- `pageSize` (mặc định: 10)
- `sortBy` - Danh sách trường sắp xếp
- `sortDirection` - Hướng sắp xếp (ASC/DESC)
- `searchTerm` - Từ khóa tìm kiếm
- `includeDeleted` - Bao gồm bản ghi đã xóa (mặc định: false)

## Luồng xử lý File Upload

### 1. Upload file
```
Frontend → POST /files/upload → Contract Service
```

### 2. Phân loại file
- Nếu `isContract=true`: Gửi yêu cầu xử lý AI qua Kafka
- Nếu `isContract=false`: Chỉ lưu file, không xử lý AI

### 3. Xử lý AI (nếu là hợp đồng)
```
Contract Service → Kafka → AI Processing Service → Kafka → Contract Service
```

### 4. Tạo hợp đồng
- Tự động tạo hợp đồng với thông tin tóm tắt từ AI
- Cập nhật trạng thái xử lý

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
  "path": "/api/v1/contract-management-service/contracts"
}
```

## Kafka Topics

### Producer Topics
- `contract-processing-requests`: Gửi yêu cầu xử lý hợp đồng

### Consumer Topics
- `contract-processing-results`: Nhận kết quả xử lý từ AI service

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MariaDB đã chạy chưa
- Kiểm tra thông tin kết nối trong `.env`
- Đảm bảo database `docgo_contract_service` đã được tạo

### Lỗi kết nối Kafka
- Kiểm tra Kafka đã chạy chưa: `docker ps | grep kafka`
- Kiểm tra cấu hình bootstrap servers
- Kiểm tra topics đã được tạo chưa

### Lỗi port đã sử dụng
- Thay đổi port trong `application.properties`
- Hoặc dừng service đang chạy trên port 8003

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
- `SERVER_PORT` - Port ứng dụng (mặc định: 8003)
- `SPRING_KAFKA_BOOTSTRAP_SERVERS` - Kafka servers production

### Health Check
```
GET http://localhost:8003/actuator/health
```

### Metrics
```
GET http://localhost:8003/actuator/metrics
```

