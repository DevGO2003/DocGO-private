# Health Check Command

## Mục đích
Kiểm tra sức khỏe tổng thể của hệ thống DocGO.

## Cách sử dụng
```bash
/health
```

## Quy trình thực hiện

### 1. 🐳 Docker Health Check
- Kiểm tra trạng thái tất cả containers
- Xác định containers đang chạy, dừng, hoặc restart
- Phân tích resource usage (CPU, Memory, Network)

### 2. 🔗 Service Health Check
- Kiểm tra kết nối giữa các services
- Test API endpoints chính
- Xác định services có vấn đề

### 3. 📊 Database Health Check
- Kiểm tra kết nối MongoDB
- Test database queries cơ bản
- Xác định performance issues

### 4. 🌐 Network Health Check
- Kiểm tra port availability
- Test network connectivity
- Xác định network issues

## Kết quả mong đợi
- ✅ **Docker containers** status
- 🔗 **Services connectivity** status
- 📊 **Database** health status
- 🌐 **Network** health status
- 📈 **Performance metrics** overview
- ⚠️ **Issues** cần chú ý
