# DocGO Test Suite

Test suite toàn diện cho kiến trúc mới 5 services sau migration.

## Cấu trúc Test

### 1. Unit Tests
- **API Gateway BFF**: `test/api-gateway.test.js`
- **Authentication Service**: `backend/authentication-identity-service/src/test/java/.../AuthControllerTest.java`
- **Contract Management Service**: `backend/contract-management-service/src/test/java/.../ContractControllerTest.java`
- **AI Processing Service**: `backend/ai-processing-service/test_ai_processing.py`
- **File Storage Service**: `backend/file-storage-asset-service/test_file_storage.py`

### 2. Integration Tests
- **End-to-end workflow**: `test/integration.test.js`
- Test complete workflow từ upload file → AI process → create contract → approval → notification

### 3. Performance Tests
- **Response time**: `test/performance.test.js`
- Test concurrent requests và file upload performance

### 4. Health Check Scripts
- **Bash**: `test/health-check.sh`
- **PowerShell**: `test/health-check.ps1`

## Cách chạy Tests

### 1. Cài đặt dependencies
```bash
cd test
npm install
```

### 2. Chạy tất cả tests
```bash
npm run test:all
```

### 3. Chạy từng loại test
```bash
# Unit tests
npm run test:api-gateway

# Integration tests
npm run test:integration

# Performance tests
npm run test:performance
```

### 4. Health check
```bash
# Bash
./test/health-check.sh

# PowerShell
.\test\health-check.ps1
```

### 5. Java Tests (Spring Boot)
```bash
# Authentication Service
cd backend/authentication-identity-service
./mvnw test

# Contract Management Service
cd backend/contract-management-service
./mvnw test
```

### 6. Python Tests (FastAPI)
```bash
# AI Processing Service
cd backend/ai-processing-service
pytest test_ai_processing.py

# File Storage Service
cd backend/file-storage-asset-service
pytest test_file_storage.py
```

## Test Coverage

Tests bao gồm:
- ✅ API endpoints testing
- ✅ Integration giữa các services
- ✅ Performance và load testing
- ✅ Health checks
- ✅ RestResponse format validation
- ✅ Error handling
- ✅ Authentication flow
- ✅ File upload/download
- ✅ AI processing
- ✅ Contract workflow

## Environment Variables

Đảm bảo các environment variables được cấu hình:
- `MONGODB_ATLAS_URI`
- `REDIS_CLOUD_HOST`
- `REDIS_CLOUD_PORT`
- `REDIS_CLOUD_PASSWORD`
- `JWT_SECRET`
- `GEMINI_API_KEY`
- `S3_ENDPOINT`
- `S3_ACCESS_KEY`
- `S3_SECRET_KEY`
- `S3_BUCKET_NAME`
