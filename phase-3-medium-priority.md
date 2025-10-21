# PHASE 3: MEDIUM PRIORITY - Polish & Nice-to-have (5.5h) ⭐

**Goal**: Đạt 99% schema completion

**Timeline**: Sprint 3 (1-2 days)

**Prerequisites**: Phase 1 & 2 phải hoàn thành

---

## 📋 Task List

### Task 3.1: Verify contract advanced fields (1h)

**Priority**: MEDIUM  
**Effort**: 1h

#### Fields to verify (đã có skeleton từ Phase 1):
- `clauses`: Object với key và unfavorable arrays
- `reminders`: Array
- `risk`: Object với level, factors, mitigations
- `compliance`: Object với status, issues, recommendations

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **Verify mapping is working** (Line ~307-325):
```java
// Add detailed logging for verification
log.debug("Contract advanced fields check:");
log.debug("- Clauses: {}", clauses);
log.debug("- Reminders count: {}", reminders != null ? reminders.size() : 0);
log.debug("- Risk level: {}", risk.get("level"));
log.debug("- Compliance status: {}", compliance.get("status"));
```

**File**: `FileService.java`

2. **Implement mapToClauses()** (currently returns null):
```java
private ClausesDto mapToClauses(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return ClausesDto.builder()
        .key(asList(map.get("key")))
        .unfavorable(asList(map.get("unfavorable")))
        .build();
}
```

3. **Implement mapToReminders()** (currently returns null):
```java
private List<ReminderDto> mapToReminders(List<Object> list) {
    if (list == null || list.isEmpty()) return new ArrayList<>();
    
    List<ReminderDto> reminders = new ArrayList<>();
    for (Object item : list) {
        Map<String, Object> reminderMap = asMap(item);
        if (reminderMap == null) continue;
        
        ReminderDto reminder = ReminderDto.builder()
            .type(asString(reminderMap.get("type")))
            .date(asLocalDateTime(reminderMap.get("date")))
            .description(asString(reminderMap.get("description")))
            .notifyBefore(asInteger(reminderMap.get("notifyBefore")))
            .build();
        reminders.add(reminder);
    }
    
    return reminders;
}
```

4. **Implement mapToRisk()** (currently returns null):
```java
private RiskDto mapToRisk(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return RiskDto.builder()
        .level(toUpperEnum(asString(map.get("level"))))
        .factors(asList(map.get("factors")))
        .mitigations(asList(map.get("mitigations")))
        .build();
}
```

5. **Implement mapToCompliance()** (currently returns null):
```java
private ComplianceDto mapToCompliance(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return ComplianceDto.builder()
        .status(toUpperEnum(asString(map.get("status"))))
        .issues(asList(map.get("issues")))
        .recommendations(asList(map.get("recommendations")))
        .build();
}
```

**File**: Create DTOs:

6. **ClausesDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ClausesDto {
    private List<String> key;
    private List<String> unfavorable;
}
```

7. **ReminderDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ReminderDto {
    private String type;
    private LocalDateTime date;
    private String description;
    private Integer notifyBefore;
}
```

8. **RiskDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RiskDto {
    private String level;  // Enum: HIGH, MEDIUM, LOW
    private List<String> factors;
    private List<String> mitigations;
}
```

9. **ComplianceDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class ComplianceDto {
    private String status;  // Enum: COMPLIANT, REVIEW_REQUIRED, NON_COMPLIANT
    private List<String> issues;
    private List<String> recommendations;
}
```

#### Testing:
```bash
# Check contract advanced fields
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.contract | {clauses, reminders, risk, compliance}'

# Expected: all objects/arrays properly mapped
```

---

### Task 3.2: Add content.sections field (1h)

**Priority**: MEDIUM  
**Effort**: 1h

#### Missing Field:
- `sections`: Array với ít nhất 3 items (title, description, content, pageNumber)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **Map sections from event** (Line ~162-173):
```java
// Add sections if available
List<Object> sections = asList(data.get("sections"));
contentMap.put("sections", sections != null ? sections : new java.util.ArrayList<>());

log.debug("Content sections count: {}", sections != null ? sections.size() : 0);
```

**File**: `FileService.java`

