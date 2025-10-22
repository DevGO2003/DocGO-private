# Refactor Guide - MongoDB Atlas với Schema v3

## 🎯 Mục tiêu
Refactor repository để sử dụng MongoDB Atlas với schema v3 tối ưu và trả về response đúng cấu trúc document-management-sample-v3.json

## ✅ Đã hoàn thành

### 1. **FileEntity.java** ✅
- Đổi collection: `files` → `documents`
- Simplified structure: 8 nested maps chính
- Thêm helper methods cho backward compatibility
- Cấu trúc mới:
  ```java
  @Document(collection = "documents")
  public class FileEntity {
      @Id
      private String id;
      
      private Map<String, Object> overview;
      private Map<String, Object> metadata;
      private Map<String, Object> contract;
      private Map<String, Object> content;
      private Map<String, Object> storage;
      private Map<String, Object> security;
      private Map<String, Object> versioning;
      private Map<String, Object> audit;
  }
  ```

### 2. **FullFileResponseDto.java** ✅
- Reorder fields: metadata trước contract
- Thêm `SecurityDto` thay cho `FileInfoDto.security`
- Xóa `processing` field
- Structure mới match 100% với v3 schema

### 3. **SecurityDto.java** ✅
- Tạo mới DTO cho security section
- Bao gồm: encryption, watermark, digitalSignature, accessLogging, permissions

---

## 🔄 Cần refactor tiếp

### 4. **FileService.java - getFullFileById()**
Cần update mapping logic để match v3 schema:

#### 4.1. Overview Section
```java
private OverviewDto mapToOverview(Map<String, Object> overviewMap) {
    return OverviewDto.builder()
        .title(asString(overviewMap.get("title")))
        .status(asString(overviewMap.get("status")))  // ACTIVE, DRAFT, etc.
        .documentType(asString(overviewMap.get("documentType")))  // CONTRACT, INVOICE, etc.
        .tags(asList(overviewMap.get("tags")))
        .ownerUserId(asString(overviewMap.get("ownerUserId")))
        .language(asString(overviewMap.get("language")))  // vi, en, fr, zh
        .region(asString(overviewMap.get("region")))  // VN, US, EU, APAC
        .isNew(asBoolean(overviewMap.get("isNew")))
        .build();
}
```

#### 4.2. Metadata Section
Cần update để match v3 structure:
- `metadata.file` (name, mimeType, size, hash)
- `metadata.fileSystem` (dateAdded, dateModified, originalFilename, etc.)
- `metadata.originalDocument` (dcFormat, dcTitle, xmpCreateDate, etc.)
- `metadata.archivedDocument` (chỉ khi có archiveMD5)
- `metadata.technical` (encoding, lineEnding, pages, wordCount, etc.)

#### 4.3. Contract Section
Đã có, cần verify:
- `contract.type` → Enum: SERVICE_AGREEMENT, SOFTWARE_DEVELOPMENT, etc.
- `contract.currency` → Enum: USD, VND, EUR, JPY
- `contract.priority` → Enum: HIGH, MEDIUM, LOW
- `contract.confidentiality` → Enum: CONFIDENTIAL, INTERNAL, PUBLIC, RESTRICTED

#### 4.4. Content Section
Cần thêm các fields v3:
- `content.extraction` (status, method, extractedAt, characterCount, wordCount)
- `content.summarization` (status, model, processedAt, processingTime, inputTokens, outputTokens)
- `content.processing` (status, error)

#### 4.5. Storage Section
Update để match v3:
- `storage.s3.checksum` → chỉ có `md5`, không có `originalMD5` và `archiveMD5`
- `storage.local` → thêm `mimeType`, `size`, `mtime`, `revision`

#### 4.6. Security Section (NEW)
Tạo mới mapping từ entity:
```java
private SecurityDto mapToSecurity(Map<String, Object> securityMap) {
    if (securityMap == null || securityMap.isEmpty()) return null;
    return SecurityDto.builder()
        .encryption(asString(securityMap.get("encryption")))  // AES-256, AES-128, NONE
        .watermark(asBoolean(securityMap.get("watermark")))
        .digitalSignature(asBoolean(securityMap.get("digitalSignature")))
        .accessLogging(asBoolean(securityMap.get("accessLogging")))
        .permissions(mapToPermissions(asMap(securityMap.get("permissions"))))
        .build();
}
```

