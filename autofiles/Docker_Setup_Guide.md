# DocGO - Docker Setup Guide

## Tổng quan

Tài liệu này hướng dẫn cách thiết lập và chạy toàn bộ hệ thống DocGO bằng Docker. Hệ thống bao gồm 7 microservice chính và các dịch vụ hỗ trợ.

## Yêu cầu hệ thống

- **Docker Desktop** (Windows/Mac) hoặc **Docker Engine** (Linux)
- **Docker Compose** (thường đi kèm với Docker Desktop)
- **RAM tối thiểu**: 8GB (khuyến nghị 16GB)
- **Dung lượng ổ cứng**: ít nhất 10GB trống
- **Ports cần thiết**: 3000, 8000-8003, 8012, 8017, 3306, 6379

## Cấu trúc Docker

### Microservices

| Service | Port | Technology | Base Image |
|---------|------|------------|------------|
| Frontend Web | 3000 | Vite + React | Node.js 18 Alpine |
| API Gateway BFF | 8000 | Next.js | Node.js 18 Alpine |
| Authentication Service | 8001 | Spring Boot | OpenJDK 21 |
| User Management Service | 8002 | FastAPI | Python 3.11 |
| Contract Management Service | 8003 | Spring Boot | OpenJDK 24 |
| File Storage Service | 8012 | FastAPI | Python 3.11 |
| AI Processing Service | 8017 | FastAPI | Python 3.11 |

### Dịch vụ hỗ trợ

| Service | Port | Image |
|---------|------|-------|
| MariaDB | 3306 | mariadb:11.2 |
| Redis | 6379 | redis:7-alpine |

## Cách sử dụng

### 1. Build và chạy tự động (Khuyến nghị)

#### Windows (Batch)
```bash
# Chạy script batch
docker-build-and-run.bat
```

#### Windows (PowerShell)
```powershell
# Chạy script PowerShell
.\docker-build-and-run.ps1
```

#### Linux/Mac
```bash
# Chạy script bash
chmod +x docker-build-and-run.sh
./docker-build-and-run.sh
```

### 2. Build và chạy thủ công

#### Bước 1: Build tất cả images
```bash
# Build từng service
docker build -t docgo/api-gateway-bff:latest ./backend/api-gateway-bff
docker build -t docgo/auth-service:latest ./backend/authentication-identity-service
docker build -t docgo/user-management-service:latest ./backend/user-management-service
docker build -t docgo/contract-service:latest ./backend/contract-management-service
docker build -t docgo/ai-processing-service:latest ./backend/ai-processing-service
docker build -t docgo/file-storage-service:latest ./backend/file-storage-asset-service
docker build -t docgo/frontend-web:latest ./frontend/web
```

#### Bước 2: Khởi chạy hệ thống
```bash
# Khởi chạy tất cả services
docker-compose up -d

# Hoặc khởi chạy từng service
docker-compose up -d mariadb redis
docker-compose up -d api-gateway-bff
docker-compose up -d authentication-identity-service
docker-compose up -d user-management-service
docker-compose up -d contract-management-service
docker-compose up -d ai-processing-service
docker-compose up -d file-storage-asset-service
docker-compose up -d frontend-web
```

### 3. Quản lý services

#### Xem trạng thái
```bash
# Xem trạng thái tất cả containers
docker-compose ps

# Xem logs
docker-compose logs -f

# Xem logs của service cụ thể
docker-compose logs -f api-gateway-bff
```

#### Dừng và khởi động lại
```bash
# Dừng tất cả services
docker-compose down

# Dừng và xóa volumes
docker-compose down -v

# Khởi động lại service cụ thể
docker-compose restart api-gateway-bff
```

#### Cập nhật service
```bash
# Cập nhật service cụ thể
docker-compose pull api-gateway-bff
docker-compose up -d api-gateway-bff

# Cập nhật tất cả services
docker-compose pull
docker-compose up -d
```

## Cấu hình môi trường

### Biến môi trường chính

#### Database
- `MYSQL_ROOT_PASSWORD`: sapassword
- `MYSQL_DATABASE`: docgo
- `MYSQL_USER`: docgo_user
- `MYSQL_PASSWORD`: docgo_password

