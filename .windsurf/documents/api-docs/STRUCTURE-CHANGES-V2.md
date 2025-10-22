# Tái cấu trúc API Response - Version 2

## 🎯 Mục tiêu
- ✅ Dễ tạo Entity (Java/MongoDB)
- ✅ Dễ lưu trong MongoDB Atlas
- ✅ Loại bỏ trường trùng lặp
- ✅ Tổ chức lại theo 8 nhóm chính

---

## 📊 Cấu trúc mới (8 trường chính)

```
data/
├── id                    # Document ID chính
├── overview/             # Thông tin tổng quan
├── metadata/             # File metadata, document metadata, technical
├── contract/             # Contract-specific data
├── content/              # Content extraction, OCR, AI processing
├── storage/              # Storage locations, S3, local
├── security/             # Security, permissions, encryption
├── versioning/           # Version control, history
└── audit/                # Audit logs, change history
```

---

## 🔄 Thay đổi chính

### 1. **Xóa `file` object (duplicate)**
**Trước:**
```json
"data": {
  "id": "FILE-2025-001-TEST",
  "file": {
    "id": "FILE-2025-001-TEST",  // ❌ Trùng với data.id
    "name": "test.txt",
    "type": "text/plain",
    "size": 312,
    "hash": {...},
    "permissions": {...},        // ❌ Di chuyển sang security
    "security": {...},           // ❌ Di chuyển sang security
    "version": 1                 // ❌ Di chuyển sang versioning
  }
}
```

**Sau:**
```json
"data": {
  "id": "FILE-2025-001-TEST",  // ✅ Chỉ 1 ID duy nhất
  "metadata": {
    "file": {                   // ✅ File metadata gộp vào metadata
      "name": "test.txt",
      "mimeType": "text/plain",
      "size": 312,
      "hash": {...}
    }
  },
  "security": {                 // ✅ Tập trung security
    "permissions": {...},
    "encryption": "AES-256",
    "watermark": true
  }
}
```

---

### 2. **Xóa `compliance.complianceStatus` (duplicate)**
**Trước:**
```json
"compliance": {
  "complianceStatus": "COMPLIANT",  // ❌ Trùng
  "status": "COMPLIANT",            // ❌ Trùng
  "regulations": [...]
}
```

**Sau:**
```json
"compliance": {
  "status": "COMPLIANT",  // ✅ Chỉ giữ 1 field
  "regulations": [...]
}
```

---

### 3. **Xóa `archivedDcFormat` duplicate**
**Trước:**
```json
"archivedDocument": {
  "archivedDcFormat": "application/pdf",  // Line 566
  "archivedDcTitle": "...",
  "archivedDcCreator": "...",
  "archivedDcFormat": "application/pdf"   // ❌ Line 574 - Duplicate
}
```

**Sau:**
```json
"archivedDocument": {
  "dcFormat": "application/pdf",  // ✅ Chỉ 1 lần
  "dcTitle": "...",
  "dcCreator": "..."
}
```

---

### 4. **Gộp security fields**
**Trước:**
```json
"file": {
  "permissions": {
    "read": [...],
    "write": [...]
  },
  "security": {
    "encryption": "AES-256",
    "watermark": true
  }
}
```

**Sau:**
```json
"security": {
  "encryption": "AES-256",
  "watermark": true,
  "digitalSignature": true,
  "accessLogging": true,
  "permissions": {
    "read": [...],
    "write": [...],
    "delete": [...],
    "share": [...]
  }
}
```

---

### 5. **Đổi tên versioning fields**
**Trước:**
```json
"versioning": {
  "currentVersionInfo": {
    "tag": "1.0",
    "number": 1
  }
}
```

**Sau:**
```json
"versioning": {
  "current": {              // ✅ Ngắn gọn hơn
    "number": 1,
    "tag": "1.0"
  }
}
```

---

## 📋 Chi tiết 8 nhóm chính

### 1️⃣ **id** (String)
```json
"id": "FILE-2025-001-TEST"
```
- Document ID duy nhất
- Format: `FILE-YYYY-NNN-TYPE`

---

### 2️⃣ **overview** (Object)
```json
"overview": {
  "title": "test-upload-file.txt",
  "status": "ACTIVE",
  "documentType": "CONTRACT",
  "tags": [],
  "ownerUserId": "system",
  "language": "vi",
  "region": "VN",
  "new": true
}
```

