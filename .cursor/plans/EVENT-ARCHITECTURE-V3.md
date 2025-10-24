# 🎯 Event Architecture v3 - DocGO File Upload Flow

## 📊 Overview

Kiến trúc event-driven cho file upload flow với 3 microservices:
- **API Gateway**: Routing layer
- **Automation Service**: Chủ trì upload & processing
- **Repository Service**: Passive storage (MongoDB)

**Version:** 3.0  
**Created:** 2025-10-23  
**Status:** ✅ Implemented & Tested

---

## 🔄 Upload Flow

```
User Upload File
    ↓
🌐 API Gateway
    └─ Forward → Automation Service
                     ↓
📁 Automation Service (Master)
    ├─ 1. Generate documentId (UUID v7)
    ├─ 2. Upload to S3
    ├─ 3. OCR/Extract text
    ├─ 4. AI Processing (classify, summarize)
    └─ 5. Publish Kafka Events (3 events) to single topic:
         ① FILE_UPLOAD_COMPLETED
         ② FILE_CONTENT_EXTRACTED
         ③ CONTRACT_SUMMARY_GENERATED (conditional)
                     ↓
📊 Repository Service (Passive)
    └─ Single Kafka Consumer (DocgoFileEventsConsumer)
        ├─ Listen to topic: docgo-file-events
        ├─ Route by eventType
        └─ UPSERT MongoDB (deep merge)
```

---

## 📋 Event Types

| # | Event Name | Publisher | Consumer | Timing | Conditional |
|---|-----------|-----------|----------|--------|-------------|
| **1** | `FILE_UPLOAD_COMPLETED` | Automation | Repository | 0-2s | Always |
| **2** | `FILE_CONTENT_EXTRACTED` | Automation | Repository | 1-10s | Always |
| **3** | `CONTRACT_SUMMARY_GENERATED` | Automation | Repository | 10-30s | Only if isContract=true |

---

## 📝 Event 1: FILE_UPLOAD_COMPLETED

**Purpose:** Tạo document skeleton với basic metadata  
**Timing:** Ngay sau upload S3 thành công  
**Requirement:** **BẮT BUỘC ĐẦU TIÊN** - Repository cần có skeleton trước khi nhận Event 2/3

### Event Payload

```json
{
  "eventVersion": "1.0",
  "eventType": "FILE_UPLOAD_COMPLETED",
  "eventId": "018c4e88-89a1-7000-8000-0123456789ab",
  "timestamp": "2025-10-23T10:00:00.000Z",
  "source": "automation-service",
  "correlationId": "req-abc123",
  "actor": "user:12345",
  
  "data": {
    "documentId": "018c4e88-89a1-7000-8000-fedcba987654",
    "fileName": "contract.pdf",
    "mimeType": "application/pdf",
    "size": 1024000,
    "ownerUserId": "user-12345",
    
    "storage": {
      "s3": {
        "url": "https://docgo-storage.s3.amazonaws.com/documents/FILE-001.pdf",
        "bucket": "docgo-storage",
        "objectKey": "documents/018c4e88.../contract.pdf",
        "region": "us-east-1",
        "contentType": "application/pdf",
        "size": 1024000,
        "versionId": "v1.0",
        "checksum": {
          "md5": "abc123...",
          "sha256": "def456..."
        }
      }
    },
    
    "metadata": {
      "file": {
        "name": "contract.pdf",
        "mimeType": "application/pdf",
        "size": 1024000,
        "hash": {
          "md5": "abc123...",
          "sha256": "def456..."
        }
      },
      "fileSystem": {
        "dateAdded": "2025-10-23T10:00:00Z",
        "dateModified": "2025-10-23T10:00:00Z",
        "originalFilename": "contract.pdf",
        "originalMD5": "abc123...",
        "originalFileSize": 1024000,
        "originalMimeType": "application/pdf"
      }
    }
  }
}
```

### Repository Service Action

**Tạo FileEntity mới:**

```json
{
  "id": "018c4e88-89a1-7000-8000-fedcba987654",
  
  "overview": {
    "title": "contract.pdf",
    "status": "UPLOADED",
    "ownerUserId": "user-12345",
    "region": "VN",
    "priority": "LOW"
  },
  
  "storage": { "s3": {...} },
  "metadata": { "file": {...}, "fileSystem": {...} },
  
  "audit": {
    "createdAt": "2025-10-23T10:00:00Z",
    "createdBy": "user-12345",
    "updatedAt": "2025-10-23T10:00:00Z",
    "updatedBy": "user-12345",
    "version": 1,
    "isDeleted": false
  }
}
```

