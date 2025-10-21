# PHASE 2: HIGH PRIORITY - Business Logic (7h) ⭐⭐

**Goal**: Đạt 95% schema, hỗ trợ đầy đủ contract workflow

**Timeline**: Sprint 2 (2-3 days)

**Prerequisites**: Phase 1 phải hoàn thành trước

---

## 📋 Task List

### Task 2.1: Map contract extended fields (2h)

**Priority**: HIGH  
**Effort**: 2h

#### Missing Fields:
- `workflow`: Object với currentStage, stages array
- `parties`: Array các bên tham gia (đã có skeleton)
- `payment`: Object thông tin thanh toán (đã có skeleton)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **Verify workflow mapping** (Line ~288-291):
```java
// Workflow - default empty if not present
Map<String, Object> workflow = asMap(summaryResult.get("workflow"));
if (workflow == null) workflow = new java.util.HashMap<>();
log.debug("Contract workflow - currentStage={}, has stages={}", 
          workflow.get("currentStage"),
          workflow.get("stages") != null);
contractData.put("workflow", workflow);
```

2. **Enhance parties mapping** (Line ~293-300):
```java
// Parties - extract and map properly
List<Object> parties = asList(summaryResult.get("parties"));
if (parties != null && !parties.isEmpty()) {
    log.debug("Mapping {} parties for contract", parties.size());
    // Verify each party has required fields
    for (Object party : parties) {
        Map<String, Object> p = asMap(party);
        if (p != null) {
            log.debug("Party: id={}, name={}, type={}, role={}", 
                      p.get("id"), p.get("name"), p.get("type"), p.get("role"));
        }
    }
    contractData.put("parties", parties);
} else {
    contractData.put("parties", new java.util.ArrayList<>());
}
```

3. **Enhance payment mapping** (Line ~302-305):
```java
// Payment - extract payment info
Map<String, Object> payment = asMap(summaryResult.get("payment"));
if (payment == null) payment = new java.util.HashMap<>();
log.debug("Contract payment - totalValue={}, currency={}, method={}", 
          payment.get("totalValue"), payment.get("currency"), payment.get("method"));
contractData.put("payment", payment);
```

**File**: `FileService.java`

4. **Implement mapToParties()** (currently returns null):
```java
private List<PartyDto> mapToParties(List<Object> list) {
    if (list == null || list.isEmpty()) return new ArrayList<>();
    
    List<PartyDto> parties = new ArrayList<>();
    for (Object item : list) {
        Map<String, Object> partyMap = asMap(item);
        if (partyMap == null) continue;
        
        PartyDto party = PartyDto.builder()
            .id(asString(partyMap.get("id")))
            .name(asString(partyMap.get("name")))
            .type(toUpperEnum(asString(partyMap.get("type"))))
            .role(asString(partyMap.get("role")))
            .contact(mapToContact(asMap(partyMap.get("contact"))))
            .representative(mapToRepresentative(asMap(partyMap.get("representative"))))
            .taxCode(asString(partyMap.get("taxCode")))
            .build();
        parties.add(party);
    }
    
    log.debug("Mapped {} parties", parties.size());
    return parties;
}

private ContactDto mapToContact(Map<String, Object> map) {
    if (map == null) return null;
    return ContactDto.builder()
        .email(asString(map.get("email")))
        .phone(asString(map.get("phone")))
        .address(asString(map.get("address")))
        .build();
}

private RepresentativeDto mapToRepresentative(Map<String, Object> map) {
    if (map == null) return null;
    return RepresentativeDto.builder()
        .name(asString(map.get("name")))
        .position(asString(map.get("position")))
        .email(asString(map.get("email")))
        .build();
}
```

5. **Implement mapToPayment()** (currently returns null):
```java
private PaymentDto mapToPayment(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return PaymentDto.builder()
        .totalValue(asDouble(map.get("totalValue")))
        .currency(toUpperEnum(asString(map.get("currency"))))
        .schedule(asList(map.get("schedule")))
        .method(asString(map.get("method")))
        .build();
}
```

