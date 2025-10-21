# PHASE 1: CRITICAL - Core Completion (7.5h) ⭐⭐⭐

**Goal**: Đạt 70% schema, đủ dùng cho production basic

**Timeline**: Sprint 1 (2-3 days)

---

## 📋 Task List

### Task 1.1: Bổ sung overview fields (2h)

**Priority**: HIGH  
**Effort**: 2h

#### Missing Fields:
- `contractType`: String - Sub-type nếu là contract
- `ownerUserId`: String - ID chủ sở hữu
- `region`: String - Khu vực (ISO 3166-1 alpha-2)
- `new`: Boolean - Flag cho document mới tạo (< 24h)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **handleFileContentExtracted()** - Add contractType mapping:
```java
// Line ~176-189, trong phần build overviewMap
overviewMap.put("contractType", asString(classification.get("contractType")));
```

2. **handleFileMetadataRecorded()** - Add ownerUserId:
```java
// Line ~62-69, khi tạo entity mới
entity.setOwnerUserId(asString(data.get("ownerUserId")));

// Trong overviewMap nếu có
Map<String, Object> overviewMap = new java.util.HashMap<>();
overviewMap.put("ownerUserId", asString(data.get("ownerUserId")));
```

3. **handleFileContentExtracted()** - Add region:
```java
// Line ~176-189
overviewMap.put("region", asString(classification.get("region")));
// Default "VN" nếu null
if (overviewMap.get("region") == null) {
    overviewMap.put("region", "VN");
}
```

4. **Calculate new flag** - Add to overview:
```java
// Check if document is new (< 24h)
LocalDateTime createdAt = entity.getCreatedAt();
boolean isNew = createdAt != null && 
    createdAt.isAfter(LocalDateTime.now().minusHours(24));
overviewMap.put("new", isNew);
```

**File**: `FileService.java`

5. **mapToOverview()** - Add fields to DTO:
```java
// Line ~170-181
return OverviewDto.builder()
    .title(asString(overviewMap.get("title")))
    .status(normalizeOverviewStatus(asString(overviewMap.get("status"))))
    .documentType(normalizeDocumentType(asString(overviewMap.get("documentType"))))
    .contractType(asString(overviewMap.get("contractType")))  // NEW
    .category(asString(overviewMap.get("category")))
    .tags(asList(overviewMap.get("tags")))
    .ownerUserId(asString(overviewMap.get("ownerUserId")))     // NEW
    .language(normalizeLanguage(asString(overviewMap.get("language"))))
    .region(normalizeRegion(asString(overviewMap.get("region"))))  // NEW
    .isNew(asBoolean(overviewMap.get("new")))                     // NEW
    .build();
```

**File**: `OverviewDto.java`

6. **Update DTO class**:
```java
@Data
@Builder
public class OverviewDto {
    private String title;
    private String status;
    private String documentType;
    private String contractType;    // NEW
    private String category;
    private List<String> tags;
    private String ownerUserId;     // NEW
    private String language;
    private String region;          // NEW
    private Boolean isNew;          // NEW
}
```

#### Testing:
```bash
# 1. Upload new file
powershell -File test-upload-file.ps1

# 2. Get file details
powershell -File test-get-file.ps1

# 3. Verify overview fields:
# - contractType should match classification
# - ownerUserId should be "system" or user ID
# - region should be "VN" or detected region
# - new should be true
```

---

### Task 1.2: Bổ sung contract core fields (3h)

**Priority**: HIGH  
**Effort**: 3h