### Fields Set by Repository

| Field | Value | Logic |
|-------|-------|-------|
| `overview.status` | "UPLOADED" | Lifecycle state |
| `overview.region` | "VN" | Default region |
| `overview.priority` | "LOW" | **Default priority** |
| `audit.*` | Auto-generated | Timestamp, version |

### Fields NOT Set (chờ Event 2)

- `overview.documentType`
- `overview.category`
- `overview.language`
- `content` section
- `metadata.technical`

---

## 📝 Event 2: FILE_CONTENT_EXTRACTED

**Purpose:** Bổ sung content + AI classification  
**Timing:** 1-10s sau Event 1  
**Ordering:** Có thể đến trước hoặc sau Event 3

### Event Payload

```json
{
  "eventVersion": "1.0",
  "eventType": "FILE_CONTENT_EXTRACTED",
  "eventId": "018c4e88-8a12-7001-8001-0123456789cd",
  "timestamp": "2025-10-23T10:00:05.000Z",
  "source": "automation-service",
  "correlationId": "req-abc123",
  "actor": "system",
  
  "data": {
    "documentId": "018c4e88-89a1-7000-8000-fedcba987654",
    
    "content": {
      "plaintext": "Full extracted text from document...",
      "extractedText": "Full extracted text from document...",
      "summary": "AI-generated summary of the document...",
      "keyTerms": ["software", "contract", "payment", "deadline"],
      
      "sections": [
        {
          "title": "Article 1: Contract Subject",
          "description": "Main scope description",
          "content": "Party A hires Party B to develop...",
          "pageNumber": 1
        }
      ],
      
      "ocr": {
        "text": "OCR extracted text...",
        "status": "COMPLETED",
        "engine": "TESSERACT",
        "confidence": 0.92,
        "processedAt": "2025-10-23T10:00:03Z",
        "processingTime": 2.5,
        "metadata": {
          "language": "vie+eng",
          "pageCount": 15,
          "boxCount": 142,
          "averageConfidence": 0.92
        }
      },
      
      "extraction": {
        "status": "SUCCESS",
        "method": "DIRECT",
        "extractedAt": "2025-10-23T10:00:02Z",
        "characterCount": 15000,
        "wordCount": 2500
      },
      
      "summarization": {
        "status": "SUCCESS",
        "model": "gemini-1.5-flash",
        "processedAt": "2025-10-23T10:00:04Z",
        "processingTime": 1.8,
        "inputTokens": 3500,
        "outputTokens": 250
      },
      
      "classification": {
        "isContract": true,
        "documentType": "CONTRACT",
        "category": "Legal Documents",
        "language": "vi",
        "confidence": 0.85
      },
      
      "processing": {
        "status": "COMPLETED",
        "error": null
      }
    },
    
    "metadata": {
      "technical": {
        "encoding": "UTF-8",
        "lineEnding": "LF",
        "bom": false,
        "compression": "NONE",
        "pages": 15,
        "wordCount": 2500,
        "characterCount": 15000
      },
      
      "originalDocument": {
        "dcFormat": "application/pdf",
        "dcTitle": "Software Development Contract",
        "dcCreator": "Microsoft Word 2019",
        "dcDescription": "Contract for DocGO system development",
        "dcSubject": "Contract, Software Development, DocGO",
        "xmpCreateDate": "2024-01-15T08:30:00Z",
        "xmpCreatorTool": "Microsoft Word 2019",
        "xmpModifyDate": "2024-01-15T09:00:00Z",
        "xmpMetadataDate": "2024-01-15T09:00:00Z",
        "xmpDocumentID": "doc-2024-004",
        "xmpInstanceID": "doc-2024-004-v1.0",
        "pdfKeywords": "contract, development, software",
        "pdfProducer": "Microsoft Word 2019",
        "pdfaidPart": 3,
        "pdfaidConformance": "B"
      }
    }
  }
}
```

### Repository Service Action

**UPDATE FileEntity (deep merge):**

