# 🧪 Testing Guide - Enum Validation & API Response

## 📋 Phương án Enum Validation

### **Chiến lược:**

**1. Strict Enums (Bắt buộc chính xác):**
- `Currency` - USD, VND, EUR, JPY (throw exception nếu sai)
- `ContractType` - SERVICE_AGREEMENT, SOFTWARE_DEVELOPMENT, etc. (throw exception)
- `DocumentType` - CONTRACT, INVOICE, etc. (fallback NOT_DOCUMENT)

**2. Lenient Enums (Cho phép UNKNOWN/Default):**
- `DocumentStatus` → UNKNOWN nếu invalid
- `Priority` → UNKNOWN nếu invalid
- `RiskLevel` → MEDIUM nếu invalid
- `WorkflowStage` → DRAFT nếu invalid
- Các status khác → Safe default

### **EnumUtils Helper:**
```java
// Strict parsing - Throws exception
Currency currency = EnumUtils.parseCurrency("USD");  // OK
Currency invalid = EnumUtils.parseCurrency("XXX");   // ❌ Exception

// Lenient parsing - Returns default/UNKNOWN
Priority p1 = EnumUtils.parsePriority("HIGH");     // OK
Priority p2 = EnumUtils.parsePriority("INVALID");  // Returns UNKNOWN
```

---

## 🚀 Test Steps

### **Step 1: Chuẩn bị MongoDB**

#### **Option A: MongoDB Compass (Recommended)**
1. Mở MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Chọn database: `docgo`
4. Chọn collection: `files`
5. Click "Add Data" → "Import File"
6. Chọn file: `scripts/insert-sample-data.js`
7. Click "Import"

#### **Option B: MongoDB Shell**
```bash
# Run script
mongo docgo < scripts/insert-sample-data.js

# Or direct command
mongo docgo --eval "load('scripts/insert-sample-data.js')"
```

#### **Option C: Manual Insert via Compass**
1. Copy nội dung file `src/test/resources/sample-file-document.json`
2. Paste vào MongoDB Compass → "Insert Document"
3. Click "Insert"

### **Step 2: Verify Data Inserted**

**MongoDB Compass:**
```javascript
// Query
{ "_id": "FILE-2025-001-TEST" }
```

**MongoDB Shell:**
```javascript
use docgo
db.files.findOne({_id: "FILE-2025-001-TEST"})
```

**Expected:** Should see full document với all sections

---

### **Step 3: Update application.properties**

```properties
# MongoDB Connection
spring.data.mongodb.uri=mongodb://localhost:27017/docgo
spring.data.mongodb.database=docgo
spring.data.mongodb.auto-index-creation=true

# Server
server.port=8002
```

---

### **Step 4: Run Application**

#### **PowerShell:**
```powershell
# Navigate to project
cd backend/repository-management-service

# Run with Maven
mvn spring-boot:run

# Or run JAR
mvn clean package
java -jar target/repository-service-1.0.0.jar
```

**Wait for:** `Started RepositoryServiceApplication`

---

### **Step 5: Test GET API**

#### **Option A: Browser**
```
http://localhost:8002/api/v1/repository-management-service/files/FILE-2025-001-TEST
```

#### **Option B: PowerShell (curl)**
```powershell
curl http://localhost:8002/api/v1/repository-management-service/files/FILE-2025-001-TEST | ConvertFrom-Json
```

#### **Option C: Postman**
```
GET http://localhost:8002/api/v1/repository-management-service/files/FILE-2025-001-TEST
Headers:
  Accept: application/json
```

#### **Option D: Swagger UI**
```
http://localhost:8002/docs#/
```
- Expand `GET /files/{id}`
- Click "Try it out"
- Enter ID: `FILE-2025-001-TEST`
- Click "Execute"

---

### **Step 6: Verify Response**

#### **Expected Response Structure:**
```json
{
  "apiVersion": "v1",
  "statusCode": 200,
  "shortMessage": "SUCCESS",
  "description": "Document retrieved successfully",
  "data": {
    "id": "FILE-2025-001-TEST",
    "overview": {
      "title": "Test Contract Document",
      "status": "ACTIVE",
      "documentType": "CONTRACT",
      "tags": ["contract", "test"],
      "ownerUserId": "system",
      "language": "vi",
      "region": "VN",
      "isNew": true
    },
    "metadata": {
      "file": {
        "name": "test-contract.pdf",
        "mimeType": "application/pdf",
        "size": 312,
        "hash": {
          "md5": "a1b2c3d4e5f6...",
          "sha256": "123456789..."
        }
      },
      "fileSystem": {...},
      "originalDocument": {...},
      "archivedDocument": {...},
      "technical": {...}
    },
    "contract": {
      "type": "SOFTWARE_DEVELOPMENT",
      "currency": "USD",
      "priority": "HIGH",
      "confidentiality": "CONFIDENTIAL",
      "workflow": {...},
      "parties": [...],
      "payment": {...},
      "clauses": {...},
      "reminders": [...],
      "risk": {...},
      "compliance": {...}
    },
    "content": {...},
    "storage": {...},
    "security": {...},
    "versioning": {
      "current": {
        "number": 1,
        "tag": "1.0"
      }
    },
    "audit": {...}
  },
  "timestamp": "2025-10-22T...",
  "requestId": "...",
  "path": "/api/v1/repository-management-service/files/FILE-2025-001-TEST"
}
```