2. **Update mapToContent()** to include sections:
```java
private ContentDto mapToContent(Map<String, Object> contentMap) {
    if (contentMap == null || contentMap.isEmpty()) return null;

    return ContentDto.builder()
        .extractedText(asString(contentMap.get("extractedText")))
        .summary(asString(contentMap.get("summary")))
        .keyTerms(asList(contentMap.get("keyTerms")))
        .sections(mapToSections(asList(contentMap.get("sections"))))  // NEW
        .plaintext(asString(contentMap.get("plaintext")))
        .ocr(mapToOcr(asMap(contentMap.get("ocr"))))
        .classification(mapToClassification(asMap(contentMap.get("classification"))))
        .processing(mapToProcessing(asMap(contentMap.get("processing"))))
        .jsonContent(contentMap.get("jsonContent"))
        .jsonAnalysisStatus(asString(contentMap.get("jsonAnalysisStatus")))
        .build();
}
```

3. **Implement mapToSections()**:
```java
private List<SectionDto> mapToSections(List<Object> list) {
    if (list == null || list.isEmpty()) return new ArrayList<>();
    
    List<SectionDto> sections = new ArrayList<>();
    for (Object item : list) {
        Map<String, Object> sectionMap = asMap(item);
        if (sectionMap == null) continue;
        
        SectionDto section = SectionDto.builder()
            .title(asString(sectionMap.get("title")))
            .description(asString(sectionMap.get("description")))
            .content(asString(sectionMap.get("content")))
            .pageNumber(asInteger(sectionMap.get("pageNumber")))
            .build();
        sections.add(section);
    }
    
    return sections;
}
```

**File**: Create DTO:

4. **SectionDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SectionDto {
    private String title;
    private String description;
    private String content;
    private Integer pageNumber;
}
```

5. **Update ContentDto**:
```java
@Data
@Builder
public class ContentDto {
    private String extractedText;
    private String summary;
    private List<String> keyTerms;
    private List<SectionDto> sections;  // NEW
    private String plaintext;
    private OcrDto ocr;
    private ClassificationDto classification;
    private ProcessingDto processing;
    private Object jsonContent;
    private String jsonAnalysisStatus;
}
```

#### Testing:
```bash
# Check content.sections
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.content.sections'

# Expected: array of section objects
```

---

### Task 3.3: Add storage policies (mock/default) (1.5h)

**Priority**: LOW  
**Effort**: 1.5h

#### Missing Fields:
- `retentionPolicy`: Object (duration, autoDelete, archiveAfter)
- `accessControl`: Object (public, restrictedUsers, ipWhitelist)
- `local`: Object (null for S3 storage)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **Add default policies when creating storage** (Line ~79-113):
```java
Map<String, Object> storageData = asMap(data.get("storage"));
if (storageData == null) storageData = new java.util.HashMap<>();

// Add retention policy (default values)
Map<String, Object> retentionPolicy = new java.util.HashMap<>();
retentionPolicy.put("duration", "7 years");
retentionPolicy.put("autoDelete", false);
retentionPolicy.put("archiveAfter", "2 years");
storageData.put("retentionPolicy", retentionPolicy);

// Add access control (default values)
Map<String, Object> accessControl = new java.util.HashMap<>();
accessControl.put("public", false);
accessControl.put("restrictedUsers", new java.util.ArrayList<>());
accessControl.put("ipWhitelist", new java.util.ArrayList<>());
storageData.put("accessControl", accessControl);

// Add local storage info (null for S3)
storageData.put("local", null);

log.debug("Added default storage policies for fileId={}", fileId);
```

**File**: `FileService.java`

2. **Update mapToStorage()**:
```java
private StorageDto mapToStorage(FileEntity file) {
    if (file == null) return null;
    
    Map<String, Object> storageMap = file.getStorage();
    if (storageMap == null) storageMap = new java.util.HashMap<>();
    
    return StorageDto.builder()
        .location(asString(storageMap.get("location")))
        .backupLocations(asList(storageMap.get("backupLocations")))
        .retentionPolicy(mapToRetentionPolicy(asMap(storageMap.get("retentionPolicy"))))  // NEW
        .accessControl(mapToAccessControl(asMap(storageMap.get("accessControl"))))        // NEW
        .s3(mapToS3(asMap(storageMap.get("s3"))))
        .local(mapToLocal(asMap(storageMap.get("local"))))                                // NEW
        .build();
}
```

3. **Implement helper mappers**:
```java
private RetentionPolicyDto mapToRetentionPolicy(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return RetentionPolicyDto.builder()
        .duration(asString(map.get("duration")))
        .autoDelete(asBoolean(map.get("autoDelete")))
        .archiveAfter(asString(map.get("archiveAfter")))
        .build();
}