```json
{
  "id": "018c4e88-89a1-7000-8000-fedcba987654",
  
  "overview": {
    "title": "contract.pdf",
    "status": "PROCESSED",
    "documentType": "CONTRACT",
    "category": "Legal Documents",
    "language": "vi",
    "ownerUserId": "user-12345",
    "region": "VN",
    "priority": "LOW"
  },
  
  "content": { "plaintext": "...", "ocr": {...}, "classification": {...} },
  
  "metadata": {
    "file": {...},
    "fileSystem": {...},
    "technical": {...},
    "originalDocument": {...}
  },
  
  "audit": {
    "updatedAt": "2025-10-23T10:00:05Z",
    "updatedBy": "system"
  }
}
```

### Fields Updated

| Field | Old | New | Source |
|-------|-----|-----|--------|
| `overview.status` | "UPLOADED" | "PROCESSED" | Repository lifecycle |
| `overview.documentType` | null | "CONTRACT" | AI classification |
| `overview.category` | null | "Legal Documents" | AI classification |
| `overview.language` | null | "vi" | AI detection |
| `content` | null | {...} | Full content section |
| `metadata.technical` | null | {...} | Computed values |
| `metadata.originalDocument` | null | {...} | PDF metadata (if PDF) |

### PDF Metadata Extraction

**Chỉ extract nếu `mimeType = "application/pdf"`**

Fields extracted:
- Dublin Core: `dcFormat`, `dcTitle`, `dcCreator`, `dcDescription`, `dcSubject`
- XMP: `xmpCreateDate`, `xmpCreatorTool`, `xmpModifyDate`, `xmpDocumentID`
- PDF/A: `pdfaidPart`, `pdfaidConformance`
- Other: `pdfKeywords`, `pdfProducer`

---

## 📝 Event 3: CONTRACT_SUMMARY_GENERATED

**Purpose:** Bổ sung contract analysis (chỉ khi isContract=true)  
**Timing:** 10-30s sau Event 1  
**Ordering:** Có thể đến trước hoặc sau Event 2  
**Conditional:** Chỉ publish nếu `classification.isContract = true`

### Event Payload

```json
{
  "eventVersion": "1.0",
  "eventType": "CONTRACT_SUMMARY_GENERATED",
  "eventId": "018c4e88-8b13-7002-8002-abcdef123456",
  "timestamp": "2025-10-23T10:00:25.000Z",
  "source": "automation-service",
  "correlationId": "req-abc123",
  "actor": "system",
  
  "data": {
    "documentId": "018c4e88-89a1-7000-8000-fedcba987654",
    
    "contract": {
      "type": "SOFTWARE_DEVELOPMENT",
      "effectiveDate": "2025-11-01",
      "expiryDate": "2025-12-31",
      "totalValue": 100000,
      "currency": "USD",
      "summary": "Software development contract between Company A and Company B",
      "project": "DocGO Platform Development",
      "department": "IT Department",
      "priority": "HIGH",
      "confidentiality": "CONFIDENTIAL",
      
      "parties": [
        {
          "id": "party-001",
          "name": "Company A",
          "type": "BUYER",
          "contact": {
            "email": "contact@companya.com",
            "phone": "+84-123-456-789",
            "address": "123 Main Street, District 1, HCMC"
          },
          "representative": {
            "name": "Mr. Nguyen Van A",
            "position": "CEO",
            "email": "ceo@companya.com"
          }
        },
        {
          "id": "party-002",
          "name": "Company B",
          "type": "SELLER",
          "contact": {
            "email": "contact@companyb.com",
            "phone": "+84-987-654-321",
            "address": "456 Tech Avenue, District 2, HCMC"
          },
          "representative": {
            "name": "Ms. Tran Thi B",
            "position": "Director",
            "email": "director@companyb.com"
          }
        }
      ],
      
      "payment": {
        "method": "BANK_TRANSFER",
        "schedule": [
          {
            "milestone": "Phase 1 Completion",
            "percentage": 50,
            "amount": 50000,
            "dueDate": "2025-11-30",
            "status": "PENDING"
          },
          {
            "milestone": "Final Acceptance",
            "percentage": 50,
            "amount": 50000,
            "dueDate": "2025-12-31",
            "status": "PENDING"
          }
        ]
      },
      
      "clauses": {
        "key": [
          {
            "name": "Payment Terms",
            "description": "50% upon phase completion, 50% upon final acceptance",
            "content": "Payment shall be made in 2 phases...",
            "importance": "HIGH",
            "risk": "MEDIUM",
            "advice": "Ensure milestone criteria are clearly defined"
          }
        ],
        "unfavorable": [
          {
            "name": "Execution Deadline",
            "description": "Short contract deadline may cause schedule pressure",
            "content": "Project must be completed before Dec 31, 2025",
            "risk": "HIGH",
            "advice": "Consider extension clause if needed"
          }
        ]
      },
      
      "reminders": [
        {
          "id": "reminder-001",
          "type": "PAYMENT_DUE",
          "title": "Payment Phase 1",
          "description": "Reminder for 50% payment",
          "content": "Payment phase 1 must be made before Nov 30, 2025",
          "dueDate": "2025-11-30",
          "status": "PENDING",
          "priority": "HIGH"
        }
      ],
      
      "risk": {
        "level": "MEDIUM",
        "score": 65,
        "factors": [
          {
            "type": "TECHNICAL",
            "description": "Risk of new AI technology causing integration errors",
            "content": "System must use latest AI but not fully tested",
            "probability": "MEDIUM",
            "impact": "HIGH",
            "riskToParties": [{"id": "party-002", "name": "Company B"}],
            "beneficiaries": []
          }
        ],
        "mitigationProposals": [
          {
            "description": "Train team and test AI technology",
            "content": "Party B must provide weekly test reports",
            "cost": "LOW",
            "timeline": "2 weeks",
            "assignedTo": "Party B"
          }
        ],
        "advice": "Legal consultation to clearly allocate risks"
      },
      
      "compliance": {
        "status": "COMPLIANT",
        "regulations": ["Information Security Law", "Decree 13/2023/ND-CP"],
        "certifications": ["ISO 27001", "SOC 2"],
        "auditSchedule": "2024-06-01T00:00:00Z",
        "issues": [],
        "recommendations": ["Contract legal review"]
      }
    }
  }
}
```

