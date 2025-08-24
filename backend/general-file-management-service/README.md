# General File Management Service

## Tổng quan

General File Management Service là một microservice trong hệ thống DocGO, chịu trách nhiệm quản lý file tổng quát, metadata, organization và search.

## Thông tin kỹ thuật

- **Công nghệ**: FastAPI (Python)
- **Port**: 8018
- **Database**: MariaDB
- **Cache**: Redis
- **Search**: Elasticsearch
- **Docs**: http://localhost:8018/docs

## Chức năng chính

### 1. File Management
- Upload file với validation
- Quản lý metadata (title, description, tags, category)
- Phân loại file theo danh mục
- Version control cho file

### 2. File Organization
- Tạo và quản lý danh mục file
- Hỗ trợ danh mục phân cấp (parent-child)
- Tag-based organization
- Custom fields cho metadata

### 3. File Search
- Full-text search
- Filter theo category, file type, tags
- Date range search
- Size-based filtering
- Search suggestions

### 4. File Operations
- CRUD operations cho file
- Soft delete
- File status management
- Checksum validation

## API Endpoints

### File Upload
- `POST /api/v1/general-file-management-service/files/upload` - Upload file

### File Management
- `GET /api/v1/general-file-management-service/files` - Lấy danh sách file
- `GET /api/v1/general-file-management-service/files/{file_id}` - Lấy thông tin file
- `PUT /api/v1/general-file-management-service/files/{file_id}/metadata` - Cập nhật metadata
- `DELETE /api/v1/general-file-management-service/files/{file_id}` - Xóa file

### Categories
- `GET /api/v1/general-file-management-service/categories` - Lấy danh sách danh mục

### Search
- `POST /api/v1/general-file-management-service/search` - Tìm kiếm file

## Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 2. Cấu hình môi trường
```bash
# Copy file môi trường
cp env.example .env

# Chỉnh sửa .env với thông tin thực tế
```

### 3. Chạy service
```bash
# Development mode
uvicorn main:app --host 0.0.0.0 --port 8018 --reload

# Production mode
uvicorn main:app --host 0.0.0.0 --port 8018
```

### 4. Docker
```bash
# Build image
docker build -t general-file-management-service .

# Run container
docker run -p 8018:8018 general-file-management-service
```

## Cấu trúc dự án

```
general-file-management-service/
├── main.py                 # FastAPI app entry point
├── config.py              # Cấu hình và settings
├── routers.py             # API endpoints
├── schemas/               # Pydantic models
│   ├── file.py           # File-related schemas
│   └── response.py       # Response schemas
├── services/              # Business logic
│   └── file_service.py   # File management service
├── uploads/               # File storage directory
├── requirements.txt       # Python dependencies
├── Dockerfile            # Docker configuration
└── README.md             # This file
```

## Database Schema

### Files Table
- `file_id` (UUID, Primary Key)
- `filename` (VARCHAR)
- `file_size` (BIGINT)
- `file_type` (ENUM)
- `mime_type` (VARCHAR)
- `status` (ENUM)
- `file_path` (VARCHAR)
- `checksum` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `created_by` (VARCHAR)
- `system_id` (VARCHAR)
- `version` (INT)

### File Metadata Table
- `id` (UUID, Primary Key)
- `file_id` (UUID, Foreign Key)
- `title` (VARCHAR)
- `description` (TEXT)
- `tags` (JSON)
- `category` (VARCHAR)
- `author` (VARCHAR)
- `keywords` (JSON)
- `custom_fields` (JSON)

### Categories Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `description` (TEXT)
- `parent_id` (UUID, Foreign Key)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Tích hợp

### 1. Authentication
- Tích hợp với Authentication Identity Service
- JWT token validation
- Role-based access control

### 2. File Storage
- Tích hợp với File Storage Asset Service
- S3/Filebase integration
- Local file system fallback

### 3. Search
- Elasticsearch integration
- Full-text search capabilities
- Search result ranking

## Monitoring và Logging

- Health check endpoint: `/health`
- Structured logging với JSON format
- Metrics collection
- Error tracking và reporting

## Security

- File type validation
- File size limits
- Checksum verification
- Access control
- Audit logging

## Performance

- Redis caching
- Database connection pooling
- Async file operations
- Pagination support
- Search optimization

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Kiểm tra port
   netstat -tulpn | grep 8018
   
   # Kill process
   kill -9 <PID>
   ```

2. **Database connection failed**
   - Kiểm tra database service
   - Verify connection string
   - Check firewall settings

3. **File upload failed**
   - Kiểm tra disk space
   - Verify file permissions
   - Check file size limits

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

This project is part of DocGO system.
