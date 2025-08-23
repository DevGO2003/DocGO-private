# Contract Management Service - Hướng dẫn chạy

## Tổng quan
Contract Management Service là một microservice Spring Boot quản lý hợp đồng với các tính năng CRUD, phân trang, sắp xếp và tìm kiếm.

## Yêu cầu hệ thống
- Java 17 hoặc cao hơn
- Maven 3.6+
- MariaDB 11.2+
- Docker (tùy chọn)

## Cách 1: Chạy trực tiếp với Maven

### 1. Cài đặt dependencies
```bash
mvn clean install
```

### 2. Cấu hình database
Tạo file `.env` từ `env_example.txt`:
```bash
# Windows PowerShell
Copy-Item env_example.txt .env -Force

# Linux/Mac
cp env_example.txt .env
```

Cập nhật thông tin database trong file `.env`:
```properties
SPRING_DATASOURCE_URL=jdbc:mariadb://localhost:3306/docgo_contract_service
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=your_password_here
```

### 3. Khởi động MariaDB
```bash
# Sử dụng Docker
docker run -d --name mariadb-contract \
  -e MYSQL_ROOT_PASSWORD=your_password_here \
  -e MYSQL_DATABASE=docgo_contract_service \
  -p 3306:3306 \
  mariadb:11.2

# Hoặc cài đặt MariaDB locally
```

### 4. Chạy ứng dụng
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

### Query Parameters cho phân trang
- `pageNumber` (mặc định: 0)
- `pageSize` (mặc định: 10)
- `sortBy` - Danh sách trường sắp xếp
- `sortDirection` - Hướng sắp xếp (ASC/DESC)
- `searchTerm` - Từ khóa tìm kiếm
- `includeDeleted` - Bao gồm bản ghi đã xóa (mặc định: false)

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

## Troubleshooting

### Lỗi kết nối database
- Kiểm tra MariaDB đã chạy chưa
- Kiểm tra thông tin kết nối trong `.env`
- Đảm bảo database `docgo_contract_service` đã được tạo

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

### Health Check
```
GET http://localhost:8003/actuator/health
```

### Metrics
```
GET http://localhost:8003/actuator/metrics
```