#### Ports
- Frontend: 3000
- API Gateway: 8000
- Auth Service: 8001
- User Service: 8002
- Contract Service: 8003
- File Storage: 8012
- AI Processing: 8017
- MariaDB: 3306
- Redis: 6379

### Volumes

| Volume | Mục đích |
|--------|----------|
| `mariadb_data` | Dữ liệu MariaDB |
| `redis_data` | Dữ liệu Redis |
| `ai_processing_results` | Kết quả xử lý AI |
| `file_storage_uploads` | File upload |
| `file_storage_temp` | File tạm thời |

## Troubleshooting

### Vấn đề thường gặp

#### 1. Port đã được sử dụng
```bash
# Kiểm tra port nào đang được sử dụng
netstat -ano | findstr :8000

# Dừng process sử dụng port
taskkill /PID <PID> /F
```

#### 2. Không đủ RAM
```bash
# Kiểm tra sử dụng RAM
docker stats

# Giảm memory limit trong docker-compose.yml
services:
  mariadb:
    deploy:
      resources:
        limits:
          memory: 1G
```

#### 3. Database connection failed
```bash
# Kiểm tra logs database
docker-compose logs mariadb

# Khởi động lại database
docker-compose restart mariadb
```

#### 4. Build failed
```bash
# Xóa cache Docker
docker system prune -a

# Build lại với no-cache
docker build --no-cache -t docgo/service:latest ./path/to/service
```

### Logs và Debug

#### Xem logs real-time
```bash
# Tất cả services
docker-compose logs -f

# Service cụ thể
docker-compose logs -f api-gateway-bff

# Theo thời gian
docker-compose logs --since="2024-01-01T00:00:00" api-gateway-bff
```

#### Debug container
```bash
# Vào container
docker exec -it docgo_api_gateway_bff /bin/sh

# Kiểm tra processes
docker exec docgo_api_gateway_bff ps aux

# Kiểm tra network
docker exec docgo_api_gateway_bff netstat -tulpn
```

## Tối ưu hóa

### Performance

#### 1. Resource limits
```yaml
services:
  mariadb:
    deploy:
      resources:
        limits:
          memory: 2G
          cpus: '1.0'
        reservations:
          memory: 1G
          cpus: '0.5'
```

#### 2. Multi-stage builds
```dockerfile
# Sử dụng multi-stage build để giảm kích thước image
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

#### 3. Health checks
```yaml
services:
  api-gateway-bff:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Security

#### 1. Non-root user
```dockerfile
# Tạo user không phải root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
```

#### 2. Secrets management
```yaml
services:
  auth-service:
    secrets:
      - db_password
      - jwt_secret

secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt
```

## Monitoring và Maintenance

### Health checks
```bash
# Kiểm tra health của tất cả services
docker-compose ps

# Kiểm tra resource usage
docker stats

# Kiểm tra disk usage
docker system df
```

### Backup và Restore

#### Database backup
```bash
# Backup MariaDB
docker exec docgo_mariadb mysqldump -u root -psapassword docgo > backup.sql

# Restore MariaDB
docker exec -i docgo_mariadb mysql -u root -psapassword docgo < backup.sql
```

#### Volume backup
```bash
# Backup volumes
docker run --rm -v docgo_mariadb_data:/data -v $(pwd):/backup alpine tar czf /backup/mariadb_backup.tar.gz -C /data .

# Restore volumes
docker run --rm -v docgo_mariadb_data:/data -v $(pwd):/backup alpine tar xzf /backup/mariadb_backup.tar.gz -C /data
```

## Kết luận

Docker setup này cung cấp môi trường development và production hoàn chỉnh cho DocGO. Với cấu hình này, bạn có thể:

- Chạy toàn bộ hệ thống với một lệnh
- Dễ dàng scale và deploy
- Quản lý dependencies và versions
- Backup và restore dữ liệu
- Monitor và debug hiệu quả

Để có thêm thông tin, hãy tham khảo:
- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Spring Boot Docker Guide](https://spring.io/guides/gs/spring-boot-docker/)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)
