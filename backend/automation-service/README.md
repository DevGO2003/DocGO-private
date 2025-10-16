# Automation Service

## 🚀 Tổng quan

Automation Service là một microservice xử lý tài liệu thông minh sử dụng Google Gemini AI để trích xuất và tóm tắt thông tin từ các tài liệu.

## 🛠️ Công nghệ sử dụng

- **FastAPI** - Web framework
- **Google Gemini AI** - AI model cho xử lý tài liệu
- **python-docx** - Đọc file DOCX
- **PyPDF2** - Đọc file PDF
- **Pydantic** - Data validation
- **MongoDB Atlas** - Audit logging và event tracking
- **Motor** - Async MongoDB driver
- **Redis** - Event pub/sub và caching
- **WebSocket** - Real-time progress updates
- **Kafka** - Message queuing cho async processing

## 📋 Tính năng

### 1. Unified Upload API
- **Endpoint**: `POST /api/v1/automation-service/documents/upload`
- **Chức năng**: Upload và xử lý tài liệu với full audit logging
- **Input**: File tài liệu (docx, pdf, txt, jpg, png)
- **Output**: Kết quả xử lý với correlation ID cho tracking
- **Features**: 
  - Sync processing cho files < 2MB
  - Async processing cho files >= 2MB
  - Full audit logging với MongoDB
  - Event publishing với Kafka
  - WebSocket progress updates
  - Retry mechanism với exponential backoff

### 2. Process API (Legacy)
- **Endpoint**: `POST /api/v1/automation-service/process`
- **Chức năng**: Xử lý và trích xuất thông tin từ file DOCX/PDF/TXT
- **Input**: File tài liệu (docx, pdf, txt)
- **Output**: Kết quả xử lý từ AI

### 3. Validate API (Legacy)
- **Endpoint**: `POST /api/v1/automation-service/validate`
- **Chức năng**: Kiểm tra và xác thực tài liệu
- **Input**: File TXT hoặc chuỗi văn bản
- **Output**: Kết quả validation

### 4. Audit & Event System
- **MongoDB Audit Logs**: 3 collections cho audit, processing sessions, errors
- **Event Publishing**: Kafka events cho inter-service communication
- **WebSocket**: Real-time progress updates
- **Retry Logic**: Exponential backoff cho S3, OCR, AI, File Management

## 🚀 Cách chạy

### Prerequisites:
- Python 3.11+
- `GEMINI_API_KEY`
- MongoDB Atlas (hoặc local MongoDB)
- Redis Cloud (hoặc local Redis)
- Twilio Account (cho SMS notifications - tùy chọn)

### Environment:
```bash
# AI Processing
GEMINI_API_KEY=YOUR_GEMINI_KEY

# S3 Configuration (Filebase)
S3_ENABLED=true
S3_ENDPOINT=https://s3.filebase.com
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=YOUR_ACCESS_KEY
S3_SECRET_ACCESS_KEY=YOUR_SECRET_KEY
S3_BUCKET=your-bucket-name

# MongoDB Atlas (Audit Logging)
MONGODB_ENABLED=true
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_AUDIT_DATABASE=docgo_automation_audit

# MongoDB Collections
MONGODB_AUDIT_LOGS_COLLECTION=automation_audit_logs
MONGODB_PROCESSING_SESSIONS_COLLECTION=automation_processing_sessions
MONGODB_ERROR_LOGS_COLLECTION=automation_error_logs

# Redis Cloud
REDIS_URL=redis://username:password@host:port
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
KAFKA_FILE_UPLOADED_TOPIC=file.uploaded

# SMTP Configuration (cho email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_USE_TLS=true

# Twilio Configuration (cho SMS notifications)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Batch Processing
BATCH_MAX_WORKERS=4
BATCH_QUEUE_NAME=ai_processing_queue
BATCH_RESULT_TTL=3600

# Event Handling
REDIS_FILE_UPLOADED_CHANNEL=file.uploaded
REDIS_AI_COMPLETED_CHANNEL=ai.processing.completed
REDIS_NOTIFICATION_SENT_CHANNEL=notification.sent
```