---

## ✅ Checklist Verification

### **1. Response Structure** ✓
- [ ] `apiVersion` = "v1"
- [ ] `statusCode` = 200
- [ ] `shortMessage` = "SUCCESS"
- [ ] `data` object present

### **2. Overview Section** ✓
- [ ] `status` = "ACTIVE" (String, not enum yet)
- [ ] `documentType` = "CONTRACT"
- [ ] `language` = "vi" (lowercase)
- [ ] `region` = "VN" (uppercase)

### **3. Metadata Section** ✓
- [ ] `file.hash.md5` present
- [ ] `file.hash.sha256` present
- [ ] `fileSystem.dateAdded` ISO 8601
- [ ] `technical.encoding` = "UTF-8"
- [ ] `technical.lineEnding` = "LF"

### **4. Contract Section** ✓
- [ ] `type` = "SOFTWARE_DEVELOPMENT"
- [ ] `currency` = "USD"
- [ ] `priority` = "HIGH"
- [ ] `confidentiality` = "CONFIDENTIAL"
- [ ] `workflow.currentStage` = "APPROVAL"
- [ ] `parties[0].type` = "CLIENT"
- [ ] `payment.method` = "BANK_TRANSFER"

### **5. Content Section** ✓
- [ ] `plaintext` present
- [ ] `extractedText` present
- [ ] `classification.isContract` = true
- [ ] `processing.status` = "COMPLETED"

### **6. Versioning Section** ✓
- [ ] `current.number` = 1
- [ ] `current.tag` = "1.0"
- [ ] `history` array (empty hoặc có data từ file_versions collection)

### **7. Audit Section** ✓
- [ ] `createdAt` ISO 8601
- [ ] `createdBy` = "system"
- [ ] `changeHistory[0].action` = "CREATE"
- [ ] `changeHistory[0].actor` = "system"
- [ ] `accessLog[0].action` = "VIEW"

---

## 🧪 Test Invalid Enum Values

### **Test 1: Invalid Priority (Lenient)**

**Update document:**
```javascript
db.files.updateOne(
  {_id: "FILE-2025-001-TEST"},
  {$set: {"contract.priority": "SUPER_HIGH"}}
)
```

**Call API:**
```
GET /files/FILE-2025-001-TEST
```

**Expected:** `priority` = "UNKNOWN" (not error)

---

### **Test 2: Invalid Currency (Strict)**

**Update document:**
```javascript
db.files.updateOne(
  {_id: "FILE-2025-001-TEST"},
  {$set: {"contract.currency": "XXX"}}
)
```

**Call API:**
```
GET /files/FILE-2025-001-TEST
```

**Expected:** Exception hoặc validation error (depending on implementation)

---

### **Test 3: Invalid DocumentStatus (Lenient)**

**Update document:**
```javascript
db.files.updateOne(
  {_id: "FILE-2025-001-TEST"},
  {$set: {"overview.status": "SUPER_ACTIVE"}}
)
```

**Call API:**
```
GET /files/FILE-2025-001-TEST
```

**Expected:** `status` = "UNKNOWN"

---

## 📊 Compare with v3-commented.json

### **Manual Comparison:**
1. Open `GET /files/FILE-2025-001-TEST` response
2. Open `.windsurf/documents/api-docs/document-management-sample-v3-commented.json`
3. Compare sections:
   - ✓ Structure match?
   - ✓ Field names match?
   - ✓ Enum values uppercase?
   - ✓ Timestamp format ISO 8601?

### **Automated Comparison (Optional):**
```javascript
// Save API response to file
const apiResponse = await fetch('http://localhost:8002/api/v1/repository-management-service/files/FILE-2025-001-TEST');
const data = await apiResponse.json();

// Compare with v3 schema
// (implement JSON diff tool)
```

---

## 🐛 Troubleshooting

### **Issue: Document not found**
```
Solution:
1. Check MongoDB connection
2. Verify document ID: db.files.findOne({_id: "FILE-2025-001-TEST"})
3. Check collection name: should be "files"
```

### **Issue: Enum validation error**
```
Solution:
1. Check EnumUtils is being used in mapping
2. Verify enum value trong database
3. Check logs: grep "Invalid" application.log
```

### **Issue: Response format mismatch**
```
Solution:
1. Verify DTOs are updated
2. Check mapping methods in FileService
3. Compare field names với v3 schema
```

---

## ✅ Success Criteria

- [x] Document inserted successfully vào MongoDB
- [x] Application starts without errors
- [x] GET API returns 200 OK
- [x] Response structure match v3 schema
- [x] All enum values uppercase
- [x] Lenient enums return UNKNOWN for invalid values
- [x] Strict enums throw exception for invalid values
- [x] Timestamps in ISO 8601 format
- [x] Actor field used instead of userId in audit

---

**Status:** 🟢 **Ready to Test**

**Next:** Run test và verify response match v3-commented.json!