### Repository Service Action

**UPDATE FileEntity (deep merge contract section):**

```json
{
  "id": "018c4e88-89a1-7000-8000-fedcba987654",
  
  "overview": {
    "documentType": "CONTRACT"
  },
  
  "contract": {
    "type": "SOFTWARE_DEVELOPMENT",
    "parties": [...],
    "payment": {...},
    "clauses": {...},
    "reminders": [...],
    "risk": {...},
    "compliance": {...}
  }
}
```

### Note: Priority Fields

**overview.priority** ≠ **contract.priority**

- `overview.priority`: Document-level (default "LOW", user can edit)
- `contract.priority`: Contract-specific (AI analysis result)

---

## 🎯 Ownership Matrix

### overview section

| Field | Event 1 | Event 2 | Event 3 | User Edit | Default Value |
|-------|---------|---------|---------|-----------|---------------|
| `title` | ✅ Automation | - | - | ✅ Yes | fileName |
| `status` | ✅ Repository | ✅ Repository | - | ❌ No | "UPLOADED" → "PROCESSED" |
| `documentType` | - | ✅ Automation (AI) | - | ✅ Yes | null → AI classify |
| `category` | - | ✅ Automation (AI) | - | ✅ Yes | null → AI classify |
| `language` | - | ✅ Automation (AI) | - | ✅ Yes | null → AI detect |
| `priority` | ✅ Repository | - | - | ✅ Yes | **"LOW"** |
| `ownerUserId` | ✅ Automation | - | - | ✅ Yes | From actor |
| `region` | ✅ Repository | - | - | ✅ Yes | "VN" |
| `tags` | - | - | - | ✅ Yes | [] |

### content section

| Field | Source | Set By |
|-------|--------|--------|
| `plaintext` | Event 2 | Automation (OCR/Extract) |
| `extractedText` | Event 2 | Automation (OCR/Extract) |
| `summary` | Event 2 | Automation (AI) |
| `keyTerms` | Event 2 | Automation (AI) |
| `sections` | Event 2 | Automation (AI) |
| `ocr` | Event 2 | Automation (OCR engine) |
| `classification` | Event 2 | Automation (AI) |
| `processing` | Event 2 | Automation (status tracking) |

### contract section

| Field | Source | Note |
|-------|--------|------|
| `type` | Event 3 | Contract-specific type (≠ overview.documentType) |
| `priority` | Event 3 | Contract priority (≠ overview.priority) |
| All other fields | Event 3 | AI contract analysis |

### metadata section

| Field | Event 1 | Event 2 | Note |
|-------|---------|---------|------|
| `file` | ✅ | - | S3 upload info |
| `fileSystem` | ✅ | - | File timestamps |
| `technical` | - | ✅ | Computed from content |
| `originalDocument` | - | ✅ | PDF metadata (if PDF) |