### 1. Cài đặt dependencies
```bash
cd backend/automation-service
pip install -r requirements.txt
```

### 2. Cấu hình môi trường
```bash
# Copy file môi trường
cp env_example.txt .env

# Cập nhật GEMINI_API_KEY trong .env
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Chạy service

#### Run (PowerShell):
```powershell
cd backend/automation-service
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
# Copy file env từ thư mục env
Copy-Item env/.env.example env/.env -Force
# Chỉnh sửa file env/.env với các giá trị thực tế
uvicorn main:app --reload --port 8000
```

#### Run (Docker):
```bash
cd backend/automation-service
docker build -t automation-service .
docker run -p 8003:8000 --env-file env/.env automation-service
```

### 4. Truy cập
- **API Documentation**: http://localhost:8003/docs#/
- **Health Check**: http://localhost:8003/api/v1/automation-service/health
- **Root**: http://localhost:8003/

## 📚 API Documentation

### Unified Upload API (Recommended)
```bash
# Upload document với full audit logging
curl -X POST "http://localhost:8003/api/v1/automation-service/documents/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.pdf" \
  -H "X-Correlation-Id: your-correlation-id"

# Response includes correlation ID for tracking
{
  "apiVersion": "v1",
  "statusCode": 201,
  "shortMessage": "Created",
  "description": "Document created and processed (sync)",
  "data": {
    "documentId": "doc-123",
    "fileUrl": "https://s3.example.com/files/doc-123",
    "classificationResult": {...},
    "summaryResult": {...},
    "processingStatus": "COMPLETED",
    "correlationId": "corr-456"
  },
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "corr-456",
  "path": "/api/v1/automation-service/documents/upload"
}
```

### WebSocket Progress Updates
```javascript
// Connect to WebSocket for real-time progress
const ws = new WebSocket('ws://localhost:8003/ws/document/doc-123');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Progress:', data);
};
```

### Process API (Legacy)
```bash
curl -X POST "http://localhost:8003/api/v1/automation-service/process" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.docx" \
  -H "API_KEY: your_api_key"
```

### Validate API (Legacy)
```bash
# Với file TXT
curl -X POST "http://localhost:8003/api/v1/automation-service/validate" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@document.txt"

# Với chuỗi văn bản
curl -X POST "http://localhost:8003/api/v1/automation-service/validate" \
  -H "Content-Type: application/json" \
  -d '{"data": "Nội dung tài liệu..."}'
```

## 🔧 Cấu hình

### Environment Variables
- `HOST`: Host để bind service (mặc định: 0.0.0.0)
- `PORT`: Port để chạy service (mặc định: 8003)
- `GEMINI_API_KEY`: API key cho Google Gemini AI
- `MAX_FILE_SIZE`: Kích thước file tối đa (mặc định: 100MB)
- `ALLOWED_FILE_TYPES`: Các loại file được phép (docx,pdf,txt)
- `RESULTS_DIR`: Thư mục lưu file tạm (mặc định: results)

## 🐳 Docker

### Build image
```bash
docker build -t docgo-automation-service:latest .
```

### Chạy container
```bash
docker run -p 8003:8000 \
  -e GEMINI_API_KEY=your_api_key \
  docgo-automation-service:latest
