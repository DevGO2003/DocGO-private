# Hướng dẫn sử dụng .env.local cho Microservices

## 🎯 Mục đích

Tạo file `env.local` cho từng microservice để quản lý environment variables cho local development, thay vì chỉnh sửa trực tiếp `docker-compose.local.yml`.

## 📁 Cấu trúc thư mục

```
backend/
├── ai-processing-service/
│   ├── env_exmaple.txt    # Template cho team
│   └── env.local          # Config local development
├── contract-management-service/
│   ├── env_exmaple.txt
│   └── env.local
├── general-file-management-service/
│   ├── env_exmaple.txt
│   └── env.local
├── user-management-service/
│   ├── env_exmaple.txt
│   └── env.local
├── api-gateway-bff/
│   ├── env_exmaple.txt
│   └── env.local
├── file-storage-asset-service/
│   ├── env_exmaple.txt
│   └── env.local
└── authentication-identity-service/
    ├── env_exmaple.txt
    └── env.local
```

## 🚀 Cách sử dụng

### **Bước 1: Tạo env.local cho tất cả services**

#### **Windows (PowerShell):**
```powershell
cd script
.\setup-env-local.ps1
```

#### **Linux/Mac (Bash):**
```bash
cd script
chmod +x setup-env-local.sh
./setup-env-local.sh
```

### **Bước 2: Chỉnh sửa env.local theo nhu cầu**

Mỗi service có file `env.local` riêng, bạn có thể chỉnh sửa:

```bash
# Ví dụ: Chỉnh sửa database password
vim backend/contract-management-service/env.local

# Hoặc sử dụng editor yêu thích
code backend/ai-processing-service/env.local
```

### **Bước 3: Sử dụng trong docker-compose.local.yml**

```yaml
services:
  ai-processing-service:
    env_file:
      - ./backend/ai-processing-service/env.local
    
  contract-management-service:
    env_file:
      - ./backend/contract-management-service/env.local
    
  general-file-management-service:
    env_file:
      - ./backend/general-file-management-service/env.local
```

## 📋 Danh sách các Service và Port

| Service | Port | Database | File Config |
|---------|------|----------|-------------|
| **AI Processing Service** | 8017 | - | `backend/ai-processing-service/env.local` |
| **Contract Management Service** | 8003 | MariaDB | `backend/contract-management-service/env.local` |
| **General File Management Service** | 8018 | MariaDB + Redis + Elasticsearch | `backend/general-file-management-service/env.local` |
| **User Management Service** | 8002 | MariaDB + S3 | `backend/user-management-service/env.local` |
| **API Gateway BFF** | 8000 | - | `backend/api-gateway-bff/env.local` |
| **File Storage Asset Service** | 8019 | MariaDB + MinIO | `backend/file-storage-asset-service/env.local` |
| **Authentication Identity Service** | 8001 | MariaDB + Redis | `backend/authentication-identity-service/env.local` |

## 🔧 Các biến môi trường quan trọng

### **Database (MariaDB/MySQL)**
```bash
DATABASE_URL=jdbc:mariadb://localhost:3306/docgo_service_name
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password
```

### **Kafka**
```bash
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_CLIENT_ID=service-name
KAFKA_GROUP_ID=service-group
```

### **Redis**
```bash
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### **MinIO/S3**
```bash
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=docgo-files
```

## ⚠️ Lưu ý quan trọng

### **✅ Nên làm:**
- Chỉnh sửa `env.local` của từng service
- Sử dụng `env_file` trong docker-compose
- Commit `env.local` vào git (nếu cần)
- Sử dụng `env_exmaple.txt` làm template

### **❌ Không nên làm:**
- Chỉnh sửa trực tiếp `docker-compose.local.yml`
- Commit file `.env` chứa secrets thật
- Hardcode environment variables trong code
- Sử dụng cùng config cho tất cả môi trường

## 🔄 Workflow khi thay đổi Environment

1. **Xác định service cần thay đổi**
2. **Chỉnh sửa file `env.local` của service đó**
3. **Restart service hoặc docker-compose**
4. **Test để đảm bảo config hoạt động**
5. **Commit thay đổi (nếu cần)**

## 📚 Tài liệu tham khảo

- **Quy tắc Environment**: `.cursor/rules/environment-git-standards.mdc`
- **Quy tắc Docker**: `.cursor/rules/docker-development-standards.mdc`
- **Quy tắc Service**: `.cursor/rules/service-structure-standards.mdc`

## 🆘 Troubleshooting

### **Lỗi thường gặp:**

#### **1. Service không start được**
```bash
# Kiểm tra log
docker-compose -f docker-compose.local.yml logs service-name

# Kiểm tra env.local có đúng format không
cat backend/service-name/env.local
```

#### **2. Database connection failed**
```bash
# Kiểm tra MariaDB có chạy không
docker ps | grep mariadb

# Kiểm tra connection string
echo $DATABASE_URL
```

#### **3. Kafka connection failed**
```bash
# Kiểm tra Kafka có chạy không
docker ps | grep kafka

# Kiểm tra bootstrap servers
echo $KAFKA_BOOTSTRAP_SERVERS
```

### **Debug commands:**
```bash
# Xem environment variables của service
docker-compose -f docker-compose.local.yml exec service-name env

# Xem file env.local
cat backend/service-name/env.local

# Test connection
docker-compose -f docker-compose.local.yml exec service-name ping hostname
```

## 🎉 Kết luận

Sử dụng `env.local` cho từng microservice giúp:
- **Quản lý config tập trung** cho mỗi service
- **Dễ bảo trì** và thay đổi environment
- **An toàn** khi không commit secrets vào git
- **Linh hoạt** cho từng developer
- **Version control** environment theo service

Hãy sử dụng cách tiếp cận này để quản lý environment variables một cách hiệu quả và an toàn!




