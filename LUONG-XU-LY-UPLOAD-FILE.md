# Luồng xử lý Upload File trong DocGO

## Tổng quan
Sau khi upload file thành công, hệ thống DocGO xử lý file qua 3 giai đoạn chính thông qua Kafka events.

---

## 📋 Các bước xử lý

### 1️⃣ **Upload File** (`automation-service`)
**File:** `backend/automation-service/file_router.py` - Hàm `upload_document()`

#### Quy trình:
1. **Nhận file từ client**
   - Xác định MIME type
   - Tạo `correlationId` để theo dõi
   - Log audit trail

2. **Upload lên S3**
   - Retry tối đa 3 lần nếu fail
   - Nhận về `file_id` và `file_url`
   - Lưu vào queue `RECENT_UPLOADS`

3. **OCR/Trích xuất text**
   - Sử dụng `ocr_service.extract_text_and_metadata()`
   - Retry tối đa 2 lần
   - Trích xuất nội dung text từ file (PDF, DOCX, images, JSON...)

4. **AI Classification**
   - Gọi `ai_service.classify_document_with_ai()`
   - Xác định:
     - `isContract`: File có phải hợp đồng không?
     - `category`: Loại tài liệu
     - `documentType`: Kiểu tài liệu
     - `language`: Ngôn ngữ
     - `confidence`: Độ tin cậy

5. **AI Summarization** (Chỉ nếu là hợp đồng)
   - Gọi `ai_service.generate_contract_summary()`
   - Trích xuất metadata hợp đồng:
     - Thông tin cơ bản: `effectiveDate`, `expiryDate`, `totalValue`, `currency`
     - Các bên tham gia: `parties`
     - Thanh toán: `payment`
     - Điều khoản: `clauses` (key, favorable, unfavorable, all)
     - Nhắc nhở: `reminders`
     - Rủi ro: `risk`
     - Tuân thủ: `compliance`

6. **Publish 3 Kafka Events**
   - Event 1: `FILE_UPLOAD_COMPLETED`
   - Event 2: `FILE_CONTENT_EXTRACTED`
   - Event 3: `CONTRACT_SUMMARY_GENERATED` (chỉ nếu là hợp đồng)

7. **Trả về response cho client**
   - **Sync mode (< 2MB):** HTTP 201 - Trả về ngay kết quả xử lý
   - **Async mode (≥ 2MB):** HTTP 202 - Xử lý background, client theo dõi qua WebSocket

---

### 2️⃣ **Consumer Nhận Events** (`repository-management-service`)
**File:** `backend/repository-management-service/.../DocgoFileEventsConsumer.java`

#### Kafka Topic: `docgo-file-events`

Consumer lắng nghe topic và route events đến các handler tương ứng:

```java
@KafkaListener(
    topics = "docgo-file-events",
    groupId = "repository-service-group"
)
public void handleDocgoFileEvent(String payload) {
    // Parse event
    String eventType = event.get("eventType");
    String fileId = event.get("data.fileId");
    
    // Route to handler
    switch (eventType) {
        case "FILE_UPLOAD_COMPLETED":
            handleFileUploadCompleted(fileId, event);
            break;
        case "FILE_CONTENT_EXTRACTED":
            handleFileContentExtracted(fileId, event);
            break;
        case "CONTRACT_SUMMARY_GENERATED":
            handleContractSummaryGenerated(fileId, event);
            break;
    }
}
```

---

### 3️⃣ **Xử lý từng Event** (`FileEventServiceImpl.java`)

#### Event 1: `FILE_UPLOAD_COMPLETED`
**Mục đích:** Tạo skeleton của FileEntity trong database

**Handler:** `processFileMetadataRecorded()`

**Xử lý:**
```java
FileEntity entity = new FileEntity();
entity.setId(fileId);
entity.setRepositoryId(repositoryId);
entity.setName(fileName);
entity.setContentType(mimeType);
entity.setSize(fileSize);
entity.setOwnerUserId(userId);

// Map storage information (S3 hoặc local)
entity.setStorage(storageInfo);

// Map file metadata
entity.setMetadata(fileSystemMetadata);

// Set audit trail
entity.setAudit({
    createdAt: now,
    createdBy: actor,
    correlationId: correlationId
});

fileRepository.save(entity);
```

**Kết quả:** Document được tạo trong database với trạng thái `UPLOADED`

---

#### Event 2: `FILE_CONTENT_EXTRACTED`
**Mục đích:** Cập nhật nội dung text và classification vào document

**Handler:** `processFilePlaintextExtracted()`