#### Missing Fields:
- `effectiveDate`: LocalDateTime
- `expiryDate`: LocalDateTime
- `totalValue`: Double
- `currency`: String (ISO 4217)
- `project`: String
- `department`: String
- `priority`: String (Enum: HIGH, MEDIUM, LOW)
- `confidentiality`: String (Enum: CONFIDENTIAL, INTERNAL, PUBLIC, RESTRICTED)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **handleContractSummaryGenerated()** - Verify mapping (Line ~266-330):
```java
// Đã có mapping cơ bản, cần verify các field đang được map đúng
log.debug("Contract fields - effectiveDate={}, expiryDate={}, totalValue={}, currency={}", 
          summaryResult.get("effectiveDate"),
          summaryResult.get("expiryDate"),
          summaryResult.get("totalValue"),
          summaryResult.get("currency"));

contractData.put("effectiveDate", asString(summaryResult.get("effectiveDate")));
contractData.put("expiryDate", asString(summaryResult.get("expiryDate")));
contractData.put("totalValue", asDouble(summaryResult.get("totalValue")));
contractData.put("currency", asString(summaryResult.get("currency")));
contractData.put("project", asString(summaryResult.get("project")));
contractData.put("department", asString(summaryResult.get("department")));
contractData.put("priority", asString(summaryResult.get("priority")));
contractData.put("confidentiality", asString(summaryResult.get("confidentiality")));
```

**File**: `ContractDto.java`

2. **Verify DTO has all fields**:
```java
@Data
@Builder
public class ContractDto {
    private LocalDateTime effectiveDate;
    private LocalDateTime expiryDate;
    private Double totalValue;
    private String currency;
    private String summary;
    private String project;
    private String department;
    private String priority;
    private String confidentiality;
    // ... rest of fields
}
```

**File**: `FileService.java`

3. **mapToContract()** - Ensure normalization (Line ~197-214):
```java
return ContractDto.builder()
    .effectiveDate(asLocalDateTime(contractMap.get("effectiveDate")))
    .expiryDate(asLocalDateTime(contractMap.get("expiryDate")))
    .totalValue(asDouble(contractMap.get("totalValue")))
    .currency(toUpperEnum(asString(contractMap.get("currency"))))
    .summary(asString(contractMap.get("summary")))
    .project(asString(contractMap.get("project")))
    .department(asString(contractMap.get("department")))
    .priority(normalizePriority(asString(contractMap.get("priority"))))
    .confidentiality(normalizeConfidentiality(asString(contractMap.get("confidentiality"))))
    .workflow(mapToWorkflow(asMap(contractMap.get("workflow"))))
    .parties(mapToParties(asList(contractMap.get("parties"))))
    .payment(mapToPayment(asMap(contractMap.get("payment"))))
    .clauses(mapToClauses(asMap(contractMap.get("clauses"))))
    .reminders(mapToReminders(asList(contractMap.get("reminders"))))
    .risk(mapToRisk(asMap(contractMap.get("risk"))))
    .compliance(mapToCompliance(asMap(contractMap.get("compliance"))))
    .build();
```

#### Testing:
```bash
# 1. Check contract fields in response
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.contract'

# 2. Verify all 8 core fields present:
# - effectiveDate
# - expiryDate
# - totalValue
# - currency (uppercase)
# - project
# - department
# - priority (uppercase: HIGH/MEDIUM/LOW)
# - confidentiality (uppercase: CONFIDENTIAL/INTERNAL/PUBLIC/RESTRICTED)
```

---

### Task 1.3: Thêm file.version (0.5h)

**Priority**: MEDIUM  
**Effort**: 0.5h

#### Missing Field:
- `version`: Integer - Phiên bản file hiện tại

#### Implementation Plan:

**File**: `FileService.java`

1. **mapToFileInfo()** - Add version field:
```java
private FileDto mapToFileInfo(FileEntity file) {
    if (file == null) return null;
    
    Map<String, Object> fileMap = file.getFile();
    if (fileMap == null) fileMap = new java.util.HashMap<>();
    
    // Get version from audit or default to 1
    Integer version = 1;
    if (file.getAudit() != null && file.getAudit().get("version") != null) {
        version = asInteger(file.getAudit().get("version"));
    }
    
    return FileDto.builder()
        .id(file.getId())
        .name(file.getName())
        .type(file.getMimeType())
        .size(file.getSize())
        .hash(mapToHash(asMap(fileMap.get("hash"))))
        .permissions(mapToPermissions(asMap(fileMap.get("permissions"))))
        .security(mapToSecurity(asMap(fileMap.get("security"))))
        .version(version)  // NEW
        .build();
}
```

