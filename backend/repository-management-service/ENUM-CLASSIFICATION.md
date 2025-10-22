# 📋 Phân loại Enums - Strict vs Lenient

## ⛔ STRICT ENUMS (3 enums) - Throw Exception

| Enum | Values | Reason | On Invalid |
|------|--------|--------|------------|
| **Currency** | USD, VND, EUR, JPY | Ảnh hưởng tính toán tiền | Exception |
| **ContractType** | SOFTWARE_DEVELOPMENT, SERVICE_AGREEMENT, PURCHASE_AGREEMENT, PARTNERSHIP_AGREEMENT, EMPLOYMENT_CONTRACT, SALES_CONTRACT, LEASE_AGREEMENT, LICENSE_AGREEMENT, NON_DISCLOSURE_AGREEMENT, CONSULTING_AGREEMENT, OTHERS | Quan trọng cho business logic | Exception |
| **DocumentType** | CONTRACT, INVOICE, MEMO, REPORT, AGREEMENT, **UNKNOWN** | Cần biết loại tài liệu | Exception nếu null, UNKNOWN nếu invalid |

---

## ✅ LENIENT ENUMS (27 enums) - Return UNKNOWN/Default

### **Overview Section (3 enums)**

| Enum | Values | Default on Invalid | Note |
|------|--------|-------------------|------|
| **DocumentStatus** | ACTIVE, DRAFT, DELETED, ARCHIVED, INACTIVE, **UNKNOWN** | UNKNOWN | ✅ Has UNKNOWN |
| **Priority** | HIGH, MEDIUM, LOW, **UNKNOWN** | UNKNOWN | ✅ Has UNKNOWN |
| **Confidentiality** | CONFIDENTIAL, INTERNAL, PUBLIC, RESTRICTED | PUBLIC | Safe default |

### **Contract Section (10 enums)**

| Enum | Values | Default on Invalid | Note |
|------|--------|-------------------|------|
| **WorkflowStage** | DRAFT, REVIEW, APPROVAL, SIGNED, EXECUTED, TERMINATED, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **StageStatus** | COMPLETED, IN_PROGRESS, PENDING, FAILED, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **PartyType** | CLIENT, VENDOR, PARTNER, GUARANTOR, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **PaymentMethod** | BANK_TRANSFER, CREDIT_CARD, WIRE, CHECK, CASH, DIGITAL_WALLET, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **PaymentStatus** | PENDING, PAID, OVERDUE, CANCELLED, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **RiskLevel** | LOW, MEDIUM, HIGH, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **RiskType** | TECHNICAL, SCHEDULE, FINANCIAL, LEGAL, OPERATIONAL, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **ReminderType** | PAYMENT_DUE, MILESTONE_REVIEW, EXPIRY_WARNING, CONTRACT_RENEWAL, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **ReminderStatus** | PENDING, SENT, RESOLVED, OVERDUE, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **ComplianceStatus** | COMPLIANT, NON_COMPLIANT, PENDING_REVIEW, IN_AUDIT, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |

### **Content Section (7 enums)**

| Enum | Values | Default on Invalid | Note |
|------|--------|-------------------|------|
| **OcrStatus** | COMPLETED, FAILED, PROCESSING, SKIPPED, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **OcrEngine** | GEMINI_VISION, TESSERACT, TESSERACT_FALLBACK, PADDLEOCR, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **ExtractionStatus** | SUCCESS, PARTIAL, FAILED, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **ExtractionMethod** | DIRECT, OCR, HYBRID, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **SummarizationStatus** | SUCCESS, FAILED, SKIPPED, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **ProcessingStatus** | COMPLETED, PROCESSING, FAILED, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **JsonAnalysisStatus** | PARSED, INVALID, PENDING, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |

### **Metadata Section (3 enums)**

| Enum | Values | Default on Invalid | Note |
|------|--------|-------------------|------|
| **Encoding** | UTF_8, UTF_16, ASCII, **UNKNOWN** | UTF_8 | ⚠️ Cần thêm UNKNOWN |
| **LineEnding** | LF, CRLF, **UNKNOWN** | LF | ⚠️ Cần thêm UNKNOWN |
| **Compression** | NONE, GZIP, DEFLATE, **UNKNOWN** | NONE | ⚠️ Cần thêm UNKNOWN |

### **Storage & Security (2 enums)**

| Enum | Values | Default on Invalid | Note |
|------|--------|-------------------|------|
| **Encryption** | AES_256, AES_128, NONE, **UNKNOWN** | NONE | ⚠️ Cần thêm UNKNOWN |
| **S3Region** | US_EAST_1, US_WEST_2, EU_WEST_1, AP_SOUTHEAST_1 | US_EAST_1 | Strict hoặc có getValue() |

### **Audit Section (3 enums)**

| Enum | Values | Default on Invalid | Note |
|------|--------|-------------------|------|
| **ChangeType** | CREATE, UPDATE, DELETE, ARCHIVE, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **AuditAction** | CREATE, UPDATE, DELETE, VIEW, SHARE, DOWNLOAD, UPLOAD, RESTORE, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |
| **AccessAction** | VIEW, EDIT, DOWNLOAD, SHARE, DELETE, **UNKNOWN** | UNKNOWN | ⚠️ Cần thêm UNKNOWN |

---

## 🔄 Cần Update

### **1. DocumentType - Đổi NOT_DOCUMENT → UNKNOWN**
```java
// Before
public enum DocumentType {
    CONTRACT, INVOICE, MEMO, REPORT, AGREEMENT,
    NOT_DOCUMENT  // ❌ Đổi thành UNKNOWN
}

// After
public enum DocumentType {
    CONTRACT, INVOICE, MEMO, REPORT, AGREEMENT,
    UNKNOWN  // ✅
}
```

### **2. Thêm UNKNOWN vào 24 enums còn lại**
Tất cả lenient enums cần có UNKNOWN value

---

## 📊 Tổng kết

- **STRICT:** 3 enums (Currency, ContractType, DocumentType)
- **LENIENT:** 27 enums (tất cả cần UNKNOWN)
- **Cần update:** 25 enums (thêm UNKNOWN)
- **Đặc biệt:** DocumentType đổi NOT_DOCUMENT → UNKNOWN

---

## ✅ Action Items

1. ✅ Update DocumentType: NOT_DOCUMENT → UNKNOWN
2. ✅ Add UNKNOWN to 24 lenient enums
3. ✅ Update EnumUtils defaults
4. ✅ Test with Docker Compose
