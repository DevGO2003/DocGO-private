# Docker Development Guide - DocGO

## Tổng quan

Hướng dẫn này mô tả cách chạy toàn bộ service backend của DocGO bằng Docker với **volume mount**, nghĩa là code được sync trực tiếp từ máy host vào container. Điều này cho phép:

- **Hot reload**: Code thay đổi trên máy host được reflect ngay trong container
- **Phát triển nhanh**: Không cần rebuild image mỗi khi sửa code
- **Dễ debug**: Có thể sửa code trực tiếp trên máy host

## Cấu trúc file

```
DocGO/
├── autofiles/                  # Thư mục chứa tất cả file Docker và script
│   ├── docker-compose.yml      # Production mode (build context)
│   ├── docker-compose.dev.yml  # Development mode (volume mount) ⭐
│   ├── docker-dev.bat         # Script Windows Batch
│   ├── docker-dev.ps1         # Script PowerShell
│   └── Docker_Development_Guide.md # Hướng dẫn này
├── backend/                    # Các microservice backend
├── frontend/                   # Frontend applications
└── database/                   # Database scripts
```

## Cách sử dụng

### 1. Chạy nhanh (Windows)

```bash
# Sử dụng script Batch
docker-dev.bat

# Hoặc PowerShell
.\docker-dev.ps1
```

### 2. Chạy thủ công

```bash
# Khởi động tất cả service
docker-compose -f autofiles/docker-compose.dev.yml up -d

# Xem trạng thái
docker-compose -f autofiles/docker-compose.dev.yml ps

# Xem logs
docker-compose -f autofiles/docker-compose.dev.yml logs -f

# Dừng tất cả
docker-compose -f autofiles/docker-compose.dev.yml down
```

## Ports và Services

| Service | Port | URL | Mô tả |
|---------|------|-----|-------|
| **API Gateway BFF** | 8000 | http://localhost:8000 | Next.js BFF service |
| **Authentication Service** | 8001 | http://localhost:8001 | Spring Boot Auth |
| **User Management** | 8002 | http://localhost:8002 | FastAPI User service |
| **Contract Management** | 8003 | http://localhost:8003 | Spring Boot Contract |
| **AI Processing** | 8017 | http://localhost:8017 | FastAPI AI service |
| **File Storage** | 8012 | http://localhost:8012 | FastAPI File service |
| **Frontend Web** | 3000 | http://localhost:3000 | React + Vite |
| **Database** | 3306 | localhost:3306 | MariaDB |
| **Redis** | 6379 | localhost:6379 | Cache & Session |

## Volume Mount Configuration

### Code Mount
```yaml
volumes:
  - ./backend/service-name:/app  # Mount code từ máy host
  - /app/node_modules            # Exclude node_modules (Node.js)
```

### Data Persistence
```yaml
volumes:
  mariadb_data_dev:              # Database data
  redis_data_dev:                # Redis data
  ai_processing_results_dev:     # AI results
  file_storage_uploads_dev:      # File uploads
  file_storage_temp_dev:         # Temporary files
```

## Development Workflow

### 1. Khởi động lần đầu
```bash
# Chạy script
.\autofiles\docker-dev.bat

# Hoặc thủ công
docker-compose -f autofiles/docker-compose.dev.yml up -d
```

### 2. Phát triển code
- Sửa code trực tiếp trên máy host
- Code thay đổi được sync ngay vào container
- Service tự động reload (nếu có hot reload)

### 3. Xem logs và debug
```bash
# Xem logs tất cả service
docker-compose -f autofiles/docker-compose.dev.yml logs -f

# Xem logs service cụ thể
docker-compose -f autofiles/docker-compose.dev.yml logs -f api-gateway-bff
docker-compose -f autofiles/docker-compose.dev.yml logs -f authentication-identity-service
```

### 4. Dừng và cleanup
```bash
# Dừng tất cả service
docker-compose -f autofiles/docker-compose.dev.yml down

# Xóa containers và networks
docker system prune -f
```

## Troubleshooting

### Service không khởi động
```bash
# Kiểm tra logs
docker-compose -f autofiles/docker-compose.dev.yml logs [service-name]

# Kiểm tra trạng thái
docker-compose -f autofiles/docker-compose.dev.yml ps

# Restart service
docker-compose -f autofiles/docker-compose.dev.yml restart [service-name]
```

### Port conflict
```bash
# Kiểm tra port đang sử dụng
netstat -ano | findstr :8000

# Dừng service conflict
docker-compose -f autofiles/docker-compose.dev.yml down
```

### Database connection issues
```bash
# Kiểm tra MariaDB
docker-compose -f autofiles/docker-compose.dev.yml logs mariadb

# Restart database
docker-compose -f autofiles/docker-compose.dev.yml restart mariadb
```

## Lệnh hữu ích

### Quản lý containers
```bash
# Xem tất cả containers
docker ps -a

# Xem logs real-time
docker logs -f [container-name]

# Vào container
docker exec -it [container-name] /bin/bash

# Restart container
docker restart [container-name]
```

### Quản lý volumes
```bash
# Xem volumes
docker volume ls

# Xóa volume
docker volume rm [volume-name]

# Xóa tất cả volumes không sử dụng
docker volume prune
```

### Quản lý networks
```bash
# Xem networks
docker network ls

# Xem network details
docker network inspect docgo_network_dev

# Xóa network
docker network rm [network-name]
```

## So sánh với Production Mode

| Tính năng | Development Mode | Production Mode |
|-----------|------------------|-----------------|
| **Code Mount** | Volume mount (hot reload) | Build vào image |
| **Performance** | Chậm hơn do volume mount | Nhanh hơn |
| **Development** | Tốt cho phát triển | Tốt cho production |
| **Hot Reload** | Có | Không |
| **Build Time** | Không cần | Cần build image |

## Lưu ý quan trọng

1. **Không commit file `.env`** chứa secrets
2. **Sử dụng `.env.example`** làm template
3. **Kiểm tra ports** trước khi chạy
4. **Backup database** trước khi test
5. **Cleanup containers** định kỳ để tiết kiệm disk

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs của service
2. Kiểm tra Docker và Docker Compose version
3. Kiểm tra ports và networks
4. Restart Docker Desktop nếu cần
5. Xóa và tạo lại containers

---

**Happy Coding! 🚀**
