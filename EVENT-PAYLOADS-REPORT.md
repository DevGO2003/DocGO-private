# Event Payloads Report - hop-dong-day-du.txt

**Document ID**: `6a243874-fe17-4a26-9d6d-9460ca779bf2`  
**File**: `hop-dong-day-du.txt` (Vietnamese Labor Contract)  
**Upload Time**: 2025-10-23T08:42:47Z

---

## 📊 Event Summary

| Event | Topic | Event ID | Size | Status |
|-------|-------|----------|------|--------|
| Event 1 | `file.metadata.recorded` | `0b24fa5b-ef71-409b-a8bf-c1a53fa0e42c` | 2,294 bytes | ✅ Published |
| Event 2 | `file.plaintext.extracted` | `7db70720-0265-4214-a2fb-f5ec81f6dc2c` | 31,590 bytes | ✅ Published |
| Event 3 | `contract.summary.generated` | `7a116937-b765-4447-990e-82b178dcb707` | 2,576 bytes | ✅ Published |

---

## 📤 Event 1: FILE_METADATA_RECORDED

**Topic**: `file.metadata.recorded`  
**Size**: 2,294 bytes  
**Event ID**: `0b24fa5b-ef71-409b-a8bf-c1a53fa0e42c`

### Payload Structure

```json
{
  "eventVersion": "1.0",
  "eventType": "file.metadata.recorded",
  "eventId": "0b24fa5b-ef71-409b-a8bf-c1a53fa0e42c",
  "timestamp": "2025-10-23T08:42:47.249727+00:00",
  "source": "automation-service",
  "correlationId": "4733f958-ebfc-4459-90bd-5764fe69dfcd",
  "actor": "user:anonymous",
  "data": {
    "fileId": "6a243874-fe17-4a26-9d6d-9460ca779bf2",
    "fileName": "hop-dong-day-du.txt",
    "contentType": "text/plain",
    "size": 4961,
    "storage": {
      "provider": "local",
      "path": "/app/documents/6a243874-fe17-4a26-9d6d-9460ca779bf2_hop-dong-day-du.txt"
    },
    "metadata": {
      "uploadedAt": "2025-10-23T08:42:47.249727+00:00",
      "uploadedBy": "anonymous"
    }
  }
}
```

### Key Fields
- **fileId**: UUID của document
- **fileName**: Tên file gốc
- **contentType**: MIME type (text/plain)
- **size**: 4,961 bytes
- **storage.provider**: local (mock S3)
- **storage.path**: Local file path

---

## 📝 Event 2: FILE_PLAINTEXT_EXTRACTED

**Topic**: `file.plaintext.extracted`  
**Size**: 31,590 bytes (Largest event - contains full text)  
**Event ID**: `7db70720-0265-4214-a2fb-f5ec81f6dc2c`

### Payload Structure

```json
{
  "eventVersion": "1.0",
  "eventType": "file.plaintext.extracted",
  "eventId": "7db70720-0265-4214-a2fb-f5ec81f6dc2c",
  "timestamp": "2025-10-23T08:42:47.249727+00:00",
  "source": "automation-service",
  "correlationId": "4733f958-ebfc-4459-90bd-5764fe69dfcd",
  "actor": "system",
  "data": {
    "fileId": "6a243874-fe17-4a26-9d6d-9460ca779bf2",
    "plaintext": "HỢP ĐỒNG LAO ĐỘNG TOÀN THỜI GIAN\n\nSố hợp đồng: HD-2024-001\n...", // Full 3KB text
    "classification": {
      "documentType": "contract",
      "isContract": true,
      "confidence": 0.95,
      "reasons": [
        "Chứa các điều khoản về vị trí công việc, thời gian làm việc, tiền lương và phúc lợi.",
        "Có thông tin về người sử dụng lao động và người lao động.",
        "Có chữ ký của cả hai bên.",
        "Đề cập đến hợp đồng lao động toàn thời gian."
      ],
      "contractSubtype": "employment"
    },
    "extractedAt": "2025-10-23T08:42:47.249727+00:00"
  }
}
```

### Key Fields
- **plaintext**: Full extracted text (3KB Vietnamese contract)
- **classification.documentType**: "contract"
- **classification.isContract**: true
- **classification.confidence**: 0.95 (95% confidence)
- **classification.contractSubtype**: "employment"
- **classification.reasons**: AI classification reasons (4 points)

---

## 📜 Event 3: CONTRACT_SUMMARY_GENERATED

**Topic**: `contract.summary.generated`  
**Size**: 2,576 bytes  
**Event ID**: `7a116937-b765-4447-990e-82b178dcb707`

### Payload Structure

