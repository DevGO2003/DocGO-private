# Sửa lỗi Contract Creation Flow - AI Service Down

## 🔍 **Vấn đề phát hiện**

Khi tắt `ai-processing-service`, contract vẫn được tạo trong `contract-management-service` mặc dù chưa có AI summary. Điều này tạo ra dữ liệu không nhất quán.

## 🔍 **Nguyên nhân**

### Luồng xử lý cũ (SAI):
1. **File Storage Service** upload file → gửi `FileUploaded` event
2. **AI Processing Service** (nếu chạy) → xử lý file → gửi `contract.summary.updated` event  
3. **Contract Management Service** nhận `contract.summary.updated` event → **NGAY LẬP TỨC** tạo contract

### Vấn đề:
- Contract được tạo **TRƯỚC KHI** kiểm tra AI service có hoạt động không
- Event có thể được gửi từ cache/queue ngay cả khi AI service tắt
- Không có validation dữ liệu AI summary

## 🛠️ **Giải pháp đã triển khai**

### 1. **Thêm validation nghiêm ngặt trong ContractEventsKafkaListener**

```java
// Kiểm tra nguồn gốc event - chỉ xử lý từ AI service
String source = (String) event.get("source");
if (!"ai-processing-service".equals(source)) {
    logger.warn("Ignoring event from unexpected source: {}", source);
    return;
}

// Kiểm tra dữ liệu AI summary hợp lệ
if (!isValidAISummary(summaryData)) {
    logger.warn("Event không chứa dữ liệu AI summary hợp lệ - bỏ qua");
    return;
}
```

### 2. **Validation dữ liệu AI summary**

```java
private boolean isValidAISummary(Map<String, Object> summaryData) {
    // Kiểm tra các trường bắt buộc
    String title = (String) summaryData.get("title");
    String summary = (String) summaryData.get("summary");
    String contractType = (String) summaryData.get("contractType");
    
    // Kiểm tra không rỗng
    if (title == null || title.trim().isEmpty()) return false;
    if (summary == null || summary.trim().isEmpty()) return false;
    if (contractType == null || contractType.trim().isEmpty()) return false;
    
    // Kiểm tra không phải fallback data
    if ("UNKNOWN".equals(contractType) || "FALLBACK".equals(contractType)) {
        return false;
    }
    
    return true;
}
```

### 3. **Luồng xử lý mới (ĐÚNG)**

1. **File Storage Service** upload file → gửi `FileUploaded` event
2. **Contract Management Service** nhận `FileUploaded` → **CHỈ** lưu file metadata (không tạo contract)
3. **AI Processing Service** (nếu chạy) → xử lý file → gửi `contract.summary.updated` event
4. **Contract Management Service** nhận `contract.summary.updated` → **VALIDATE** dữ liệu AI → tạo contract

## ✅ **Kết quả**

- **Khi AI service chạy**: Contract được tạo với đầy đủ AI summary
- **Khi AI service tắt**: Contract **KHÔNG** được tạo, chỉ lưu file metadata
- **Dữ liệu nhất quán**: Contract chỉ tồn tại khi có AI summary hợp lệ

## 🔧 **Files đã sửa**

- `backend/contract-management-service/src/main/java/com/devgo2003/docgo/contract_service/listener/ContractEventsKafkaListener.java`
  - Thêm validation nguồn gốc event
  - Thêm validation dữ liệu AI summary
  - Thêm logging chi tiết

## 🧪 **Cách test**

1. **Tắt AI service**: `docker stop ai-processing-service`
2. **Upload file**: Contract sẽ KHÔNG được tạo
3. **Bật AI service**: `docker start ai-processing-service`  
4. **Upload file**: Contract sẽ được tạo với AI summary

## 📝 **Lưu ý**

- File metadata vẫn được lưu ngay cả khi AI service tắt
- Contract chỉ được tạo khi có AI summary hợp lệ
- Event từ nguồn khác (không phải AI service) sẽ bị bỏ qua
- Fallback/unknown data sẽ bị từ chối

