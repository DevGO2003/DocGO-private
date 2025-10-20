# Báo Cáo: Vấn Đề Event Flow Giữa Automation và Repository Services

## ❌ VẤN ĐỀ CHÍNH: KAFKA TOPICS KHÔNG KHỚP

### 🔴 **automation-service** (Producer) PUBLISH:
```
✅ file.metadata.recorded
✅ file.plaintext.extracted  
✅ contract.summary.generated
```

**File:** `backend/automation-service/file_router.py` (line 834-960)
```python
await event_service.publish_kafka("file.metadata.recorded", metadata_evt)
await event_service.publish_kafka("file.plaintext.extracted", plaintext_evt)
await event_service.publish_kafka("contract.summary.generated", contract_evt)
```

### 🔴 **repository-management-service** (Consumer) CONSUME:
```
❌ file.uploaded
❌ file.processed
❌ file.updated
❌ file.classified
❌ file.analyzed
❌ file.deleted
```

**File:** `backend/repository-management-service/services/event_consumer.py` (line 26-31)
```python
self._consumer = AIOKafkaConsumer(
    FMConfig.KAFKA_FILE_UPLOADED_TOPIC,      # = "file.uploaded"
    FMConfig.KAFKA_FILE_PROCESSED_TOPIC,     # = "file.processed"
    FMConfig.KAFKA_FILE_UPDATED_TOPIC,       # = "file.updated"
    FMConfig.KAFKA_FILE_CLASSIFIED_TOPIC,    # = "file.classified"
    FMConfig.KAFKA_FILE_ANALYZED_TOPIC,      # = "file.analyzed"
    FMConfig.KAFKA_FILE_DELETED_TOPIC,       # = "file.deleted"
    ...
)
```

---

## 📊 KẾT QUẢ TEST

### Test Script: `test-event-flow.ps1`

```
📤 Upload file: ✅ SUCCESS
   - File ID: 2c5d176c-cfe3-4ee0-9cbe-c357613bb68b
   
📨 Events Published (automation-service):
   ✅ file.metadata.recorded
   ✅ file.plaintext.extracted
   ✅ contract.summary.generated (nếu là contract)

📥 Events Consumed (repository-service):
   ❌ KHÔNG CÓ LOG NÀO - Consumer không nhận được events

🔍 GET /files/{id}:
   ❌ 404 NOT FOUND - File không có trong repository
```

---

## 🛠️ GIẢI PHÁP

### **Phương án 1: Sửa Consumer Topics (KHUYẾN NGHỊ)**

Cập nhật `backend/repository-management-service/services/event_consumer.py`:

```python
self._consumer = AIOKafkaConsumer(
    "file.metadata.recorded",           # ✅ Khớp với producer
    "file.plaintext.extracted",         # ✅ Khớp với producer
    "contract.summary.generated",       # ✅ Khớp với producer
    bootstrap_servers=FMConfig.KAFKA_BOOTSTRAP_SERVERS,
    group_id=FMConfig.KAFKA_GROUP_ID,
    ...
)
```

Và sửa handler trong `_handle_message`:
```python
async def _handle_message(self, payload: dict) -> None:
    event_type = payload.get("eventType")
    
    if event_type == "file.metadata.recorded":
        await self._save_file_basic_metadata(payload.get("data"))
    elif event_type == "file.plaintext.extracted":
        await self._save_file_processed_metadata(payload.get("data"))
    elif event_type == "contract.summary.generated":
        await self._update_file_analysis(payload.get("data"))
```

### **Phương án 2: Sửa Producer Topics**

Cập nhật automation-service publish topics khớp với consumer topics hiện tại.

---

## 📋 CHECKLIST KIỂM TRA

- [x] Upload file thành công
- [x] Events được publish vào Kafka
- [ ] Events được consumer nhận
- [ ] Data được lưu vào MongoDB
- [ ] API GET /files/{id} trả về data
- [ ] Response khớp với `document-management-sample.json`

---

## 🎯 KẾT LUẬN

**Hiện tại:** Event flow **HOÀN TOÀN KHÔNG HOẠT ĐỘNG** do topics không khớp.

**Cần làm ngay:**
1. Thống nhất topics giữa producer và consumer
2. Test lại flow sau khi sửa
3. Kiểm tra MongoDB có nhận data không
4. Verify API response theo sample.json

**Thời gian ước tính:** 10-15 phút để sửa và test lại