**File**: Create new DTOs:

6. **PartyDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PartyDto {
    private String id;
    private String name;
    private String type;
    private String role;
    private ContactDto contact;
    private RepresentativeDto representative;
    private String taxCode;
}
```

7. **ContactDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ContactDto {
    private String email;
    private String phone;
    private String address;
}
```

8. **RepresentativeDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RepresentativeDto {
    private String name;
    private String position;
    private String email;
}
```

9. **PaymentDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PaymentDto {
    private Double totalValue;
    private String currency;
    private List<Object> schedule;
    private String method;
}
```

#### Testing:
```bash
# Check contract.workflow
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.contract.workflow'

# Check contract.parties
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.contract.parties'

# Check contract.payment
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.contract.payment'
```

---

### Task 2.2: Verify storage.s3 extended fields (1h)

**Priority**: MEDIUM  
**Effort**: 1h

#### Fields to verify (đã implement ở Phase trước):
- `url`: String
- `objectKey`: String
- `contentType`: String
- `size`: Long
- `versionId`: String
- `checksum`: Object {originalMD5, archiveMD5}

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **Verify enriched S3 mapping** (Line ~93-112):
```java
// Check logs to ensure all fields are being mapped
log.debug("S3 fields check - url={}, objectKey={}, versionId={}", 
          s3Data.get("url"), 
          s3Data.get("objectKey"),
          s3Data.get("versionId"));
```

**File**: `FileService.java`

2. **Verify mapToS3()** includes all fields:
```java
private S3Dto mapToS3(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return S3Dto.builder()
        .url(asString(map.get("url")))                    // Verify present
        .bucket(asString(map.get("bucket")))
        .objectKey(asString(map.get("objectKey")))        // Verify present
        .region(asString(map.get("region")))
        .contentType(asString(map.get("contentType")))    // Verify present
        .size(asLong(map.get("size")))                    // Verify present
        .versionId(asString(map.get("versionId")))        // Verify present
        .checksum(mapToChecksum(asMap(map.get("checksum")))) // Verify present
        .build();
}

private ChecksumDto mapToChecksum(Map<String, Object> map) {
    if (map == null) return null;
    return ChecksumDto.builder()
        .originalMD5(asString(map.get("originalMD5")))
        .archiveMD5(asString(map.get("archiveMD5")))
        .build();
}
```

**File**: Create DTOs if not exist:

3. **ChecksumDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChecksumDto {
    private String originalMD5;
    private String archiveMD5;
}
```

#### Testing:
```bash
# Check all S3 fields
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.storage.s3'

# Expected output should have:
# - url
# - bucket
# - objectKey
# - region
# - contentType
# - size
# - versionId
# - checksum {originalMD5, archiveMD5}
```

---

### Task 2.3: Populate metadata.fileSystem (2h)

**Priority**: MEDIUM  
**Effort**: 2h

#### Missing Fields:
- `dateModified`: ISO DateTime
- `dateAdded`: ISO DateTime
- `mediaFilename`: String
- `originalFilename`: String
- `originalMD5`: String
- `originalFileSize`: Long
- `originalMimeType`: String
- `archiveMD5`: String (nullable)
- `archiveFileSize`: Long (nullable)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **Build fileSystem metadata when creating entity** (Line ~93-117):
```java
Map<String, Object> metadataData = asMap(data.get("metadata"));
if (metadataData == null) metadataData = new java.util.HashMap<>();

// Build fileSystem sub-object
Map<String, Object> fileSystem = new java.util.HashMap<>();
fileSystem.put("dateAdded", entity.getCreatedAt());
fileSystem.put("dateModified", entity.getCreatedAt());
fileSystem.put("mediaFilename", entity.getName());
fileSystem.put("originalFilename", asString(data.get("name")));
fileSystem.put("originalMD5", asString(fileData != null ? fileData.get("hash.md5") : null));
fileSystem.put("originalFileSize", entity.getSize());
fileSystem.put("originalMimeType", entity.getMimeType());
fileSystem.put("archiveMD5", null);
fileSystem.put("archiveFileSize", null);