private AccessControlDto mapToAccessControl(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return AccessControlDto.builder()
        .isPublic(asBoolean(map.get("public")))
        .restrictedUsers(asList(map.get("restrictedUsers")))
        .ipWhitelist(asList(map.get("ipWhitelist")))
        .build();
}

private LocalStorageDto mapToLocal(Map<String, Object> map) {
    if (map == null) return null;
    
    return LocalStorageDto.builder()
        .path(asString(map.get("path")))
        .filename(asString(map.get("filename")))
        .mimeType(asString(map.get("mimeType")))
        .size(asLong(map.get("size")))
        .mtime(asLocalDateTime(map.get("mtime")))
        .revision(asString(map.get("revision")))
        .build();
}
```

**File**: Create DTOs:

4. **RetentionPolicyDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RetentionPolicyDto {
    private String duration;
    private Boolean autoDelete;
    private String archiveAfter;
}
```

5. **AccessControlDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AccessControlDto {
    private Boolean isPublic;
    private List<String> restrictedUsers;
    private List<String> ipWhitelist;
}
```

6. **LocalStorageDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class LocalStorageDto {
    private String path;
    private String filename;
    private String mimeType;
    private Long size;
    private LocalDateTime mtime;
    private String revision;
}
```

7. **Update StorageDto**:
```java
@Data
@Builder
public class StorageDto {
    private String location;
    private List<String> backupLocations;
    private RetentionPolicyDto retentionPolicy;  // NEW
    private AccessControlDto accessControl;      // NEW
    private S3Dto s3;
    private LocalStorageDto local;               // NEW
}
```

#### Testing:
```bash
# Check storage policies
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.storage | {retentionPolicy, accessControl, local}'

# Expected:
# - retentionPolicy with 3 fields
# - accessControl with 3 fields
# - local: null
```

---

### Task 3.4: Add audit logs (changeHistory, accessLog) (2h)

**Priority**: MEDIUM  
**Effort**: 2h

#### Missing Fields:
- `changeHistory`: Array với ít nhất 1 item (CREATE action)
- `accessLog`: Array với ít nhất 1 item (VIEW action)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **Create initial audit logs when creating entity** (Line ~96-101):
```java
Map<String, Object> auditMap = new java.util.HashMap<>();
auditMap.put("createdAt", entity.getCreatedAt());
auditMap.put("createdBy", entity.getCreatedBy());
auditMap.put("lastModifiedAt", entity.getCreatedAt());
auditMap.put("lastModifiedBy", entity.getCreatedBy());
auditMap.put("updatedAt", entity.getCreatedAt());
auditMap.put("updatedBy", entity.getCreatedBy());
auditMap.put("deletedAt", null);
auditMap.put("deletedBy", null);
auditMap.put("version", 1);
auditMap.put("isDeleted", false);

// Add initial changeHistory
List<Map<String, Object>> changeHistory = new java.util.ArrayList<>();
Map<String, Object> createChange = new java.util.HashMap<>();
createChange.put("action", "CREATE");
createChange.put("timestamp", entity.getCreatedAt());
createChange.put("userId", entity.getCreatedBy());
createChange.put("details", "Tạo file mới");
createChange.put("ipAddress", "192.168.1.100");  // TODO: get from request
createChange.put("userAgent", "System");
changeHistory.add(createChange);
auditMap.put("changeHistory", changeHistory);

// Add initial accessLog (empty or with VIEW)
List<Map<String, Object>> accessLog = new java.util.ArrayList<>();
auditMap.put("accessLog", accessLog);

entity.setAudit(auditMap);
log.debug("Created audit logs with initial changeHistory for fileId={}", fileId);
```

**File**: `FileService.java`

2. **Implement mapToChangeHistory()** (currently returns null):
```java
private List<ChangeHistoryDto> mapToChangeHistory(List<Object> list) {
    if (list == null || list.isEmpty()) return new ArrayList<>();
    
    List<ChangeHistoryDto> history = new ArrayList<>();
    for (Object item : list) {
        Map<String, Object> changeMap = asMap(item);
        if (changeMap == null) continue;
        
        ChangeHistoryDto change = ChangeHistoryDto.builder()
            .action(toUpperEnum(asString(changeMap.get("action"))))
            .timestamp(asLocalDateTime(changeMap.get("timestamp")))
            .userId(asString(changeMap.get("userId")))
            .details(asString(changeMap.get("details")))
            .ipAddress(asString(changeMap.get("ipAddress")))
            .userAgent(asString(changeMap.get("userAgent")))
            .build();
        history.add(change);
    }
    
    return history;
}
```