#### 4.7. Versioning Section
Update để match v3:
- `versioning.current` (number, tag) - thay cho `currentVersionInfo`
- `versioning.history[]` - đơn giản hóa structure
- Xóa: `versions`, `changeLog` (duplicate với history)

#### 4.8. Audit Section
**QUAN TRỌNG**: Xóa duplicate fields
```java
private AuditDto mapToAudit(Map<String, Object> auditMap) {
    return AuditDto.builder()
        .createdAt(asLocalDateTime(auditMap.get("createdAt")))
        .createdBy(asString(auditMap.get("createdBy")))
        .updatedAt(asLocalDateTime(auditMap.get("updatedAt")))  // Chỉ giữ updatedAt
        .updatedBy(asString(auditMap.get("updatedBy")))         // Chỉ giữ updatedBy
        .deletedAt(asLocalDateTime(auditMap.get("deletedAt")))
        .deletedBy(asString(auditMap.get("deletedBy")))
        .isDeleted(asBoolean(auditMap.get("isDeleted")))
        .changeHistory(mapToChangeHistory(asList(auditMap.get("changeHistory"))))
        .accessLog(mapToAccessLog(asList(auditMap.get("accessLog"))))
        .build();
}
```

**Xóa các fields:** `lastModifiedAt`, `lastModifiedBy`, `version`

---

## 📋 Update DTOs cần thiết

### OverviewDto.java
```java
@Data
@Builder
public class OverviewDto {
    private String title;
    private String status;           // ACTIVE, DRAFT, DELETED, ARCHIVED, INACTIVE
    private String documentType;     // CONTRACT, INVOICE, MEMO, REPORT, AGREEMENT, NOT_DOCUMENT
    private List<String> tags;
    private String ownerUserId;
    private String language;         // vi, en, fr, zh (lowercase)
    private String region;           // VN, US, EU, APAC (uppercase)
    private Boolean isNew;
}
```

### MetadataDto.java
Cần restructure để match v3:
```java
@Data
@Builder
public class MetadataDto {
    private FileMetadataDto file;
    private FileSystemDto fileSystem;
    private OriginalDocumentDto originalDocument;
    private ArchivedDocumentDto archivedDocument;
    private TechnicalDto technical;
    
    @Data
    @Builder
    public static class FileMetadataDto {
        private String name;
        private String mimeType;
        private Long size;
        private HashDto hash;
    }
    
    @Data
    @Builder
    public static class FileSystemDto {
        private String dateAdded;
        private String dateModified;
        private String originalFilename;
        private String originalMD5;
        private Long originalFileSize;
        private String originalMimeType;
        private String archiveMD5;
        private Long archiveFileSize;
    }
}
```

### ContentDto.java
Thêm các fields mới:
```java
@Data
@Builder
public class ContentDto {
    private String plaintext;
    private String extractedText;
    private String summary;
    private List<String> keyTerms;
    private List<SectionDto> sections;
    private OcrDto ocr;
    private ExtractionDto extraction;        // NEW
    private SummarizationDto summarization;  // NEW
    private ClassificationDto classification;
    private ProcessingDto processing;
    private Object jsonContent;
    private String jsonAnalysisStatus;
    
    @Data
    @Builder
    public static class ExtractionDto {
        private String status;     // SUCCESS, PARTIAL, FAILED
        private String method;     // DIRECT, OCR, HYBRID
        private String extractedAt;
        private Integer characterCount;
        private Integer wordCount;
        private String error;
    }
    
    @Data
    @Builder
    public static class SummarizationDto {
        private String status;     // SUCCESS, FAILED, SKIPPED
        private String model;      // gemini-1.5-flash
        private String processedAt;
        private Double processingTime;
        private Integer inputTokens;
        private Integer outputTokens;
        private String error;
    }
}
```

### VersioningDto.java
Simplify structure:
```java
@Data
@Builder
public class VersioningDto {
    private CurrentVersionDto current;  // Thay cho currentVersionInfo
    private List<HistoryDto> history;
    
    @Data
    @Builder
    public static class CurrentVersionDto {
        private Integer number;
        private String tag;
    }
    
    @Data
    @Builder
    public static class HistoryDto {
        private Integer version;
        private String tag;
        private String changedAt;
        private String changedBy;
        private String changeType;  // CREATE, UPDATE, DELETE, ARCHIVE
        private String changes;
        private List<String> changedFields;
        private Map<String, Object> diff;
    }
}
```

