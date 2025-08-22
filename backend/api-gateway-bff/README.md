# 🚀 API Gateway BFF - DocGO

API Gateway Backend for Frontend (BFF) sử dụng Next.js và Kafka để kết nối và quản lý các microservice của hệ thống DocGO.

## ✨ Tính năng chính

- 🔗 **Service Discovery & Routing**: Tự động định tuyến request đến microservice phù hợp
- 📡 **Kafka Integration**: Xử lý events và message streaming
- 🔐 **Authentication & Authorization**: JWT-based security với middleware
- 📊 **Health Monitoring**: Real-time monitoring tất cả các service
- 🚦 **Rate Limiting**: Bảo vệ API khỏi abuse
- 📝 **Comprehensive Logging**: Winston-based logging với rotation
- 🛡️ **Security**: CORS, Helmet, và các biện pháp bảo mật khác

## 🏗️ Kiến trúc

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  API Gateway     │    │  Microservices  │
│   (React/Next)  │◄──►│  BFF (Next.js)   │◄──►│  (Spring/FastAPI)│
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │     Kafka        │
                       │   (Events)       │
                       └──────────────────┘
```

## 🚀 Khởi động nhanh

### Yêu cầu
- Node.js 18.0.0+
- Kafka broker (localhost:9092)
- Các microservice đang chạy

### Cài đặt
```bash
cd backend/api-gateway-bff
npm install
cp env_example.txt .env
# Chỉnh sửa .env với các giá trị phù hợp
npm run dev
```

### Truy cập
- **Trang chủ**: http://localhost:8000
- **Health Check**: http://localhost:8000/api/health
- **API Base**: http://localhost:8000/api/v1/

## 📚 Tài liệu chi tiết

Xem [How to run this microservice.md](./How%20to%20run%20this%20microservice.md) để biết hướng dẫn chi tiết về:
- Cài đặt và cấu hình
- Troubleshooting
- Deployment
- Security considerations

## 🔧 Cấu hình

### Environment Variables
```env
# Service URLs
USER_MANAGEMENT_SERVICE_URL=http://localhost:8002
AUTHENTICATION_SERVICE_URL=http://localhost:8001

# Kafka
KAFKA_BROKERS=localhost:9092
KAFKA_CLIENT_ID=api-gateway-bff

# Security
JWT_SECRET=your-secret-key
RATE_LIMIT_MAX_REQUESTS=100
```

### Port Mapping
- **API Gateway BFF**: 8000
- **Authentication Service**: 8001  
- **User Management Service**: 8002

## 📡 API Endpoints

### Authentication Service
```
POST /api/v1/authentication-identity-service/auth/register
GET  /api/v1/authentication-identity-service/auth/login
PUT  /api/v1/authentication-identity-service/auth/{id}
```

### User Management Service
```
GET    /api/v1/user-management-service/users/{id}
PUT    /api/v1/user-management-service/users/{id}
GET    /api/v1/user-management-service/approvals/{id}
```

## 🐛 Troubleshooting

### Kafka Connection Issues
- Kiểm tra Kafka broker có đang chạy không
- Verify KAFKA_BROKERS trong .env
- Kiểm tra port 9092

### Service Connection Issues
- Kiểm tra microservice có đang chạy không
- Verify service URLs trong .env
- Kiểm tra firewall/network

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

Dự án này thuộc về DocGO và được phát triển bởi devgo2003.

## 📞 Hỗ trợ

- **Issues**: Tạo issue trên GitHub
- **Documentation**: Xem [How to run this microservice.md](./How%20to%20run%20this%20microservice.md)
- **Team**: devgo2003

---

**Made with ❤️ by devgo2003 for DocGO**
