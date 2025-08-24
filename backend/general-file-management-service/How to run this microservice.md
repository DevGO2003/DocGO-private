# Hướng dẫn chạy General File Management Service

## Yêu cầu hệ thống

- Python 3.11+
- MariaDB/MySQL
- Redis (tùy chọn)
- Elasticsearch (tùy chọn)

## Bước 1: Cài đặt dependencies

```bash
# Tạo virtual environment
python -m venv venv

# Kích hoạt virtual environment
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt
```

## Bước 2: Cấu hình môi trường

```bash
# Copy file môi trường
cp env.example .env

# Chỉnh sửa .env với thông tin thực tế
# Đặc biệt là database connection string
```

## Bước 3: Khởi tạo database

```sql
-- Tạo database
CREATE DATABASE docgo_general_file_service
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo bảng files
CREATE TABLE files (
    file_id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type ENUM('pdf', 'docx', 'txt', 'image', 'spreadsheet', 'presentation', 'other') NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status ENUM('active', 'archived', 'deleted', 'processing') NOT NULL DEFAULT 'active',
    file_path VARCHAR(500) NOT NULL,
    checksum VARCHAR(32) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    system_id VARCHAR(50) NOT NULL,
    version INT DEFAULT 1,
    INDEX idx_filename (filename),
    INDEX idx_category (file_type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Tạo bảng file_metadata
CREATE TABLE file_metadata (
    id VARCHAR(36) PRIMARY KEY,
    file_id VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    tags JSON,
    category VARCHAR(100),
    author VARCHAR(100),
    keywords JSON,
    custom_fields JSON,
    FOREIGN KEY (file_id) REFERENCES files(file_id) ON DELETE CASCADE,
    INDEX idx_file_id (file_id),
    INDEX idx_category (category),
    INDEX idx_author (author)
);

-- Tạo bảng categories
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_name (name),
    INDEX idx_parent_id (parent_id)
);
```

## Bước 4: Chạy service

### Development mode
```bash
# Chạy với auto-reload
uvicorn main:app --host 0.0.0.0 --port 8018 --reload
```

### Production mode
```bash
# Chạy production server
uvicorn main:app --host 0.0.0.0 --port 8018 --workers 4
```

## Bước 5: Kiểm tra service

### Health check
```bash
curl http://localhost:8018/health
```

### API documentation
Mở trình duyệt và truy cập: http://localhost:8018/docs

## Docker

### Build image
```bash
docker build -t general-file-management-service .
```

### Run container
```bash
# Development với volume mount
docker run -d \
  --name general-file-management-service \
  -p 8018:8018 \
  -v $(pwd):/app \
  -e DATABASE_HOST=host.docker.internal \
  general-file-management-service

# Production
docker run -d \
  --name general-file-management-service \
  -p 8018:8018 \
  --restart unless-stopped \
  general-file-management-service
```

## Docker Compose

Thêm vào `docker-compose.yml`:

```yaml
general-file-management-service:
  build: ./general-file-management-service
  ports:
    - "8018:8018"
  environment:
    - DATABASE_HOST=mysql
    - REDIS_HOST=redis
  volumes:
    - ./general-file-management-service:/app
    - ./general-file-management-service/uploads:/app/uploads
  depends_on:
    - mysql
    - redis
```

## Troubleshooting

### 1. Port đã được sử dụng
```bash
# Kiểm tra process đang sử dụng port 8018
netstat -tulpn | grep 8018

# Kill process
kill -9 <PID>
```

### 2. Database connection failed
```bash
# Kiểm tra MariaDB service
sudo systemctl status mariadb

# Kiểm tra connection
mysql -u root -p -h localhost
```

### 3. Permission denied
```bash
# Tạo thư mục uploads
mkdir -p uploads

# Cấp quyền
chmod 755 uploads
```

### 4. Import errors
```bash
# Cài đặt lại dependencies
pip uninstall -r requirements.txt
pip install -r requirements.txt
```

## Monitoring

### Logs
```bash
# Xem logs real-time
tail -f logs/app.log

# Xem logs Docker
docker logs -f general-file-management-service
```

### Metrics
- Health check: `/health`
- API documentation: `/docs`
- OpenAPI schema: `/openapi.json`

## Development

### Code structure
```
├── main.py              # FastAPI app
├── config.py            # Configuration
├── routers.py           # API endpoints
├── schemas/             # Data models
├── services/            # Business logic
└── uploads/             # File storage
```

### Adding new endpoints
1. Thêm endpoint vào `routers.py`
2. Tạo schema trong `schemas/`
3. Implement logic trong `services/`
4. Test với `/docs`

### Testing
```bash
# Run tests
pytest

# Run with coverage
pytest --cov=.
```

## Production Deployment

### Environment variables
```bash
# Production settings
export DATABASE_URL="mysql+pymysql://user:pass@host:3306/db"
export REDIS_URL="redis://host:6379"
export SECRET_KEY="your-secret-key"
export LOG_LEVEL="INFO"
```

### Process management
```bash
# Sử dụng systemd
sudo systemctl enable general-file-management-service
sudo systemctl start general-file-management-service

# Sử dụng supervisor
supervisorctl start general-file-management-service
```

### Reverse proxy (Nginx)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:8018;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