**Enum values:**
- `status`: ACTIVE, DRAFT, DELETED, ARCHIVED, INACTIVE
- `documentType`: CONTRACT, INVOICE, MEMO, REPORT, AGREEMENT, NOT_DOCUMENT
- `language`: vi, en, fr, zh (ISO 639-1)
- `region`: VN, US, EU, APAC (ISO 3166-1)

---

### 3️⃣ **metadata** (Object)
```json
"metadata": {
  "file": {
    "name": "test.txt",
    "mimeType": "text/plain",
    "size": 312,
    "hash": {"md5": "...", "sha256": "..."}
  },
  "fileSystem": {
    "dateAdded": "2025-10-19T08:45:00Z",
    "dateModified": "2025-10-19T08:45:00Z",
    "originalFilename": "test.txt",
    "originalMD5": "...",
    "originalFileSize": 312,
    "originalMimeType": "text/plain",
    "archiveMD5": "...",
    "archiveFileSize": 312
  },
  "originalDocument": {
    "dcFormat": "application/pdf",
    "dcTitle": "...",
    "dcCreator": "...",
    "xmpCreateDate": "...",
    "pdfProducer": "..."
  },
  "archivedDocument": {
    "dcFormat": "application/pdf",
    "dcTitle": "... (Archived)",
    "pdfProducer": "DocGO Archive System"
  },
  "technical": {
    "encoding": "UTF-8",
    "lineEnding": "LF",
    "pages": 15,
    "wordCount": 2500
  }
}
```

**Lưu ý:**
- `originalDocument`: PDF metadata (XMP, Dublin Core)
- `archivedDocument`: Chỉ có khi có archiveMD5
- `technical`: Technical properties (encoding, compression)

---

### 4️⃣ **contract** (Object)
```json
"contract": {
  "type": "Phát triển phần mềm",
  "effectiveDate": "2025-11-01",
  "expiryDate": "2025-12-31",
  "totalValue": 100000,
  "currency": "USD",
  "summary": "...",
  "workflow": {...},
  "parties": [...],
  "payment": {...},
  "clauses": {...},
  "reminders": [...],
  "risk": {...},
  "compliance": {...}
}
```

**Sub-objects:**
- `workflow`: currentStage, stages[]
- `parties`: Array of party objects (CLIENT, VENDOR, PARTNER)
- `payment`: method, schedule[]
- `clauses`: key[], unfavorable[], intellectualProperty, warranty
- `reminders`: Array of reminder objects
- `risk`: level, factors[], mitigationProposals[]
- `compliance`: status, regulations[], certifications[]

---

### 5️⃣ **content** (Object)
```json
"content": {
  "plaintext": "...",
  "extractedText": "...",
  "summary": "...",
  "keyTerms": [...],
  "sections": [...],
  "ocr": {
    "text": "...",
    "status": "COMPLETED",
    "engine": "TESSERACT",
    "confidence": 0.92
  },
  "extraction": {
    "status": "SUCCESS",
    "method": "DIRECT",
    "characterCount": 3757
  },
  "summarization": {
    "status": "SUCCESS",
    "model": "gemini-1.5-flash"
  },
  "classification": {
    "isContract": true,
    "confidence": 0.85,
    "language": "vi"
  },
  "processing": {
    "status": "COMPLETED",
    "error": null
  }
}
```

**Processing status:**
- `ocr.status`: COMPLETED, FAILED, PROCESSING, SKIPPED
- `extraction.status`: SUCCESS, PARTIAL, FAILED
- `summarization.status`: SUCCESS, FAILED, SKIPPED
- `processing.status`: COMPLETED, PROCESSING, FAILED

---

### 6️⃣ **storage** (Object)
```json
"storage": {
  "location": "s3://docgo-contracts/2024/01/",
  "backupLocations": [...],
  "retentionPolicy": {
    "duration": "7 years",
    "autoDelete": false,
    "archiveAfter": "2 years"
  },
  "accessControl": {
    "public": false,
    "restrictedUsers": [...],
    "ipWhitelist": [...]
  },
  "s3": {
    "url": "https://...",
    "bucket": "docgo-storage",
    "objectKey": "documents/FILE-2025-001-TEST.txt",
    "region": "us-east-1",
    "contentType": "text/plain",
    "size": 312,
    "versionId": "s3-version-xyz789",
    "checksum": {"md5": "..."}
  },
  "local": {
    "path": null,
    "filename": "test.txt",
    "mimeType": "text/plain",
    "size": 312
  }
}
```

