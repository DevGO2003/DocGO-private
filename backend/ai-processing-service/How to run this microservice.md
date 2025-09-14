### How to run this microservice

Prerequisites:
- Python 3.11+
- `GEMINI_API_KEY`
- MongoDB Atlas (hoặc local MongoDB)
- Redis Cloud (hoặc local Redis)
- Twilio Account (cho SMS notifications - tùy chọn)

Environment:
```bash
# AI Processing
GEMINI_API_KEY=YOUR_GEMINI_KEY

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DATABASE=ai_processing_db

# Redis Cloud
REDIS_URL=redis://username:password@host:port
REDIS_PASSWORD=your_redis_password
REDIS_DB=0

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

Run (PowerShell):
```powershell
cd backend/ai-processing-service
python -m venv venv
./venv/Scripts/Activate.ps1
pip install -r requirements.txt
# Copy file env từ thư mục env
Copy-Item env/.env.example env/.env -Force
# Chỉnh sửa file env/.env với các giá trị thực tế
uvicorn main:app --reload --port 8017
```

Run (Docker):
```bash
cd backend/ai-processing-service
docker build -t ai-processing-service .
docker run -p 8017:8000 --env-file env/.env ai-processing-service
```

Features:
- **AI Processing**: Extract, Summarize, Classify documents
- **Notification Service**: Email, SMS, Push, WebSocket notifications
- **Batch Processing**: Xử lý hàng loạt files với job queue
- **Event Handling**: Redis Pub/Sub cho real-time events
- **MongoDB Integration**: Lưu trữ notifications, batch jobs, events
- **Redis Integration**: Message queue và caching

API Endpoints:
- `POST /api/v1/ai-processing-service/extract` - Trích xuất nội dung file
- `POST /api/v1/ai-processing-service/summarize` - Tóm tắt hợp đồng
- `POST /api/v1/ai-processing-service/classify` - Phân loại tài liệu
- `POST /api/v1/ai-processing-service/notifications/send` - Gửi notification
- `GET /api/v1/ai-processing-service/notifications/history` - Lịch sử notification
- `POST /api/v1/ai-processing-service/batch/process` - Xử lý hàng loạt
- `GET /api/v1/ai-processing-service/batch/status/{job_id}` - Trạng thái batch job
- `POST /api/v1/ai-processing-service/events/handle` - Xử lý events

Docs: `http://localhost:8017/docs#/`

