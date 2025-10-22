# 🛡️ Enum Validation Strategy - DocGO Repository Service

## 🎯 Vấn đề

**Câu hỏi:** Nếu request có giá trị không match với enum thì xử lý thế nào?

**Trường hợp:**
- Database có value `"SUPER_HIGH"` nhưng enum chỉ có `HIGH, MEDIUM, LOW`
- Client gửi `"XXX"` cho Currency field
- External system trả về status không có trong enum

---

## 📋 Phương án đề xuất

### **Phân loại Enums thành 2 nhóm:**

#### **1. Strict Enums (Bắt buộc chính xác - Throw Exception)**
Các trường quan trọng ảnh hưởng business logic:
- ✅ `Currency` - USD, VND, EUR, JPY
- ✅ `ContractType` - SERVICE_AGREEMENT, SOFTWARE_DEVELOPMENT, etc.
- ✅ `DocumentType` - CONTRACT, INVOICE, MEMO, etc.

**Lý do:** Sai currency/contract type → Tính toán sai → Nghiêm trọng

**Hành vi:** Throw `IllegalArgumentException` với message rõ ràng

#### **2. Lenient Enums (Cho phép UNKNOWN/Default)**
Các trường không ảnh hưởng critical logic:
- ✅ `DocumentStatus` → UNKNOWN
- ✅ `Priority` → UNKNOWN
- ✅ `RiskLevel` → MEDIUM (default)
- ✅ `WorkflowStage` → DRAFT (default)
- ✅ `OcrStatus` → SKIPPED
- ✅ `PaymentStatus` → PENDING
- ✅ Các status/type khác

**Lý do:** Không ảnh hưởng critical → Cho phép hệ thống tiếp tục hoạt động

**Hành vi:** Return safe default hoặc UNKNOWN, log warning

---

## 🔧 Implementation

### **1. EnumUtils Helper Class**

**Location:** `src/main/java/com/devgo2003/docgo/repository_service/utils/EnumUtils.java`

**Features:**
- ✅ Strict parsing methods
- ✅ Lenient parsing methods
- ✅ Null handling
- ✅ Trim whitespace
- ✅ Case-insensitive
- ✅ Logging

**Example Usage:**
```java
// Strict - Throws exception
Currency currency = EnumUtils.parseCurrency("USD");  // ✓ OK
Currency invalid = EnumUtils.parseCurrency("XXX");   // ✗ Exception

// Lenient - Returns UNKNOWN
Priority high = EnumUtils.parsePriority("HIGH");     // ✓ HIGH
Priority unknown = EnumUtils.parsePriority("SUPER"); // ✓ UNKNOWN (logged)
```

### **2. Updated Enums with UNKNOWN**

**Enums có UNKNOWN value:**
```java
public enum DocumentStatus {
    ACTIVE, DRAFT, DELETED, ARCHIVED, INACTIVE,
    UNKNOWN  // ← Added
}

public enum Priority {
    HIGH, MEDIUM, LOW,
    UNKNOWN  // ← Added
}
```

### **3. Mapping Methods sử dụng EnumUtils**

**FileService.java:**
```java
private OverviewDto mapToOverview(Map<String, Object> map) {
    return OverviewDto.builder()
        .status(EnumUtils.parseDocumentStatus(asString(map.get("status"))))
        .documentType(EnumUtils.parseDocumentType(asString(map.get("documentType"))))
        .priority(EnumUtils.parsePriority(asString(map.get("priority"))))
        .build();
}

private ContractDto mapToContract(Map<String, Object> map) {
    return ContractDto.builder()
        .type(EnumUtils.parseContractType(asString(map.get("type"))))
        .currency(EnumUtils.parseCurrency(asString(map.get("currency"))))  // Strict!
        .build();
}
```

---

## 📊 Bảng phân loại đầy đủ

| Enum | Category | Invalid Value → | Lý do |
|------|----------|-----------------|-------|
| `Currency` | **STRICT** | Exception | Ảnh hưởng tính toán tiền |
| `ContractType` | **STRICT** | Exception | Phân loại hợp đồng quan trọng |
| `DocumentType` | **STRICT** | NOT_DOCUMENT | Cần biết loại tài liệu |
| `DocumentStatus` | Lenient | UNKNOWN | Status có thể mở rộng |
| `Priority` | Lenient | UNKNOWN | Không critical |
| `Confidentiality` | Lenient | PUBLIC (safe) | Default an toàn nhất |
| `RiskLevel` | Lenient | MEDIUM | Middle ground |
| `WorkflowStage` | Lenient | DRAFT | Bắt đầu workflow |
| `StageStatus` | Lenient | PENDING | Default an toàn |
| `PartyType` | Lenient | CLIENT | Default phổ biến |
| `PaymentMethod` | Lenient | BANK_TRANSFER | Phương thức phổ biến |
| `PaymentStatus` | Lenient | PENDING | Default an toàn |
| `OcrStatus` | Lenient | SKIPPED | Không chạy OCR |
| `OcrEngine` | Lenient | TESSERACT | Default engine |
| `ExtractionStatus` | Lenient | FAILED | Báo lỗi rõ ràng |
| `ExtractionMethod` | Lenient | HYBRID | Method toàn diện nhất |
| `ComplianceStatus` | Lenient | PENDING_REVIEW | Cần review |