**File**: `FileDto.java`

2. **Update DTO**:
```java
@Data
@Builder
public class FileDto {
    private String id;
    private String name;
    private String type;
    private Long size;
    private HashDto hash;
    private PermissionsDto permissions;
    private SecurityDto security;
    private Integer version;  // NEW
}
```

#### Testing:
```bash
# Check file.version in response
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.file.version'
# Expected: 1
```

---

### Task 1.4: Hoàn thiện audit core fields (2h)

**Priority**: HIGH  
**Effort**: 2h

#### Missing Fields:
- `createdAt`: ISO DateTime
- `createdBy`: String (user ID)
- `lastModifiedAt`: ISO DateTime
- `updatedAt`: ISO DateTime (duplicate)
- `updatedBy`: String (duplicate)
- `deletedAt`: ISO DateTime (nullable)
- `deletedBy`: String (nullable)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **handleFileMetadataRecorded()** - Set audit fields when creating:
```java
// Line ~96-101, khi tạo entity mới
Map<String, Object> auditMap = new java.util.HashMap<>();
auditMap.put("createdAt", entity.getCreatedAt());
auditMap.put("createdBy", entity.getCreatedBy());
auditMap.put("lastModifiedAt", entity.getCreatedAt());  // NEW
auditMap.put("lastModifiedBy", entity.getCreatedBy());   // NEW (will be set later)
auditMap.put("updatedAt", entity.getCreatedAt());       // NEW (duplicate)
auditMap.put("updatedBy", entity.getCreatedBy());       // NEW (duplicate)
auditMap.put("deletedAt", null);                        // NEW
auditMap.put("deletedBy", null);                        // NEW
auditMap.put("version", 1);
auditMap.put("isDeleted", false);
entity.setAudit(auditMap);
```

2. **handleFileMetadataRecorded()** - Update audit when modifying:
```java
// Line ~121-128, khi update entity
Map<String, Object> auditMap = new java.util.HashMap<>();
auditMap.put("lastModifiedAt", LocalDateTime.now());
Map<String, Object> actor = asMap(payload.get("actor"));
if (actor != null) {
    auditMap.put("lastModifiedBy", asString(actor.get("userId")));
    auditMap.put("updatedBy", asString(actor.get("userId")));  // NEW (duplicate)
}
auditMap.put("updatedAt", LocalDateTime.now());  // NEW (duplicate)
auditMap.put("version", 1);
auditMap.put("isDeleted", false);
auditMap.put("deletedAt", null);    // NEW
auditMap.put("deletedBy", null);    // NEW
```

**File**: `FileService.java`

3. **mapToAudit()** - Map all audit fields:
```java
private AuditDto mapToAudit(FileEntity file) {
    if (file == null) return null;
    
    Map<String, Object> auditMap = file.getAudit();
    if (auditMap == null) auditMap = new java.util.HashMap<>();
    
    return AuditDto.builder()
        .createdAt(asLocalDateTime(auditMap.get("createdAt")))           // NEW
        .createdBy(asString(auditMap.get("createdBy")))                  // NEW
        .lastModifiedAt(asLocalDateTime(auditMap.get("lastModifiedAt"))) // NEW
        .lastModifiedBy(asString(auditMap.get("lastModifiedBy")))
        .updatedAt(asLocalDateTime(auditMap.get("updatedAt")))          // NEW (duplicate)
        .updatedBy(asString(auditMap.get("updatedBy")))                 // NEW (duplicate)
        .version(asInteger(auditMap.get("version")))
        .deletedAt(asLocalDateTime(auditMap.get("deletedAt")))          // NEW
        .deletedBy(asString(auditMap.get("deletedBy")))                 // NEW
        .isDeleted(asBoolean(auditMap.get("isDeleted")))
        .changeHistory(mapToChangeHistory(asList(auditMap.get("changeHistory"))))
        .accessLog(mapToAccessLog(asList(auditMap.get("accessLog"))))
        .build();
}
```

