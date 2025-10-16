# API URL Usage Guide - DocGO Microservices

## 🎯 Mục đích
Hướng dẫn sử dụng URL đúng cách cho DocGO microservices architecture, phân biệt rõ ràng giữa external access và internal communication.

## 📋 Quy tắc sử dụng URL

### 🌐 **External Access (Từ máy host/trình duyệt)**
**Sử dụng `localhost` với port mapping:**

```bash
# API Gateway
http://localhost:8000

# User Management Service  
http://localhost:8001

# File Management Service
http://localhost:8002

# Automation Service
http://localhost:8003

# Web App Frontend
http://localhost:3000

# Kafka UI
http://localhost:8080
```

### 🔗 **Internal Communication (Giữa containers)**
**Sử dụng service names trong Docker network:**

```bash
# API Gateway
http://api-gateway:8000

# User Management Service
http://user-management-service:8001

# File Management Service
http://file-management-service:8002

# Automation Service
http://automation-service:8003

# Infrastructure Services
http://kafka:9092
http://redis:6379
http://zookeeper:2181
```

## 🚨 **Lưu ý quan trọng**

### ❌ **KHÔNG BAO GIỜ sử dụng:**
- `http://api-gateway:8000` từ máy host → **SẼ LỖI 500**
- `http://localhost:8000` từ bên trong container → **SẼ LỖI Connection Refused**

### ✅ **LUÔN sử dụng:**
- `http://localhost:8000` từ máy host → **THÀNH CÔNG**
- `http://api-gateway:8000` từ bên trong container → **THÀNH CÔNG**

## 🔧 **Cách test connectivity**

### Test từ máy host:
```bash
# Test API Gateway
curl http://localhost:8000/api/v1/file-management-service/v1/documents

# Test Document Management Service trực tiếp
curl http://localhost:8002/api/v1/file-management-service/v1/documents
```

### Test từ bên trong container:
```bash
# Vào container API Gateway
docker exec -it api-gateway /bin/bash

# Test internal communication
wget -O- http://api-gateway:8000/api/v1/file-management-service/v1/documents
wget -O- http://file-management-service:8002/api/v1/file-management-service/v1/documents
```

## 🐳 **Docker Network Configuration**

### Network: `docgo-private_docgo-network`
- **Subnet**: 172.20.0.0/16
- **Gateway**: 172.20.0.1

### Container IPs:
- `api-gateway`: 172.20.0.10
- `file-management-service`: 172.20.0.7
- `user-management-service`: 172.20.0.6
- `automation-service`: 172.20.0.8
- `web-app`: 172.20.0.9
- `kafka`: 172.20.0.4
- `redis`: 172.20.0.5
- `zookeeper`: 172.20.0.3
- `kafka-ui`: 172.20.0.2

## 📚 **Ví dụ thực tế**

### ✅ **Đúng - External access:**
```javascript
// Frontend code
const API_BASE_URL = 'http://localhost:8000';

// Test từ Postman/curl
curl http://localhost:8000/api/v1/file-management-service/v1/documents
```

### ✅ **Đúng - Internal communication:**
```javascript
// API Gateway service configuration
const DOCUMENT_SERVICE_URL = 'http://file-management-service:8002';

// Service-to-service communication
const response = await fetch('http://file-management-service:8002/api/v1/documents');
```

### ❌ **Sai - External access với service name:**
```javascript
// KHÔNG hoạt động từ máy host
const API_BASE_URL = 'http://api-gateway:8000'; // ❌ Lỗi 500
```

### ❌ **Sai - Internal communication với localhost:**
```javascript
// KHÔNG hoạt động từ bên trong container
const API_BASE_URL = 'http://localhost:8000'; // ❌ Connection Refused
```

## 🔍 **Troubleshooting**

### Lỗi 500 khi gọi API từ máy host:
- **Nguyên nhân**: Sử dụng service name thay vì localhost
- **Giải pháp**: Đổi thành `http://localhost:8000`

### Connection Refused từ bên trong container:
- **Nguyên nhân**: Sử dụng localhost thay vì service name
- **Giải pháp**: Đổi thành `http://api-gateway:8000`

### Port conflict:
```bash
# Kiểm tra port đang sử dụng
netstat -an | Select-String ":8000"

# Restart container nếu cần
docker-compose restart api-gateway
```

## 📖 **Tài liệu liên quan**
- [Docker Compose Configuration](../docker-compose.yml)
- [API Gateway Configuration](../backend/api-gateway/lib/config.ts)
- [Service Configuration](../.env)

---
**Cập nhật lần cuối**: 2025-10-12
**Phiên bản**: 1.0.0