metadataData.put("fileSystem", fileSystem);
log.debug("Built fileSystem metadata for fileId={}", fileId);

entity.setMetadata(metadataData);
```

2. **Update fileSystem on modify** (Line ~166):
```java
Map<String, Object> metadataData = asMap(data.get("metadata"));
if (metadataData == null) metadataData = new java.util.HashMap<>();

// Update existing fileSystem or create new
Map<String, Object> fileSystem = asMap(metadataData.get("fileSystem"));
if (fileSystem == null) fileSystem = new java.util.HashMap<>();

fileSystem.put("dateModified", LocalDateTime.now());
// Don't overwrite other fields if they exist

metadataData.put("fileSystem", fileSystem);
```

**File**: `FileService.java`

3. **Implement mapToFileSystem()**:
```java
private FileSystemDto mapToFileSystem(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return FileSystemDto.builder()
        .dateModified(asLocalDateTime(map.get("dateModified")))
        .dateAdded(asLocalDateTime(map.get("dateAdded")))
        .mediaFilename(asString(map.get("mediaFilename")))
        .originalFilename(asString(map.get("originalFilename")))
        .originalMD5(asString(map.get("originalMD5")))
        .originalFileSize(asLong(map.get("originalFileSize")))
        .originalMimeType(asString(map.get("originalMimeType")))
        .archiveMD5(asString(map.get("archiveMD5")))
        .archiveFileSize(asLong(map.get("archiveFileSize")))
        .build();
}
```

**File**: Create DTO:

4. **FileSystemDto.java**:
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class FileSystemDto {
    private LocalDateTime dateModified;
    private LocalDateTime dateAdded;
    private String mediaFilename;
    private String originalFilename;
    private String originalMD5;
    private Long originalFileSize;
    private String originalMimeType;
    private String archiveMD5;
    private Long archiveFileSize;
}
```

5. **Update MetadataDto**:
```java
@Data
@Builder
public class MetadataDto {
    private FileSystemDto fileSystem;     // Update this
    private TechnicalDto technical;
    private OriginalDocumentDto originalDocument;
    private ArchivedDocumentDto archivedDocument;
}
```

#### Testing:
```bash
# Check metadata.fileSystem
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.metadata.fileSystem'

# Expected: all 9 fields present
```

---

### Task 2.4: Populate metadata.technical extended (2h)

**Priority**: MEDIUM  
**Effort**: 2h

#### Missing Fields:
- `lineEnding`: String (Enum: LF, CRLF)
- `bom`: Boolean
- `compression`: String (Enum: NONE, GZIP, DEFLATE)
- `pages`: Integer (nullable for non-PDF)
- `wordCount`: Integer (nullable)
- `characterCount`: Integer (nullable)

#### Implementation Plan:

**File**: `FileEventConsumer.java`

1. **Compute technical metadata when content extracted** (Line ~162-173):
```java
// Build content object
Map<String, Object> contentMap = new java.util.HashMap<>();
contentMap.put("plaintext", asString(data.get("plaintext")));
String plaintext = asString(data.get("plaintext"));

// Compute technical metadata from plaintext
Map<String, Object> technical = new java.util.HashMap<>();
technical.put("encoding", "UTF-8");
technical.put("lineEnding", detectLineEnding(plaintext));
technical.put("bom", false);
technical.put("compression", "NONE");
technical.put("pages", null);  // null for non-PDF
technical.put("wordCount", computeWordCount(plaintext));
technical.put("characterCount", plaintext != null ? plaintext.length() : null);

// Add to metadata
Map<String, Object> metadata = new java.util.HashMap<>();
metadata.put("technical", technical);
// Merge with existing metadata if any
```

2. **Add helper methods**:
```java
private String detectLineEnding(String text) {
    if (text == null) return "LF";
    if (text.contains("\r\n")) return "CRLF";
    if (text.contains("\n")) return "LF";
    return "LF";
}

private Integer computeWordCount(String text) {
    if (text == null || text.isEmpty()) return null;
    String[] words = text.trim().split("\\s+");
    return words.length > 0 ? words.length : null;
}
```