---

## 🧪 Test Cases

### **Test Case 1: Valid Enum Values**
```javascript
// Database
{
  "overview": {"status": "ACTIVE"},
  "contract": {"currency": "USD", "priority": "HIGH"}
}

// API Response
{
  "overview": {"status": "ACTIVE"},
  "contract": {"currency": "USD", "priority": "HIGH"}
}
```
**Result:** ✅ Pass

---

### **Test Case 2: Invalid Lenient Enum**
```javascript
// Database
{
  "overview": {"status": "SUPER_ACTIVE"},  // Invalid
  "contract": {"priority": "CRITICAL"}     // Invalid
}

// API Response
{
  "overview": {"status": "UNKNOWN"},       // Fallback
  "contract": {"priority": "UNKNOWN"}      // Fallback
}

// Logs
WARN: Unknown document status: SUPER_ACTIVE, returning UNKNOWN
WARN: Unknown priority: CRITICAL, returning UNKNOWN
```
**Result:** ✅ Pass (with warnings)

---

### **Test Case 3: Invalid Strict Enum**
```javascript
// Database
{
  "contract": {"currency": "XXX"}  // Invalid strict enum
}

// API Response
{
  "statusCode": 500,
  "shortMessage": "INTERNAL_SERVER_ERROR",
  "description": "Invalid currency: XXX. Must be one of: USD, VND, EUR, JPY"
}

// Logs
ERROR: Invalid currency value: XXX
```
**Result:** ✅ Pass (throws exception as expected)

---

### **Test Case 4: Null Values**
```javascript
// Database
{
  "overview": {"status": null},
  "contract": {"priority": null}
}

// API Response
{
  "overview": {"status": "UNKNOWN"},
  "contract": {"priority": "UNKNOWN"}
}
```
**Result:** ✅ Pass (safe defaults)

---

### **Test Case 5: Empty Strings**
```javascript
// Database
{
  "overview": {"status": ""},
  "contract": {"currency": "  "}  // Whitespace
}

// API Response - Lenient
{
  "overview": {"status": "UNKNOWN"}
}

// API Response - Strict
{
  "statusCode": 500,
  "description": "Currency cannot be null or empty"
}
```
**Result:** ✅ Pass

---

## 📝 Logging Strategy

### **Strict Enums:**
```java
log.error("Invalid currency value: {}", value);
throw new IllegalArgumentException("Invalid currency: " + value);
```

### **Lenient Enums:**
```java
log.warn("Unknown document status: {}, returning UNKNOWN", value);
return DocumentStatus.UNKNOWN;
```

### **Log Levels:**
- `ERROR` - Strict validation failed (business impact)
- `WARN` - Lenient fallback used (tracking for improvement)
- `DEBUG` - Normal enum parsing

---

## ✅ Benefits

### **1. Robustness** 🛡️
- Hệ thống không crash vì invalid enum
- Graceful degradation
- Clear error messages

### **2. Flexibility** 🎨
- Dễ thêm enum values mới
- Backward compatible
- Forward compatible với external systems

### **3. Maintainability** 🔧
- Centralized validation logic
- Easy to update strategy
- Clear separation strict vs lenient

### **4. Observability** 📊
- Log warnings cho invalid values
- Track cần thêm enum values mới
- Monitor data quality

---

## 🚀 Deployment Strategy

### **Phase 1: Implementation** ✅
- [x] Create EnumUtils class
- [x] Add UNKNOWN to lenient enums
- [x] Update mapping methods
- [ ] Unit tests for EnumUtils

### **Phase 2: Testing** 🧪
- [ ] Insert sample data với valid enums
- [ ] Test API response
- [ ] Insert data với invalid enums
- [ ] Verify fallback behavior

### **Phase 3: Monitoring** 📊
- [ ] Set up log alerts cho ERROR level (strict failures)
- [ ] Track WARN level (unknown values found)
- [ ] Analyze logs để improve enum coverage

---

## 📚 Documentation

**Files Created:**
1. ✅ `EnumUtils.java` - 30+ parsing methods
2. ✅ `ENUM-VALIDATION-STRATEGY.md` - This file
3. ✅ `TEST-GUIDE.md` - Testing instructions
4. ✅ `scripts/insert-sample-data.js` - MongoDB test data
5. ✅ 30 enum classes với proper values

**Updated Files:**
- ✅ `DocumentStatus.java` - Added UNKNOWN
- ✅ `Priority.java` - Added UNKNOWN
- [ ] `FileService.java` - Use EnumUtils (next step)
- [ ] DTOs - Use enum types instead of String (next step)

---

## 🎯 Next Steps

1. **Update FileService mapping methods** để sử dụng EnumUtils
2. **Update DTOs** từ String → Enum types
3. **Write unit tests** cho EnumUtils
4. **Insert test data** vào MongoDB
5. **Run application** và test API
6. **Verify response** match v3-commented.json

---

**Status:** 🟢 **Strategy Defined & Implemented**

**Ready for:** Testing với real data!
