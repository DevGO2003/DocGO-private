# AI Processing Service

## 🚀 Tổng quan

AI Processing Service là một microservice xử lý tài liệu thông minh sử dụng Google Gemini AI để trích xuất và tóm tắt thông tin từ các hợp đồng.

## 🛠️ Công nghệ sử dụng

- **FastAPI** - Web framework
- **Google Gemini AI** - AI model cho xử lý tài liệu
- **python-docx** - Đọc file DOCX
- **PyPDF2** - Đọc file PDF
- **Pydantic** - Data validation

## 📋 Tính năng

### 1. Extract API
- **Endpoint**: `POST /api/v1/ai-processing-service/extract`
- **Chức năng**: Trích xuất thông tin từ file DOCX/PDF
- **Input**: File hợp đồng (docx, pdf)
- **Output**: Văn bản trích xuất từ AI

### 2. Summarize API
- **Endpoint**: `POST /api/v1/ai-processing-service/summarize`
- **Chức năng**: Tóm tắt hợp đồng thành JSON
- **Input**: File TXT hoặc chuỗi văn bản
- **Output**: JSON tóm tắt hợp đồng

## 🚀 Cách chạy

### 1. Cài đặt dependencies
```bash
cd backend/ai-processing-service
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
```bash
# Chạy với uvicorn
uvicorn main:app --host 0.0.0.0 --port 8017 --reload

# Hoặc chạy trực tiếp
python main.py
```

### 4. Truy cập
- **API Documentation**: http://localhost:8017/docs
- **Health Check**: http://localhost:8017/health
- **Root**: http://localhost:8017/ (tự động redirect sang /docs)

## 📚 API Documentation

### Extract API
```bash
curl -X POST "http://localhost:8017/api/v1/ai-processing-service/extract" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@contract.docx" \
  -H "gemini_api_key: your_api_key"
```

### Summarize API
```bash
# Với file TXT
curl -X POST "http://localhost:8017/api/v1/ai-processing-service/summarize" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@contract.txt"

# Với chuỗi văn bản
curl -X POST "http://localhost:8017/api/v1/ai-processing-service/summarize" \
  -H "Content-Type: application/json" \
  -d '{"text": "Nội dung hợp đồng..."}'
```

## 🔧 Cấu hình

### Environment Variables
- `HOST`: Host để bind service (mặc định: 0.0.0.0)
- `PORT`: Port để chạy service (mặc định: 8017)
- `GEMINI_API_KEY`: API key cho Google Gemini AI
- `MAX_FILE_SIZE`: Kích thước file tối đa (mặc định: 100MB)
- `ALLOWED_FILE_TYPES`: Các loại file được phép (docx,pdf,txt)
- `RESULTS_DIR`: Thư mục lưu file tạm (mặc định: results)

## 🐳 Docker

### Build image
```bash
docker build -t docgo-ai-processing-service:latest .
```

### Chạy container
```bash
docker run -p 8017:8017 \
  -e GEMINI_API_KEY=your_api_key \
  docgo-ai-processing-service:latest
```

## 📁 Cấu trúc Project

```
ai-processing-service/
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
uvicorn main:app --host 0.0.0.0 --port 8017 --reload --log-level debug
```

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License