---

### 7️⃣ **security** (Object)
```json
"security": {
  "encryption": "AES-256",
  "watermark": true,
  "digitalSignature": true,
  "accessLogging": true,
  "permissions": {
    "read": ["user-001", "user-002"],
    "write": ["user-001"],
    "delete": ["user-001"],
    "share": ["user-001"]
  }
}
```

**Enum values:**
- `encryption`: AES-256, AES-128, NONE

---

### 8️⃣ **versioning** (Object)
```json
"versioning": {
  "current": {
    "number": 1,
    "tag": "1.0"
  },
  "versions": [...],
  "changeLog": [...],
  "previousVersion": null,
  "changeSummary": null,
  "changedFields": [],
  "diff": {},
  "history": [...]
}
```

---

### 9️⃣ **audit** (Object)
```json
"audit": {
  "createdAt": "2025-10-19T08:45:00Z",
  "createdBy": "system",
  "lastModifiedAt": "2025-10-19T08:45:00Z",
  "lastModifiedBy": "system",
  "version": 1,
  "changeHistory": [...],
  "accessLog": [...],
  "updatedAt": "2025-10-19T08:45:00Z",
  "updatedBy": "system",
  "deletedAt": null,
  "deletedBy": null,
  "isDeleted": false
}
```

---

## 🗄️ MongoDB Entity Mapping

### Java Entity Structure
```java
@Document(collection = "documents")
public class DocumentEntity {
    @Id
    private String id;
    
    private Overview overview;
    private Metadata metadata;
    private Contract contract;
    private Content content;
    private Storage storage;
    private Security security;
    private Versioning versioning;
    private Audit audit;
    
    @CreatedDate
    private Instant createdAt;
    
    @LastModifiedDate
    private Instant lastModifiedAt;
}
```

### MongoDB Index
```javascript
// Indexes for MongoDB
db.documents.createIndex({ "id": 1 }, { unique: true })
db.documents.createIndex({ "overview.ownerUserId": 1, "overview.status": 1 })
db.documents.createIndex({ "contract.effectiveDate": 1, "contract.expiryDate": 1 })
db.documents.createIndex({ "metadata.file.hash.md5": 1 })
db.documents.createIndex({ "audit.createdAt": -1 })
```

---

## ✅ Lợi ích của cấu trúc mới

### 1. **Dễ mapping Entity**
- Mỗi top-level field = 1 nested object trong Java
- Không có duplicate fields
- Clear separation of concerns

### 2. **Tối ưu cho MongoDB**
- Flat structure ở top level (8 fields)
- Nested objects có cấu trúc rõ ràng
- Dễ query và index

### 3. **Dễ maintain**
- Mỗi section có mục đích riêng
- Không bị trùng lặp
- Dễ extend trong tương lai

### 4. **Type-safe**
- Tất cả enum values đã được document
- Clear data types cho mỗi field
- Validation dễ dàng

---

## 🚀 Next Steps

1. **Update FileService.java**
   - Map response theo structure mới
   - Update helper functions

2. **Update Entity classes**
   - Tạo nested classes cho mỗi section
   - Add proper annotations

3. **Update MongoDB repository**
   - Tạo indexes theo structure mới
   - Update queries

4. **Update API documentation**
   - Cập nhật Swagger annotations
   - Update API docs

---

## 📝 Migration Guide

### Từ v1 sang v2:
```java
// V1
String fileId = response.getData().getFile().getId();
String fileName = response.getData().getFile().getName();
List<String> readPermissions = response.getData().getFile().getPermissions().getRead();

// V2
String fileId = response.getData().getId();
String fileName = response.getData().getMetadata().getFile().getName();
List<String> readPermissions = response.getData().getSecurity().getPermissions().getRead();
```

---

**Generated:** 2025-10-22  
**Version:** 2.0  
**Status:** ✅ Ready for implementation