---

## ⚡ Event Ordering Strategy

### Rules

1. **Event 1 BẮT BUỘC ĐẦU TIÊN**
   - Repository cần skeleton trước
   - Event 2/3 sẽ fail nếu chưa có Event 1

2. **Event 2 & 3 KHÔNG CẦN THỨ TỰ**
   - Có thể đến theo bất kỳ thứ tự nào
   - Deep merge tự động handle

### Scenarios

**Scenario 1: Normal Order (1 → 2 → 3)**
```
Event 1: Tạo skeleton
Event 2: Merge content + overview
Event 3: Merge contract
Result: ✅ Full document
```

**Scenario 2: Reversed Order (1 → 3 → 2)**
```
Event 1: Tạo skeleton
Event 3: Merge contract (overview.documentType chưa có)
Event 2: Merge content + overview.documentType
Result: ✅ Full document (documentType set sau)
```

**Scenario 3: Event 3 Skip (Non-contract)**
```
Event 1: Tạo skeleton
Event 2: Merge content (isContract=false)
Event 3: KHÔNG PUBLISH
Result: ✅ Document without contract section
```

### Deep Merge Logic

```
Repository Service handles each event:

1. Check if eventId already processed (idempotency)
2. Get FileEntity by documentId
   - Event 1: Create new if not exists
   - Event 2/3: Throw error if not exists
3. Deep merge event.data into entity
4. Save entity
5. Mark eventId as processed
```

### Idempotency

**processed_events collection:**
```json
{
  "_id": "ObjectId(...)",
  "eventId": "018c4e88-89a1-7000-8000-0123456789ab",
  "eventType": "FILE_UPLOAD_COMPLETED",
  "documentId": "018c4e88-89a1-7000-8000-fedcba987654",
  "processedAt": "2025-10-23T10:00:00Z"
}
```

---

## 📊 Kafka Configuration

### Topic

```yaml
Topic Name: docgo-file-events
Partitions: 6
Replication Factor: 3
Retention: 7 days
Compression: lz4
Message Key: documentId (UUID v7)
Message Value: Event payload with eventType field
```

### Consumer Groups

```yaml
Automation Service:
  Group ID: automation-service-consumer
  Topics: [] # Không consume

Repository Service:
  Group ID: docgo-repo-events-v1
  Topics: [docgo-file-events]
  Auto Offset Reset: earliest
  Enable Auto Commit: false
  Consumer: DocgoFileEventsConsumer (single consumer)
```

### Message Format

```json
{
  "key": "018c4e88-89a1-7000-8000-fedcba987654",
  "value": {
    "eventVersion": "1.0",
    "eventType": "FILE_UPLOAD_COMPLETED",
    "eventId": "...",
    "timestamp": "...",
    "source": "automation-service",
    "correlationId": "...",
    "actor": "...",
    "data": {...}
  }
}
```

---

## ✅ Implementation Checklist

### Automation Service

- [x] Generate UUID v7 for documentId
- [x] Upload file to S3
- [x] Extract text (OCR/Direct)
- [x] AI classification (documentType, language, category)
- [x] Publish Event 1: FILE_UPLOAD_COMPLETED
- [x] Publish Event 2: FILE_CONTENT_EXTRACTED
- [x] Extract PDF metadata if mimeType = PDF
- [x] Conditional: AI contract analysis if isContract=true
- [x] Conditional: Publish Event 3 if isContract=true
- [x] Single topic: docgo-file-events
- [x] Field names: documentId, fileName, mimeType

### Repository Service

- [x] Create FileEntity skeleton on Event 1
- [x] Set default: status="UPLOADED", region="VN", priority="LOW"
- [x] Deep merge content on Event 2
- [x] Update status="PROCESSED" on Event 2
- [x] Deep merge contract on Event 3
- [x] Idempotency check (processed_events)
- [x] Error handling: Event 2/3 arrives before Event 1
- [x] Single consumer: DocgoFileEventsConsumer
- [x] Route by eventType field

### Monitoring

- [ ] Kafka lag monitoring
- [ ] Event processing time metrics
- [ ] Error rate tracking
- [ ] Document processing funnel (Event 1 → 2 → 3)

---

**Status:** 🟢 Implemented & Tested  
**Version:** 3.0  
**Last Updated:** 2025-10-24