### AuditDto.java
**XÓA duplicate fields:**
```java
@Data
@Builder
public class AuditDto {
    private String createdAt;
    private String createdBy;
    private String updatedAt;     // Chỉ giữ updatedAt (xóa lastModifiedAt)
    private String updatedBy;     // Chỉ giữ updatedBy (xóa lastModifiedBy)
    private String deletedAt;
    private String deletedBy;
    private Boolean isDeleted;
    private List<ChangeHistoryDto> changeHistory;
    private List<AccessLogDto> accessLog;
    // XÓA: lastModifiedAt, lastModifiedBy, version
    
    @Data
    @Builder
    public static class ChangeHistoryDto {
        private String action;      // CREATE, UPDATE, DELETE, VIEW, SHARE, DOWNLOAD, UPLOAD, RESTORE
        private String timestamp;
        private String actor;       // Đổi từ userId thành actor
        private String details;
        private String ipAddress;
        private String userAgent;
    }
    
    @Data
    @Builder
    public static class AccessLogDto {
        private String action;      // VIEW, EDIT, DOWNLOAD, SHARE, DELETE
        private String timestamp;
        private String actor;       // Đổi từ userId thành actor
        private String ipAddress;
        private String userAgent;
    }
}
```

---

## 🔧 FileService.java - Main Method Update

```java
public FullFileResponseDto getFullFileById(String id) {
    Optional<FileEntity> fileOpt = getFileById(id);
    if (fileOpt.isEmpty()) return null;

    FileEntity file = fileOpt.get();
    
    return FullFileResponseDto.builder()
        .id(file.getId())
        .overview(mapToOverview(file.getOverview()))
        .metadata(mapToMetadata(file.getMetadata()))
        .contract(mapToContract(file.getContract()))
        .content(mapToContent(file.getContent()))
        .storage(mapToStorage(file.getStorage()))
        .security(mapToSecurity(file.getSecurity()))  // NEW
        .versioning(mapToVersioning(file.getVersioning()))
        .audit(mapToAudit(file.getAudit()))
        .build();
}
```

---

## 🗄️ MongoDB Atlas Configuration

### application.properties
```properties
# MongoDB Atlas Connection
spring.data.mongodb.uri=mongodb+srv://<username>:<password>@cluster.mongodb.net/docgo?retryWrites=true&w=majority
spring.data.mongodb.database=docgo

# Collection name
spring.data.mongodb.auto-index-creation=true
```

### MongoDB Indexes
```javascript
// Required indexes for documents collection
db.documents.createIndex({ "id": 1 }, { unique: true })
db.documents.createIndex({ "overview.ownerUserId": 1, "overview.status": 1 })
db.documents.createIndex({ "overview.documentType": 1 })
db.documents.createIndex({ "contract.effectiveDate": 1, "contract.expiryDate": 1 })
db.documents.createIndex({ "metadata.file.hash.md5": 1 })
db.documents.createIndex({ "audit.createdAt": -1 })
db.documents.createIndex({ "audit.updatedAt": -1 })
```

---

## 📝 Testing Checklist

- [ ] FileEntity lưu đúng 8 sections vào MongoDB
- [ ] getFullFileById() trả về đúng cấu trúc v3
- [ ] Enum values đúng format (UPPERCASE hoặc lowercase theo quy định)
- [ ] Không có duplicate fields trong response
- [ ] Security section được map đúng
- [ ] Versioning.current thay cho currentVersionInfo
- [ ] Audit không có lastModifiedAt/By
- [ ] Content có đầy đủ extraction, summarization, processing
- [ ] Metadata có đủ 5 sub-sections

---

## 🚀 Next Steps

1. Update các DTOs theo spec trên
2. Refactor FileService mapping methods
3. Test với MongoDB Atlas
4. Update FileEventConsumer để populate đúng v3 structure
5. Update API documentation (Swagger)

---

**Version:** v3  
**Last Updated:** 2025-10-22  
**Status:** 🟡 In Progress