**Xử lý:**
```java
// Tìm entity đã tạo
FileEntity entity = fileRepository.findById(fileId);

// Update title
entity.overview.title = data.title;

// Map OCR information
entity.content.ocr = {
    text: ocrText,              // Nội dung text đã trích xuất
    status: "COMPLETED",
    engine: "TESSERACT",
    confidence: 0.95,
    processedAt: timestamp
};

// Map classification
entity.documentType = "CONTRACT" | "GENERAL";
entity.isContract = true/false;
entity.confidence = 0.85;
entity.language = "vi" | "en";
entity.reasons = ["Lý do 1", "Lý do 2"];

// Map key terms
entity.keyTerms = ["term1", "term2", ...];

// Update audit
entity.audit.updatedAt = now;
entity.audit.updatedBy = actor;

fileRepository.save(entity);
```

**Kết quả:** Document có đầy đủ nội dung text và thông tin classification

---

#### Event 3: `CONTRACT_SUMMARY_GENERATED`
**Mục đích:** Cập nhật metadata hợp đồng chi tiết (chỉ cho hợp đồng)

**Handler:** `processContractSummaryGenerated()`

**Xử lý:**
```java
// Tìm entity
FileEntity entity = fileRepository.findById(fileId);

// Map contract metadata
entity.contract = {
    // Thông tin cơ bản
    type: "SERVICE_AGREEMENT",
    effectiveDate: "2024-01-01",
    expiryDate: "2025-01-01",
    totalValue: 1000000000,
    currency: "VND",
    summary: "Tóm tắt hợp đồng...",
    
    // Các bên tham gia
    parties: [
        {
            id: "party-1",
            name: "Công ty ABC",
            type: "CLIENT",
            role: "Bên A",
            contact: {
                email: "abc@company.com",
                phone: "0123456789",
                address: "123 Street"
            },
            representative: {
                name: "Nguyễn Văn A",
                position: "Giám đốc",
                email: "nva@company.com"
            },
            taxCode: "0123456789"
        }
    ],
    
    // Thanh toán
    payment: {
        schedule: "Theo từng giai đoạn",
        method: "BANK_TRANSFER",
        paymentMethod: "Chuyển khoản ngân hàng"
    },
    
    // Điều khoản
    clauses: {
        all: [/* Tất cả điều khoản */],
        key: [/* Điều khoản quan trọng */],
        favorable: [/* Điều khoản có lợi */],
        unfavorable: [/* Điều khoản bất lợi */],
        intellectualProperty: "...",
        confidentiality: "...",
        warranty: "...",
        termination: "..."
    },
    
    // Nhắc nhở
    reminders: [
        {
            date: "2024-06-01",
            type: "PAYMENT_DUE",
            title: "Thanh toán đợt 1",
            description: "...",
            notifyBefore: 7,
            status: "PENDING",
            assignedTo: "user-id"
        }
    ],
    
    // Rủi ro
    risk: {
        level: "MEDIUM",
        score: 5.5,
        factors: ["Factor 1", "Factor 2"],
        mitigations: ["Biện pháp 1", "Biện pháp 2"],
        advice: "Khuyến nghị..."
    },
    
    // Tuân thủ
    compliance: {
        status: "COMPLIANT",
        requirements: ["Yêu cầu 1", "Yêu cầu 2"],
        regulations: ["Quy định 1", "Quy định 2"],
        certifications: ["Chứng chỉ 1"],
        issues: [],
        recommendations: ["Đề xuất 1"]
    }
};

// Update overview
entity.overview.documentType = "CONTRACT";
entity.overview.isContract = true;

// Update audit
entity.audit.updatedAt = now;

fileRepository.save(entity);
```

**Kết quả:** Document hợp đồng có đầy đủ metadata chi tiết để quản lý và phân tích

---

## 🔄 Luồng dữ liệu tổng thể

```
┌─────────────────┐
│   CLIENT        │
│  (Frontend)     │
└────────┬────────┘
         │ POST /files
         ▼
┌─────────────────────────────────────────────────────────────┐
│           AUTOMATION SERVICE (Python)                        │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────────┐   │
│  │ Upload │→│  OCR   │→│   AI   │→│ Kafka Publish  │   │
│  │   S3   │  │Extract │  │Classify│  │  (3 events)    │   │
│  └────────┘  └────────┘  └────────┘  └────────────────┘   │
└────────┬────────────────────────────────────────────────────┘
         │ Publish to Kafka
         ▼
┌─────────────────────────────────────────────────────────────┐
│                KAFKA TOPIC: docgo-file-events               │
│  [FILE_UPLOAD_COMPLETED] → [FILE_CONTENT_EXTRACTED]        │
│                         → [CONTRACT_SUMMARY_GENERATED]      │
└────────┬────────────────────────────────────────────────────┘
         │ Consume
         ▼
┌─────────────────────────────────────────────────────────────┐
│      REPOSITORY-MANAGEMENT SERVICE (Java/Spring)            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         DocgoFileEventsConsumer.java                  │  │
│  │  - Listen to Kafka topic                             │  │
│  │  - Route events to handlers                          │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         FileEventServiceImpl.java                     │  │
│  │                                                        │  │
│  │  Event 1: processFileMetadataRecorded()              │  │
│  │           → Tạo FileEntity skeleton                  │  │
│  │                                                        │  │
│  │  Event 2: processFilePlaintextExtracted()            │  │
│  │           → Update content + classification          │  │
│  │                                                        │  │
│  │  Event 3: processContractSummaryGenerated()          │  │
│  │           → Update contract metadata                 │  │
│  └───────────────────┬──────────────────────────────────┘  │
│                      ▼                                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │            MongoDB Database                           │  │
│  │  Collection: files                                    │  │
│  │  Document: FileEntity với đầy đủ metadata            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│   API GATEWAY   │
│  (Query files)  │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│   CLIENT        │
│  (Frontend)     │
└─────────────────┘
```