```

## 📁 Cấu trúc Project

```
automation-service/
├── main.py              # FastAPI app entry point
├── routers.py           # API routes
├── config.py            # Configuration
├── schemas/
│   └── response.py      # Response models
├── requirements.txt     # Python dependencies
├── env_example.txt      # Environment template
├── README.md           # This file
└── results/            # Temporary files directory
```

## 🔍 Troubleshooting

### Lỗi thường gặp

1. **422 Validation Error**: Kiểm tra format file và payload
2. **500 Internal Server Error**: Kiểm tra GEMINI_API_KEY và kết nối mạng
3. **File không được hỗ trợ**: Chỉ hỗ trợ docx, pdf, txt

### Logs
```bash
# Xem logs khi chạy với uvicorn
uvicorn main:app --host 0.0.0.0 --port 8000 --reload --log-level debug
```

## Features:
- **AI Processing**: Extract, Summarize, Classify documents với Gemini AI
- **Unified Upload**: Single endpoint với sync/async processing
- **Audit Logging**: Full MongoDB audit trail với 3 collections
- **Event System**: Kafka events cho inter-service communication
- **WebSocket**: Real-time progress updates
- **Retry Logic**: Exponential backoff cho tất cả external services
- **S3 Integration**: File storage với Filebase
- **Notification Service**: Email, SMS, Push, WebSocket notifications
- **Batch Processing**: Xử lý hàng loạt files với job queue
- **Event Handling**: Redis Pub/Sub cho real-time events
- **MongoDB Integration**: Lưu trữ audit logs, processing sessions, errors
- **Redis Integration**: Message queue và caching

## API Endpoints:
- `POST /api/v1/automation-service/documents/upload` - **Unified upload với full audit**
- `WS /ws/document/{document_id}` - WebSocket progress updates
- `POST /api/v1/automation-service/process` - Xử lý và trích xuất nội dung file (legacy)
- `POST /api/v1/automation-service/validate` - Kiểm tra và xác thực tài liệu (legacy)
- `POST /api/v1/automation-service/notifications/send` - Gửi notification
- `GET /api/v1/automation-service/notifications/history` - Lịch sử notification
- `POST /api/v1/automation-service/batch/process` - Xử lý hàng loạt
- `GET /api/v1/automation-service/batch/status/{job_id}` - Trạng thái batch job
- `POST /api/v1/automation-service/events/handle` - Xử lý events

## MongoDB Audit Collections:
- `automation_audit_logs` - Event logs với correlation ID
- `automation_processing_sessions` - Processing session tracking
- `automation_error_logs` - Error logs với retry information

## Event Types & Schema:
Automation Service publishes events theo chuẩn Event Payload Standard:
- **AutomationStarted** - Khi bắt đầu xử lý tài liệu
- **FileUploaded** - Sau khi upload file lên S3 thành công
- **FileProcessed** - Sau khi hoàn thành OCR processing
- **DocumentClassified** - Sau khi AI phân loại tài liệu
- **ContractSummaryUpdated** - Sau khi tạo contract summary
- **DocumentCreated** - Sau khi lưu document vào File Management Service
- **AutomationCompleted** - Khi hoàn thành toàn bộ quy trình
- **AutomationFailed** - Khi có lỗi trong quá trình xử lý

Event Schema:
```json
{
  "eventVersion": "v1",
  "eventType": "AutomationStarted",
  "eventId": "uuid",
  "timestamp": "ISO-8601",
  "source": "automation-service",
  "correlationId": "uuid",
  "actor": {
    "userId": "system",
    "userRole": "system",
    "ip": "client-ip"
  },
  "data": {},
  "metadata": {
    "region": "local",
    "serviceVersion": "1.0.0"
  }
}
```

## Error Handling & Retry:
- **S3 Upload**: 3 retries với exponential backoff (2^n)
- **OCR Processing**: 2 retries với backoff factor 1.5
- **AI Classification**: 2 retries với backoff factor 1.5
- **AI Summarization**: 2 retries với backoff factor 1.5
- **File Management API**: 3 retries với exponential backoff

Tất cả errors được log vào MongoDB với:
- correlationId để tracking
- errorType để phân loại
- retryable flag để xác định có thể retry không
- retryCount để theo dõi số lần retry

## Correlation ID Tracking:
Mọi request đều có correlation ID xuyên suốt pipeline:
- Tự động generate nếu không có trong header `X-Correlation-Id`
- Truyền qua tất cả service calls
- Lưu trong audit logs, processing sessions, events
- Dùng để trace toàn bộ luồng xử lý từ đầu đến cuối

Docs: `http://localhost:8003/docs#/`

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License