```json
{
  "eventVersion": "1.0",
  "eventType": "contract.summary.generated",
  "eventId": "7a116937-b765-4447-990e-82b178dcb707",
  "timestamp": "2025-10-23T08:42:47.249727+00:00",
  "source": "automation-service",
  "correlationId": "4733f958-ebfc-4459-90bd-5764fe69dfcd",
  "actor": "system",
  "data": {
    "fileId": "6a243874-fe17-4a26-9d6d-9460ca779bf2",
    "summaryResult": {
      "effectiveDate": "2024-02-01T00:00:00",
      "expiryDate": null,
      "totalValue": null,
      "currency": null,
      "summary": "Hợp đồng từ tệp: hop-dong-day-du.txt",
      "parties": [
        {
          "id": "party-001",
          "name": "CÔNG TY CỔ PHẦN CÔNG NGHỆ ABC TECH",
          "type": "CLIENT",
          "role": "BÊN A - NGƯỜI SỬ DỤNG LAO ĐỘNG",
          "contact": {
            "email": "ceo@abctech.com.vn",
            "phone": "0901234567",
            "address": "Tầng 15, Tòa nhà Landmark 72, Phường Phú Mỹ, Quận 7, TP.HCM"
          },
          "representative": {
            "name": "Nguyễn Văn B",
            "position": "Tổng Giám Đốc"
          },
          "taxCode": "0123456789"
        },
        {
          "id": "party-002",
          "name": "Trần Thị C",
          "type": "VENDOR",
          "role": "BÊN B - NGƯỜI LAO ĐỘNG",
          "contact": {
            "email": "tranthic@email.com",
            "phone": "0987654321",
            "address": "456 Đường DEF, Phường GHI, Quận 3, TP.HCM"
          }
        }
      ],
      "payment": {
        "totalValue": null,
        "currency": null,
        "schedule": null,
        "method": null
      },
      "reminders": [
        {
          "date": "2024-04-01T00:00:00",
          "title": "REVIEW",
          "description": ""
        },
        {
          "date": "2024-12-01T00:00:00",
          "title": "REVIEW",
          "description": ""
        },
        {
          "date": "2024-12-31T00:00:00",
          "title": "DEADLINE",
          "description": ""
        }
      ],
      "risk": {
        "level": "MEDIUM",
        "factors": [],
        "mitigations": []
      },
      "compliance": {
        "status": "REVIEW_REQUIRED",
        "issues": [],
        "recommendations": []
      }
    },
    "processingStatus": "COMPLETED",
    "correlationId": "4733f958-ebfc-4459-90bd-5764fe69dfcd"
  }
}
```

### Key Fields
- **effectiveDate**: 2024-02-01 (Contract start date)
- **parties**: 2 parties (ABC Tech as CLIENT, Trần Thị C as VENDOR)
- **parties[0].name**: "CÔNG TY CỔ PHẦN CÔNG NGHỆ ABC TECH"
- **parties[0].contact**: Full contact info (email, phone, address)
- **parties[0].taxCode**: "0123456789"
- **parties[1].name**: "Trần Thị C"
- **reminders**: 3 reminders (2 REVIEW, 1 DEADLINE)
- **risk.level**: "MEDIUM"
- **compliance.status**: "REVIEW_REQUIRED"
- **processingStatus**: "COMPLETED"

---

## 🔄 Event Flow Timeline

```
08:42:47.249 - Event 1: FILE_METADATA_RECORDED
              ├─ fileId: 6a243874-fe17-4a26-9d6d-9460ca779bf2
              ├─ fileName: hop-dong-day-du.txt
              ├─ size: 4,961 bytes
              └─ storage: local/app/documents/...

08:42:47.249 - Event 2: FILE_PLAINTEXT_EXTRACTED
              ├─ plaintext: Full 3KB Vietnamese text
              ├─ classification: contract (95% confidence)
              ├─ isContract: true
              └─ contractSubtype: employment

08:42:47.249 - Event 3: CONTRACT_SUMMARY_GENERATED
              ├─ parties: ABC Tech + Trần Thị C
              ├─ effectiveDate: 2024-02-01
              ├─ risk: MEDIUM
              └─ compliance: REVIEW_REQUIRED
```

---

## 📊 Statistics

- **Total Events**: 3
- **Total Payload Size**: 36,460 bytes (36 KB)
- **Processing Time**: < 1 second (all events same timestamp)
- **Correlation ID**: `4733f958-ebfc-4459-90bd-5764fe69dfcd`
- **Actor**: `user:anonymous` (Event 1), `system` (Events 2-3)

---

## ✅ Verification

- ✅ All 3 events published successfully
- ✅ Event ordering: metadata → plaintext → contract
- ✅ Contract detected with 95% confidence
- ✅ 2 parties extracted correctly
- ✅ Risk assessment: MEDIUM
- ✅ Compliance status: REVIEW_REQUIRED

---

**Generated**: 2025-10-23  
**Source**: Automation Service Kafka Logs