---

## 📊 Dữ liệu trả về cho Client

### Response ngay sau upload (HTTP 201/202)

#### Sync mode (201 Created):
```json
{
  "apiVersion": "v1",
  "timestamp": "2024-01-15T10:30:00Z",
  "requestId": "req-123",
  "path": "/api/v1/files",
  "statusCode": 201,
  "shortMessage": "Created",
  "description": "Document created and processed (sync)",
  "data": {
    "fileId": "01HQVZ...",
    "fileUrl": "https://s3.../files/01HQVZ.../document.pdf",
    "repositoryId": "repo-123",
    "correlationId": "corr-456"
  }
}
```

#### Async mode (202 Accepted):
```json
{
  "apiVersion": "v1",
  "statusCode": 202,
  "shortMessage": "Accepted",
  "description": "Document accepted for processing (async)",
  "data": {
    "documentId": "01HQVZ...",
    "fileUrl": "https://s3.../files/01HQVZ.../document.pdf",
    "websocketUrl": "ws://localhost:8003/ws/document/01HQVZ...",
    "correlationId": "corr-456"
  }
}
```

### Document đầy đủ sau khi xử lý (Query từ Repository Service)

```json
{
  "id": "01HQVZ...",
  "repositoryId": "repo-123",
  "name": "hop-dong-xay-dung.pdf",
  "contentType": "application/pdf",
  "size": 1024000,
  "ownerUserId": "user-123",
  
  "documentType": "CONTRACT",
  "isContract": true,
  "confidence": 0.95,
  "language": "vi",
  "reasons": ["Có cụm từ hợp đồng", "Có điều khoản pháp lý"],
  "keyTerms": ["hợp đồng", "bên A", "bên B", "thanh toán"],
  
  "storage": {
    "type": "s3",
    "s3": {
      "url": "https://s3.../files/01HQVZ.../document.pdf",
      "bucket": "docgo-storage",
      "objectKey": "documents/01HQVZ.../document.pdf",
      "region": "us-east-1"
    }
  },
  
  "content": {
    "ocr": {
      "text": "Nội dung đầy đủ của hợp đồng...",
      "status": "COMPLETED",
      "engine": "TESSERACT",
      "confidence": 0.95,
      "processedAt": "2024-01-15T10:30:05Z"
    }
  },
  
  "contract": {
    "type": "SERVICE_AGREEMENT",
    "effectiveDate": "2024-01-01",
    "expiryDate": "2025-01-01",
    "totalValue": 1000000000,
    "currency": "VND",
    "summary": "Hợp đồng xây dựng công trình...",
    "parties": [/* ... */],
    "payment": {/* ... */},
    "clauses": {/* ... */},
    "reminders": [/* ... */],
    "risk": {/* ... */},
    "compliance": {/* ... */}
  },
  
  "audit": {
    "createdAt": "2024-01-15T10:30:00Z",
    "createdBy": "user-123",
    "updatedAt": "2024-01-15T10:30:10Z",
    "updatedBy": "system",
    "correlationId": "corr-456",
    "version": 1,
    "isDeleted": false
  }
}
```

---

## 🔍 Các service chịu trách nhiệm

| Service | Vai trò | Công nghệ |
|---------|---------|-----------|
| **automation-service** | Upload file, OCR, AI classification, AI summarization, Publish Kafka events | Python/FastAPI |
| **Kafka** | Message broker - Truyền events giữa các service | Apache Kafka |
| **repository-management-service** | Consume events, Lưu trữ document vào MongoDB | Java/Spring Boot |
| **MongoDB** | Database lưu trữ document metadata | MongoDB |
| **S3 (hoặc local)** | Lưu trữ file thực tế | AWS S3 / Local filesystem |

---

## ✅ Kết luận

Sau khi upload file thành công:

1. **automation-service** xử lý file (OCR, AI classification, AI summarization)
2. **automation-service** publish 3 Kafka events
3. **repository-management-service** consume events và lưu vào MongoDB
4. Client có thể query document đầy đủ từ **repository-management-service**

Luồng này đảm bảo:
- ✅ Xử lý không đồng bộ, không block client
- ✅ Tách biệt trách nhiệm giữa các service
- ✅ Dữ liệu được chuẩn hóa và phong phú
- ✅ Hỗ trợ cả sync và async processing
- ✅ Có audit trail đầy đủ để trace
