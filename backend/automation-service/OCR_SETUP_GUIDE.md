# Hướng dẫn cài đặt OCR Service

## 📋 Tổng quan

OCR Service hỗ trợ trích xuất text từ hình ảnh sử dụng 2 engine chính:
- **Tesseract OCR**: Engine mạnh mẽ, hỗ trợ nhiều ngôn ngữ
- **EasyOCR**: Engine dễ sử dụng, hỗ trợ tiếng Việt tốt

## 🔧 Cài đặt Dependencies

### 1. Python Dependencies
```bash
cd backend/automation-service
pip install -r requirements.txt
```

### 2. Tesseract OCR

#### Windows:
1. Tải Tesseract từ: https://github.com/UB-Mannheim/tesseract/wiki
2. Cài đặt vào: `C:\Program Files\Tesseract-OCR\`
3. Thêm vào PATH hoặc cấu hình trong code

#### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install tesseract-ocr
sudo apt install tesseract-ocr-vie  # Tiếng Việt
sudo apt install tesseract-ocr-eng  # Tiếng Anh
```

#### macOS:
```bash
brew install tesseract
brew install tesseract-lang  # Hỗ trợ nhiều ngôn ngữ
```

### 3. EasyOCR (Tự động)
EasyOCR sẽ tự động tải models khi chạy lần đầu.

## 🚀 Chạy Service

### 1. Khởi động Automation Service
```bash
cd backend/automation-service
python main.py
```

### 2. Kiểm tra OCR APIs
- **Swagger UI**: http://localhost:8003/docs
- **Health Check**: http://localhost:8003/health
- **OCR Engines**: http://localhost:8003/api/v1/automation-service/ocr/engines

### 3. Test OCR Service
```bash
# PowerShell
.\test-ocr-service.ps1

# Python
python test_ocr.py
```

## 📖 Sử dụng OCR APIs

### 1. Trích xuất text từ ảnh
```bash
curl -X POST "http://localhost:8003/api/v1/automation-service/ocr/extract" \
  -F "file=@image.jpg" \
  -F "engine=auto" \
  -F "language=vie+eng"
```

### 2. Kiểm tra trạng thái engines
```bash
curl "http://localhost:8003/api/v1/automation-service/ocr/engines"
```

### 3. Lấy danh sách ngôn ngữ
```bash
curl "http://localhost:8003/api/v1/automation-service/ocr/languages"
```

## 🔍 Các Engine OCR

### Tesseract OCR
- **Ưu điểm**: Mạnh mẽ, hỗ trợ nhiều ngôn ngữ, độ chính xác cao
- **Nhược điểm**: Cần cài đặt riêng, cấu hình phức tạp
- **Ngôn ngữ**: Hỗ trợ 100+ ngôn ngữ
- **Sử dụng**: `engine=tesseract`

### EasyOCR
- **Ưu điểm**: Dễ sử dụng, hỗ trợ tiếng Việt tốt, không cần cài đặt
- **Nhược điểm**: Chậm hơn, cần GPU để tối ưu
- **Ngôn ngữ**: Hỗ trợ 80+ ngôn ngữ
- **Sử dụng**: `engine=easyocr`

### Auto Mode
- **Ưu điểm**: Tự động chọn engine tốt nhất
- **Cách hoạt động**: Thử tất cả engines, chọn kết quả có confidence cao nhất
- **Sử dụng**: `engine=auto` (mặc định)

## 🎯 Best Practices

### 1. Chọn Engine phù hợp
- **Tesseract**: Cho văn bản rõ ràng, nhiều ngôn ngữ
- **EasyOCR**: Cho tiếng Việt, văn bản phức tạp
- **Auto**: Khi không chắc chắn

### 2. Cải thiện độ chính xác
- **Ảnh chất lượng cao**: Độ phân giải tối thiểu 300 DPI
- **Tiền xử lý**: Bật `preprocess=true` (mặc định)
- **Ngôn ngữ chính xác**: Chọn đúng `language` parameter

### 3. Xử lý lỗi
- Kiểm tra `success` field trong response
- Xem `error` message nếu có lỗi
- Thử engine khác nếu một engine thất bại

## 🐛 Troubleshooting

### Lỗi "Tesseract not found"
```bash
# Windows: Thêm vào PATH
set PATH=%PATH%;C:\Program Files\Tesseract-OCR

# Linux: Cài đặt tesseract
sudo apt install tesseract-ocr

# macOS: Cài đặt qua Homebrew
brew install tesseract
```

### Lỗi "EasyOCR not available"
```bash
# Cài đặt EasyOCR
pip install easyocr

# Cài đặt dependencies
pip install opencv-python numpy
```

### Lỗi "No OCR engine available"
- Kiểm tra cài đặt Tesseract
- Kiểm tra cài đặt EasyOCR
- Xem logs để biết chi tiết lỗi

## 📊 Performance Tips

### 1. Tối ưu ảnh
- Resize ảnh về kích thước phù hợp
- Chuyển sang grayscale nếu không cần màu
- Sử dụng format PNG cho ảnh text

### 2. Chọn engine phù hợp
- **Tesseract**: Nhanh, ổn định
- **EasyOCR**: Chính xác hơn với tiếng Việt
- **Auto**: Cân bằng giữa tốc độ và độ chính xác

### 3. Batch processing
- Xử lý nhiều ảnh cùng lúc
- Sử dụng async processing
- Cache kết quả nếu có thể

## 🔗 Liên kết hữu ích

- **Tesseract OCR**: https://github.com/tesseract-ocr/tesseract
- **EasyOCR**: https://github.com/JaidedAI/EasyOCR
- **OpenCV**: https://opencv.org/
- **PIL/Pillow**: https://pillow.readthedocs.io/

## 📝 Ghi chú

- OCR Service hỗ trợ các format: JPG, PNG, TIFF, BMP, WEBP
- Kích thước file tối đa: 10MB
- Thời gian xử lý: 3-15 giây tùy kích thước ảnh
- Độ chính xác: >90% cho văn bản rõ ràng
