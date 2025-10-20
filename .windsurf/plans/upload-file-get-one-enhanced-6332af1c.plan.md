<!-- 6332af1c-5680-4ec0-a900-f1f25e1ff4f5 e3ce6c30-c74a-4dc3-9082-7fb56ee1f663 -->
# Kế hoạch: Upload File -> API Get One Trả về JSON Schema Đầy Đủ

## 1. Chuẩn bị Database & Sample Data

### Xác minh data hiện tại

- Kiểm tra MongoDB collection `files` có document với ID `DOC-2024-004-NEW`
- Nếu chưa có, cần upload file test để tạo document mẫu

## 2. Cập nhật Entities & DTOs (23 files đã tạo - hoàn thành)

Các DTO mới đã được tạo trong bước trước:

- `Workflow.java`, `FileHash.java`, `FilePermissions.java`, `FileSecurity.java`
- `DigitalSignature.java`, `OriginalDocument.java`, `ArchivedDocument.java`
- `TechnicalInfo.java`, `S3Encryption.java`, `S3Lifecycle.java`, `S3Replication.java`
- `VersionBranching.java`, `Branch.java`, `VersionRollback.java`
- `AccessLog.java`, `ApprovalInfo.java`, `ComplianceInfo.java`
- `RestResponse.java`

## 3. Tạo Service Layer cho Presigned URL

### FileStorageService enhancements

File: `backend/file-management-service/src/main/java/com/devgo2003/docgo/file_service/service/impl/FileStorageServiceImpl.java`

Thêm methods:

```java
public String generatePresignedGetUrl(String objectKey) {
    // Generate presigned URL với expiry time từ config
}

public FileEntity enrichFileEntityWithUrls(FileEntity entity) {
    // Populate dynamic URLs cho file.url, storage.url
}
```

## 4. Tạo FileEntityEnricher Service

File mới: `backend/file-management-service/src/main/java/com/devgo2003/docgo/file_service/service/FileEntityEnricher.java`

Chức năng:

- Enrich FileEntity với presigned URLs
- Populate default values cho các trường mới (nếu null)
- Format dates sang ISO-8601
- Calculate derived fields (characterCount từ wordCount, etc.)
```java
@Service
public class FileEntityEnricher {
    @Autowired
    private FileStorageServiceImpl storageService;
    
    public FileEntity enrich(FileEntity entity) {
        // 1. Generate presigned URLs
        // 2. Set default values cho các nested objects
        // 3. Format timestamps
        // 4. Calculate technical info
        return entity;
    }
}
```


## 5. Cập nhật DocumentController

File: `backend/file-management-service/src/main/java/com/devgo2003/docgo/file_service/controller/DocumentController.java`

```java
@Autowired
private FileEntityEnricher enricher;

@GetMapping("/{id}")
public ResponseEntity<RestResponse<FileEntity>> getDocument(@PathVariable String id) {
    FileEntity document = fileService.getDocumentById(id);
    
    if (document == null) {
        return ResponseEntity.ok(RestResponse.<FileEntity>builder()
            .statusCode(404)
            .shortMessage("Not Found")
            .description("Không tìm thấy tài liệu với ID: " + id)
            .data(null)
            .build());
    }
    
    // Enrich entity với URLs và default values
    FileEntity enriched = enricher.enrich(document);
    
    return ResponseEntity.ok(RestResponse.<FileEntity>builder()
        .apiVersion("v1")
        .statusCode(200)
        .shortMessage("Success")
        .description("Đã lấy thông tin tài liệu thành công")
        .data(enriched)
        .timestamp(Instant.now().toString())
        .requestId(UUID.randomUUID().toString())
        .path("/api/v1/file-management-service/documents/" + id)
        .build());
}
```

## 6. Xử lý Kafka Events từ Automation Service

### UnifiedFileEventsListener enhancements

File: `backend/file-management-service/src/main/java/com/devgo2003/docgo/file_service/listener/UnifiedFileEventsListener.java`

Đảm bảo các events populate đúng fields:

- `file.metadata.recorded` → populate `metadata.fileSystem`, `metadata.technical`
- `file.plaintext.extracted` → populate `content.extractedText`, `content.keyTerms`
- `contract.summary.generated` → populate `contract.*` với đầy đủ nested objects

## 7. Thêm Configuration cho Presigned URL

File: `backend/file-management-service/src/main/resources/application.properties`

```properties
# Presigned URL expiry (seconds)
s3.presigned.url.expiry=3600

# File URL base path
file.url.base=https://docgo-storage.s3.amazonaws.com
```

## 8. Testing Plan

### Test với data có sẵn

1. Upload file mới qua automation-service
2. Đợi Kafka events được xử lý
3. Call API `GET /api/v1/file-management-service/documents/{id}`
4. Verify JSON response khớp với schema mẫu

### Test cases quan trọng

- Presigned URL được generate đúng
- Nested objects được populate đầy đủ
- Dates format ISO-8601
- Null safety cho các trường optional
- Performance với documents lớn

## 9. Documentation Update

### Swagger annotations

Cập nhật `@Operation` description trong DocumentController với:

- Full JSON schema example
- Field descriptions cho các nested objects
- Response codes và error cases

## Thứ tự thực hiện

1. Tạo FileEntityEnricher service (core logic)
2. Cập nhật FileStorageServiceImpl với presigned URL methods
3. Cập nhật DocumentController với enrichment logic
4. Thêm configuration properties
5. Test với data có sẵn
6. Verify Kafka events đang populate đúng fields
7. Fine-tune và optimize

## Files cần sửa/tạo

**Tạo mới:**

- `FileEntityEnricher.java` - Core enrichment logic

**Sửa:**

- `DocumentController.java` - Add enrichment call
- `FileStorageServiceImpl.java` - Add presigned URL generation
- `RestResponse.java` - Ensure all fields populated
- `application.properties` - Add configurations
- `UnifiedFileEventsListener.java` - Verify event mapping

**Kiểm tra:**

- Tất cả 17 DTO files mới đã tạo có compile OK
- MongoDB connection và data access hoạt động
- Kafka consumers đang nhận events

## Notes

- Workflow object phức tạp - có thể cần logic riêng để calculate stage progression
- Risk factors và compliance có thể cần service riêng nếu có business logic
- File permissions và security settings cần sync với authentication system
- Versioning.branching có thể để null nếu chưa implement branching feature