# 📋 Danh sách Enum Classification - Repository Service

## 🛡️ Strict Enums (3 enums - Bắt buộc chính xác - Throw Exception)

| Enum | Category | Has UNKNOWN | Lý do |
|------|----------|-------------|-------|
| `Currency` | **STRICT** | ❌ No | Ảnh hưởng tính toán tiền tệ |
| `ContractType` | **STRICT** | ❌ No | Phân loại hợp đồng quan trọng |
| `DocumentType` | **STRICT** | ❌ No (changed from NOT_DOCUMENT to UNKNOWN) | Cần biết loại tài liệu chính xác |

## ✅ Lenient Enums (27 enums - Cho phép UNKNOWN/Default)

### **Overview Section (3 enums)**
| Enum | Category | Has UNKNOWN | Default | Lý do |
|------|----------|-------------|---------|-------|
| `DocumentStatus` | Lenient | ✅ Yes | UNKNOWN | Status có thể mở rộng |
| `Priority` | Lenient | ✅ Yes | UNKNOWN | Không critical |
| `Confidentiality` | Lenient | ❌ No → **NEEDS UNKNOWN** | PUBLIC | Default an toàn nhất |

### **Contract Section (10 enums)**
| Enum | Category | Has UNKNOWN | Default | Lý do |
|------|----------|-------------|---------|-------|
| `WorkflowStage` | Lenient | ❌ No → **NEEDS UNKNOWN** | DRAFT | Bắt đầu workflow |
| `StageStatus` | Lenient | ❌ No → **NEEDS UNKNOWN** | PENDING | Default an toàn |
| `PartyType` | Lenient | ❌ No → **NEEDS UNKNOWN** | CLIENT | Default phổ biến |
| `PaymentMethod` | Lenient | ❌ No → **NEEDS UNKNOWN** | BANK_TRANSFER | Phương thức phổ biến |
| `PaymentStatus` | Lenient | ❌ No → **NEEDS UNKNOWN** | PENDING | Default an toàn |
| `RiskLevel` | Lenient | ❌ No → **NEEDS UNKNOWN** | MEDIUM | Middle ground |
| `RiskType` | Lenient | ❌ No → **NEEDS UNKNOWN** | TECHNICAL | Default category |
| `ReminderType` | Lenient | ❌ No → **NEEDS UNKNOWN** | PAYMENT_DUE | Default reminder |
| `ReminderStatus` | Lenient | ❌ No → **NEEDS UNKNOWN** | PENDING | Default an toàn |

### **Content Section (6 enums)**
| Enum | Category | Has UNKNOWN | Default | Lý do |
|------|----------|-------------|---------|-------|
| `OcrStatus` | Lenient | ❌ No → **NEEDS UNKNOWN** | SKIPPED | Không chạy OCR |
| `OcrEngine` | Lenient | ❌ No → **NEEDS UNKNOWN** | TESSERACT | Default engine |
| `ExtractionStatus` | Lenient | ❌ No → **NEEDS UNKNOWN** | FAILED | Báo lỗi rõ ràng |
| `ExtractionMethod` | Lenient | ❌ No → **NEEDS UNKNOWN** | HYBRID | Method toàn diện nhất |
| `SummarizationStatus` | Lenient | ❌ No → **NEEDS UNKNOWN** | SKIPPED | Không tóm tắt |
| `ProcessingStatus` | Lenient | ❌ No → **NEEDS UNKNOWN** | COMPLETED | Default thành công |

### **Compliance & Audit Section (4 enums)**
| Enum | Category | Has UNKNOWN | Default | Lý do |
|------|----------|-------------|---------|-------|
| `ComplianceStatus` | Lenient | ❌ No → **NEEDS UNKNOWN** | PENDING_REVIEW | Cần review |
| `ChangeType` | Lenient | ❌ No → **NEEDS UNKNOWN** | UPDATE | Default change |
| `AuditAction` | Lenient | ❌ No → **NEEDS UNKNOWN** | UPDATE | Default action |
| `AccessAction` | Lenient | ❌ No → **NEEDS UNKNOWN** | VIEW | Default access |

### **Technical Section (4 enums)**
| Enum | Category | Has UNKNOWN | Default | Lý do |
|------|----------|-------------|---------|-------|
| `Encoding` | Lenient | ❌ No → **NEEDS UNKNOWN** | UTF_8 | Default encoding |
| `LineEnding` | Lenient | ❌ No → **NEEDS UNKNOWN** | LF | Unix default |
| `Compression` | Lenient | ❌ No → **NEEDS UNKNOWN** | NONE | Không nén |
| `Encryption` | Lenient | ❌ No → **NEEDS UNKNOWN** | AES_256 | Security cao nhất |

### **Storage Section (1 enum)**
| Enum | Category | Has UNKNOWN | Default | Lý do |
|------|----------|-------------|---------|-------|
| `S3Region` | Lenient | ❌ No → **NEEDS UNKNOWN** | US_EAST_1 | AWS default |

---

## 🔧 Actions Required

### **1. Add UNKNOWN to Lenient Enums (17 enums need update)**
```java
// Example: Add UNKNOWN to these enums:
Confidentiality, WorkflowStage, StageStatus, PartyType, PaymentMethod,
PaymentStatus, RiskLevel, RiskType, ReminderType, ReminderStatus,
OcrStatus, OcrEngine, ExtractionStatus, ExtractionMethod, SummarizationStatus,
ProcessingStatus, ComplianceStatus, ChangeType, AuditAction, AccessAction,
Encoding, LineEnding, Compression, Encryption, S3Region
```

### **2. Update EnumUtils.java**
Add parsing methods for all lenient enums with UNKNOWN fallback.

### **3. Update FileService.java**
Use EnumUtils for all enum parsing.

---

## 📊 Summary

**Total Enums:** 30

**Strict Enums:** 3 (10%)
- Currency, ContractType, DocumentType

**Lenient Enums:** 27 (90%)
- 10 enums already have UNKNOWN
- **17 enums need UNKNOWN added**

**Status:** 🟡 **Needs 17 enums updated with UNKNOWN**