**File**: `AuditDto.java`

4. **Update DTO**:
```java
@Data
@Builder
public class AuditDto {
    private LocalDateTime createdAt;        // NEW
    private String createdBy;               // NEW
    private LocalDateTime lastModifiedAt;   // NEW
    private String lastModifiedBy;
    private LocalDateTime updatedAt;        // NEW (duplicate)
    private String updatedBy;               // NEW (duplicate)
    private Integer version;
    private LocalDateTime deletedAt;        // NEW
    private String deletedBy;               // NEW
    private Boolean isDeleted;
    private List<ChangeHistoryDto> changeHistory;
    private List<AccessLogDto> accessLog;
}
```

#### Testing:
```bash
# Check audit fields
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.audit'

# Verify all fields:
# - createdAt (ISO)
# - createdBy (user ID)
# - lastModifiedAt (ISO)
# - lastModifiedBy (user ID)
# - updatedAt (ISO, same as lastModifiedAt)
# - updatedBy (user ID, same as lastModifiedBy)
# - deletedAt (null)
# - deletedBy (null)
# - version (1)
# - isDeleted (false)
```

---

## ✅ Acceptance Criteria

### Overview Fields:
- [x] `contractType` xuất hiện trong response
- [x] `ownerUserId` có giá trị hợp lệ
- [x] `region` có giá trị uppercase (VN, US, etc.)
- [x] `new` là boolean true/false

### Contract Core:
- [x] `effectiveDate` format ISO date
- [x] `expiryDate` format ISO date
- [x] `totalValue` là number
- [x] `currency` là uppercase (USD, VND, EUR)
- [x] `project` có giá trị string
- [x] `department` có giá trị string
- [x] `priority` là uppercase (HIGH, MEDIUM, LOW)
- [x] `confidentiality` là uppercase (CONFIDENTIAL, INTERNAL, PUBLIC, RESTRICTED)

### File Version:
- [x] `file.version` xuất hiện và là integer

### Audit Core:
- [x] `createdAt` format ISO datetime
- [x] `createdBy` có user ID
- [x] `lastModifiedAt` format ISO datetime
- [x] `lastModifiedBy` có user ID
- [x] `updatedAt` format ISO datetime
- [x] `updatedBy` có user ID
- [x] `deletedAt` là null
- [x] `deletedBy` là null

---

## 🚀 Deployment Steps

1. **Build & test locally**:
```bash
cd backend/repository-management-service
./gradlew clean build
```

2. **Run tests**:
```bash
./gradlew test
```

3. **Restart service**:
```bash
docker-compose restart repository-management-service
```

4. **Verify with test script**:
```bash
powershell -File test-upload-file.ps1
powershell -File test-get-file.ps1
```

5. **Check logs**:
```bash
docker-compose logs repository-management-service --tail=100
```

---

## 📊 Progress Tracking

| Task | Status | Effort | Completion |
|------|--------|--------|------------|
| 1.1 overview fields | ⬜ TODO | 2h | 0% |
| 1.2 contract core | ⬜ TODO | 3h | 0% |
| 1.3 file.version | ⬜ TODO | 0.5h | 0% |
| 1.4 audit core | ⬜ TODO | 2h | 0% |
| **TOTAL** | **⬜ TODO** | **7.5h** | **0%** |

**Target**: 70% schema completion

---

## 🔗 Related Files

- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/consumer/FileEventConsumer.java`
- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/service/FileService.java`
- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/dto/*.java`
- `.cursor/documents/api-docs/document-management-sample.json`