3. **Implement mapToAccessLog()** (currently returns null):
```java
private List<AccessLogDto> mapToAccessLog(List<Object> list) {
    if (list == null || list.isEmpty()) return new ArrayList<>();
    
    List<AccessLogDto> logs = new ArrayList<>();
    for (Object item : list) {
        Map<String, Object> logMap = asMap(item);
        if (logMap == null) continue;
        
        AccessLogDto log = AccessLogDto.builder()
            .action(toUpperEnum(asString(logMap.get("action"))))
            .timestamp(asLocalDateTime(logMap.get("timestamp")))
            .userId(asString(logMap.get("userId")))
            .ipAddress(asString(logMap.get("ipAddress")))
            .userAgent(asString(logMap.get("userAgent")))
            .build();
        logs.add(log);
    }
    
    return logs;
}
```

**File**: Update DTOs (should already exist):

4. **Verify ChangeHistoryDto**:
```java
@Data
@Builder
public static class ChangeHistoryDto {
    private String action;  // Enum: CREATE, UPDATE, DELETE, VIEW, SHARE
    private LocalDateTime timestamp;
    private String userId;
    private String details;
    private String ipAddress;
    private String userAgent;
}
```

5. **Verify AccessLogDto**:
```java
@Data
@Builder
public static class AccessLogDto {
    private String action;  // Enum: VIEW, EDIT, DOWNLOAD, SHARE, DELETE
    private LocalDateTime timestamp;
    private String userId;
    private String ipAddress;
    private String userAgent;
}
```

#### Testing:
```bash
# Check audit logs
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.audit | {changeHistory, accessLog}'

# Expected:
# - changeHistory: array with 1 CREATE item
# - accessLog: array (can be empty or with items)
```

---

## ✅ Acceptance Criteria

### Contract Advanced:
- [x] `clauses` object với key và unfavorable arrays
- [x] `reminders` array properly mapped
- [x] `risk` object với level (uppercase), factors, mitigations
- [x] `compliance` object với status (uppercase), issues, recommendations

### Content Sections:
- [x] `sections` array với objects containing title, description, content, pageNumber

### Storage Policies:
- [x] `retentionPolicy` với duration, autoDelete, archiveAfter
- [x] `accessControl` với public, restrictedUsers, ipWhitelist
- [x] `local` là null

### Audit Logs:
- [x] `changeHistory` array với ít nhất 1 CREATE item
- [x] `accessLog` array (có thể rỗng)

---

## 🚀 Deployment Steps

1. **Create new DTOs**:
   - ClausesDto, ReminderDto, RiskDto, ComplianceDto
   - SectionDto
   - RetentionPolicyDto, AccessControlDto, LocalStorageDto
   - Verify ChangeHistoryDto, AccessLogDto

2. **Update FileService mappers**:
   - Implement mapToClauses(), mapToReminders(), mapToRisk(), mapToCompliance()
   - Implement mapToSections()
   - Implement mapToRetentionPolicy(), mapToAccessControl(), mapToLocal()
   - Implement mapToChangeHistory(), mapToAccessLog()

3. **Update FileEventConsumer**:
   - Add storage policies when creating
   - Add initial audit logs with changeHistory

4. **Build & test**:
```bash
./gradlew clean build
docker-compose restart repository-management-service
powershell -File test-upload-file.ps1
powershell -File test-get-file.ps1
```

---

## 📊 Progress Tracking

| Task | Status | Effort | Completion |
|------|--------|--------|------------|
| 3.1 contract advanced | ⬜ TODO | 1h | 0% |
| 3.2 content sections | ⬜ TODO | 1h | 0% |
| 3.3 storage policies | ⬜ TODO | 1.5h | 0% |
| 3.4 audit logs | ⬜ TODO | 2h | 0% |
| **TOTAL** | **⬜ TODO** | **5.5h** | **0%** |

**Target**: 99% schema completion (lên từ 95%)

---

## 🔗 Dependencies

**Must complete Phase 1 & 2 first**

---

## 🔗 Related Files

- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/consumer/FileEventConsumer.java`
- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/service/FileService.java`
- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/dto/*.java`