**File**: `FileService.java`

3. **Update mapToTechnical()** (currently only has encoding):
```java
private TechnicalDto mapToTechnical(Map<String, Object> map) {
    if (map == null || map.isEmpty()) return null;
    
    return TechnicalDto.builder()
        .encoding(asString(map.get("encoding")))
        .lineEnding(asString(map.get("lineEnding")))
        .bom(asBoolean(map.get("bom")))
        .compression(asString(map.get("compression")))
        .pages(asInteger(map.get("pages")))
        .wordCount(asInteger(map.get("wordCount")))
        .characterCount(asInteger(map.get("characterCount")))
        .build();
}
```

**File**: Update DTO:

4. **TechnicalDto.java**:
```java
@Data
@Builder
public class TechnicalDto {
    private String encoding;
    private String lineEnding;      // NEW
    private Boolean bom;            // NEW
    private String compression;     // NEW
    private Integer pages;          // NEW
    private Integer wordCount;      // NEW
    private Integer characterCount; // NEW
}
```

#### Testing:
```bash
# Check metadata.technical
curl -X GET "http://localhost:8002/api/v1/repository-management-service/files/{fileId}" | jq '.data.metadata.technical'

# Expected output:
# - encoding: "UTF-8"
# - lineEnding: "LF" or "CRLF"
# - bom: false
# - compression: "NONE"
# - pages: null (for text files)
# - wordCount: number
# - characterCount: number
```

---

## ✅ Acceptance Criteria

### Contract Extended:
- [x] `workflow` object với currentStage và stages array
- [x] `parties` array với ít nhất các fields: id, name, type, role, contact, representative
- [x] `payment` object với totalValue, currency, schedule, method

### Storage S3:
- [x] Tất cả 8 fields present: url, bucket, objectKey, region, contentType, size, versionId, checksum

### Metadata FileSystem:
- [x] 9 fields đầy đủ: dateModified, dateAdded, mediaFilename, originalFilename, originalMD5, originalFileSize, originalMimeType, archiveMD5, archiveFileSize

### Metadata Technical:
- [x] 7 fields đầy đủ: encoding, lineEnding, bom, compression, pages, wordCount, characterCount

---

## 🚀 Deployment Steps

1. **Create new DTOs**:
   - PartyDto, ContactDto, RepresentativeDto
   - PaymentDto
   - ChecksumDto
   - FileSystemDto
   - Update TechnicalDto

2. **Update FileService mappers**:
   - Implement mapToParties(), mapToPayment()
   - Implement mapToFileSystem()
   - Update mapToTechnical()

3. **Update FileEventConsumer**:
   - Add fileSystem metadata building
   - Add technical metadata computation
   - Add helper methods

4. **Build & test**:
```bash
./gradlew clean build
docker-compose restart repository-management-service
```

5. **Integration test**:
```bash
powershell -File test-upload-file.ps1
powershell -File test-get-file.ps1
```

---

## 📊 Progress Tracking

| Task | Status | Effort | Completion |
|------|--------|--------|------------|
| 2.1 contract extended | ⬜ TODO | 2h | 0% |
| 2.2 storage.s3 verify | ⬜ TODO | 1h | 0% |
| 2.3 metadata.fileSystem | ⬜ TODO | 2h | 0% |
| 2.4 metadata.technical | ⬜ TODO | 2h | 0% |
| **TOTAL** | **⬜ TODO** | **7h** | **0%** |

**Target**: 95% schema completion (lên từ 70%)

---

## 🔗 Dependencies

**Must complete Phase 1 first**:
- Task 1.1: overview fields
- Task 1.2: contract core fields
- Task 1.3: file.version
- Task 1.4: audit core fields

---

## 🔗 Related Files

- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/consumer/FileEventConsumer.java`
- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/service/FileService.java`
- `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/dto/*.java`
