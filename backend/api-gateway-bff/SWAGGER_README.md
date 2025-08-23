# 📚 Swagger/OpenAPI Documentation - API Gateway BFF

## Tổng quan

API Gateway BFF đã được tích hợp đầy đủ Swagger/OpenAPI documentation tuân thủ cursor rules của DocGO. Documentation này cung cấp:

- **OpenAPI 3.0.3 Specification** đầy đủ
- **Swagger UI** để test API trực tiếp
- **JSDoc annotations** trong code
- **Schema definitions** cho tất cả response types
- **Examples** và **error responses** chi tiết

## 🚀 Truy cập Documentation

### 1. **Swagger UI (Khuyến nghị)**
```
http://localhost:8000/swagger
```

### 2. **OpenAPI JSON Specification**
```
http://localhost:8000/api/swagger.json
```

### 3. **Trang chủ với link đến Documentation**
```
http://localhost:8000
```

## 📋 Cấu trúc Documentation

### **Tags được tổ chức theo Service:**

| Tag | Mô tả | Endpoints |
|-----|--------|-----------|
| **API Gateway BFF** | Health check và monitoring | `/api/health`, `/api/swagger.json` |
| **Authentication Service** | Xác thực và quản lý người dùng | `/api/v1/authentication-identity-service/*` |
| **User Management Service** | Quản lý thông tin người dùng | `/api/v1/user-management-service/*` |
| **Contract Management Service** | Quản lý hợp đồng và workflow | `/api/v1/contract-management-service/*` |
| **AI Processing Service** | Xử lý AI cho tài liệu | `/api/v1/ai-processing-service/*` |
| **File Storage Service** | Quản lý file và tài sản số | `/api/v1/file-storage-asset-service/*` |

### **HTTP Methods được hỗ trợ:**

- **GET** - Lấy dữ liệu
- **POST** - Tạo mới resource
- **PUT** - Cập nhật resource
- **DELETE** - Xóa resource

## 🔧 Cách sử dụng Swagger UI

### **1. Test API trực tiếp:**
- Mở http://localhost:8000/swagger
- Chọn endpoint muốn test
- Click "Try it out"
- Nhập parameters và body (nếu cần)
- Click "Execute"

### **2. Xem Schema:**
- Mỗi endpoint có mô tả chi tiết
- Request/Response schemas được định nghĩa rõ ràng
- Examples cho từng loại response

### **3. Authentication:**
- JWT Bearer token được hỗ trợ
- Click "Authorize" button để nhập token
- Token sẽ được áp dụng cho tất cả requests

## 📖 JSDoc Annotations

### **Cấu trúc chuẩn cho mỗi endpoint:**

```typescript
/**
 * @swagger
 * /api/endpoint:
 *   method:
 *     summary: Mô tả ngắn gọn
 *     description: |
 *       ## Mô tả chi tiết
 *       
 *       ### 🔹 Đầu vào
 *       🛣️ **param** (bắt buộc, path)
 *       Loại: string
 *       Mô tả: Mô tả tham số
 *       
 *       ### 🔹 Đầu ra
 *       📊 **ResponseType**
 *       Loại: object
 *       Mô tả: Mô tả response
 *       
 *     tags: [Tag Name]
 *     parameters:
 *       - in: path
 *         name: param
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ResponseType'
 */
```

## 🏗️ Schema Definitions

### **1. RestResponse (Chuẩn DocGO):**
```json
{
  "apiVersion": "v1",
  "statusCode": 200,
  "shortMessage": "Success",
  "description": "Mô tả kết quả",
  "data": {},
  "timestamp": "2025-08-23T11:00:00.000Z",
  "requestId": "uuid",
  "path": "/api/v1/service/endpoint"
}
```

### **2. ErrorResponse:**
```json
{
  "error": "Bad Request",
  "message": "Chi tiết lỗi",
  "statusCode": 400
}
```

### **3. HealthStatus:**
```json
{
  "status": "healthy",
  "service": "API Gateway BFF",
  "timestamp": "2025-08-23T11:00:00.000Z",
  "uptime": 3600.5,
  "services": {},
  "kafka": true,
  "version": "1.0.0"
}
```

## 🔍 Health Check Endpoints

### **API Gateway Health:**
```
GET /api/health
```

**Response Codes:**
- **200 OK**: Tất cả service đều khỏe mạnh
- **503 Service Unavailable**: Một số service không khỏe mạnh
- **500 Internal Server Error**: Lỗi trong quá trình kiểm tra

### **Individual Service Health:**
```
GET /api/v1/{service-name}/health
```

## 🚀 Development Workflow

### **1. Thêm endpoint mới:**
1. Tạo API endpoint trong `pages/api/`
2. Thêm JSDoc annotations với `@swagger`
3. Định nghĩa schema trong `lib/swagger.ts` nếu cần
4. Test với Swagger UI

### **2. Cập nhật documentation:**
1. Sửa JSDoc annotations
2. Restart development server
3. Refresh Swagger UI

### **3. Deploy:**
1. Build project: `npm run build`
2. Start production: `npm start`
3. Documentation sẽ có sẵn tại `/swagger`

## 🐛 Troubleshooting

### **1. Swagger UI không load:**
- Kiểm tra console browser
- Verify `/api/swagger.json` endpoint
- Restart development server

### **2. JSDoc không được parse:**
- Kiểm tra syntax JSDoc
- Verify file path trong `swagger.ts`
- Restart development server

### **3. Schema không hiển thị:**
- Kiểm tra `$ref` paths
- Verify schema definitions
- Check console errors

## 📚 Tài liệu tham khảo

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [Swagger JSDoc](https://github.com/Surnet/swagger-jsdoc)
- [Swagger UI React](https://github.com/swagger-api/swagger-ui)
- [Cursor Rules - DocGO](.cursorrules)

## 🤝 Đóng góp

1. Tuân thủ format JSDoc chuẩn
2. Sử dụng emoji và formatting nhất quán
3. Cập nhật schema definitions khi cần
4. Test documentation với Swagger UI

---

**Made with ❤️ by devgo2003 for DocGO**
