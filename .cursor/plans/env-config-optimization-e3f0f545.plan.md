<!-- e3f0f545-7cee-4c09-a81e-94fba0cc78c5 e5e9ce62-53b8-4b9d-8109-4bd6ee5fae92 -->
# Kế hoạch Tạo Document Entity và Seed Data cho MongoDB

## Vấn đề thực tế

Frontend đang gọi đúng endpoint `/documents` nhưng:
- Backend `/documents` endpoint hiện tại chỉ là FileStorageService (mock, không kết nối MongoDB)
- Không có Document entity trong database
- Cần tạo Document entity và seed 5 documents vào MongoDB Atlas

## Giải pháp

### 1. Tạo Document Entity
**File mới**: `backend/document-management-service/src/main/java/com/devgo2003/docgo/document_service/entity/DocumentEntity.java`

```java
@Document(collection = "documents")
@Getter
@Setter
public class DocumentEntity extends BaseEntity implements Persistable<String> {
    @Id
    @MongoId
    private String id;
    
    @NotBlank
    private String title;
    
    private String description;
    
    @NotNull
    private String status; // DRAFT, ACTIVE, ARCHIVED
    
    private String fileId; // Reference to uploaded file
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String fileUrl;
    
    private String userId; // Owner
    private List<String> tags;
    
    // Metadata
    private String category;
    private Integer version;
    
    @Override
    public String getId() { return id; }
    
    @Override
    public boolean isNew() { return id == null; }
}
```

### 2. Tạo Document Repository
**File mới**: `backend/document-management-service/src/main/java/com/devgo2003/docgo/document_service/repository/DocumentRepository.java`

```java
public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {
    Page<DocumentEntity> findAll(Pageable pageable);
    Page<DocumentEntity> findByUserId(String userId, Pageable pageable);
}
```

### 3. Cập nhật Document Service
**File**: `backend/document-management-service/src/main/java/com/devgo2003/docgo/document_service/service/FileStorageService.java`

Thay đổi method signature:
```java
FileListResponse getAllFiles(int page, int size, String userId);
// Đổi thành:
Page<DocumentEntity> getAllDocuments(int page, int size, String userId);
```

**File**: `backend/document-management-service/src/main/java/com/devgo2003/docgo/document_service/service/impl/FileStorageServiceImpl.java`

```java
@Autowired
private DocumentRepository documentRepository;

@Override
public Page<DocumentEntity> getAllDocuments(int page, int size, String userId) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
    if (userId != null && !userId.isEmpty()) {
        return documentRepository.findByUserId(userId, pageable);
    }
    return documentRepository.findAll(pageable);
}
```

### 4. Cập nhật Document Controller
**File**: `backend/document-management-service/src/main/java/com/devgo2003/docgo/document_service/controller/DocumentController.java`

Đổi response từ `FileListResponse` sang `Page<DocumentEntity>`:

```java
@GetMapping
public ResponseEntity<RestResponse<Page<DocumentEntity>>> getAllDocuments(
    @RequestParam(value = "page", defaultValue = "0") int page,
    @RequestParam(value = "size", defaultValue = "10") int size,
    @RequestParam(value = "userId", required = false) String userId) {
    
    Page<DocumentEntity> documents = fileStorageService.getAllDocuments(page, size, userId);
    return ResponseEntity.ok(RestResponse.success(documents, "Documents retrieved successfully"));
}
```

### 5. Tạo Seed Script cho Documents
**File mới**: `backend/document-management-service/src/main/java/com/devgo2003/docgo/document_service/seed/DocumentSeeder.java`

```java
@Component
public class DocumentSeeder {
    
    @Autowired
    private DocumentRepository documentRepository;
    
    @PostConstruct
    public void seedDocuments() {
        if (documentRepository.count() > 0) {
            return; // Already seeded
        }
        
        List<DocumentEntity> documents = Arrays.asList(
            createDocument("DOC-2024-001", "Báo cáo tài chính Q1 2024", "Financial Report", "PDF"),
            createDocument("DOC-2024-002", "Hướng dẫn sử dụng hệ thống", "User Guide", "DOCX"),
            createDocument("DOC-2024-003", "Kế hoạch kinh doanh 2024", "Business Plan", "PDF"),
            createDocument("DOC-2024-004", "Báo cáo dự án IT", "Project Report", "PDF"),
            createDocument("DOC-2024-005", "Tài liệu đào tạo nhân viên", "Training Material", "PPT")
        );
        
        documentRepository.saveAll(documents);
    }
    
    private DocumentEntity createDocument(String id, String title, String category, String fileType) {
        DocumentEntity doc = new DocumentEntity();
        doc.setId(id);
        doc.setTitle(title);
        doc.setDescription("Mô tả cho " + title);
        doc.setStatus("ACTIVE");
        doc.setCategory(category);
        doc.setFileType(fileType);
        doc.setFileSize(1024L * 1024); // 1MB
        doc.setTags(Arrays.asList("important", "2024"));
        doc.setVersion(1);
        return doc;
    }
}
```

### 6. Cập nhật Frontend Mapper
**File**: `frontend/web-app/src/app/(documents)/documents/_services/mappers.ts`

Cập nhật để xử lý cả Contract và Document:

```typescript
export function mapApiDocumentToUi(doc: any): Document {
  return {
    id: String(doc.id),
    title: doc.title || doc.contractNumber || `Document ${doc.id}`,
    description: doc.description || doc.contractObject || doc.summary || '',
    status: doc.status || 'DRAFT',
    contractType: doc.contractType || doc.category || 'Other',
    tags: doc.tags || [],
    contractNumber: doc.contractNumber || doc.id,
    createdAt: doc.createdAt || '',
    updatedAt: doc.updatedAt || '',
    parties: doc.parties || [],
    totalValue: Number(doc.totalValue || 0),
    currency: doc.currency || 'VND',
    effectiveDate: doc.effectiveDate || '',
    expiryDate: doc.endDate || '',
    riskLevel: doc.riskLevel,
    attachments: [],
  }
}

export function mapPaginated<T>(payload: any, mapItem: (x: any) => T): Paginated<T> {
  // Xử lý cả 2 format: RestResponse và Page
  const data = payload?.data ?? payload
  
  // Format 1: RestResponse with nested structure (contracts)
  if (data?.content && data?.result) {
    return {
      content: data.content.map(mapItem),
      totalElements: Number(data.result.totalElements ?? 0),
      totalPages: Number(data.result.totalPages ?? 1),
    }
  }
  
  // Format 2: Direct Page response (documents)
  if (Array.isArray(data?.content)) {
    return {
      content: data.content.map(mapItem),
      totalElements: Number(data.totalElements ?? 0),
      totalPages: Number(data.totalPages ?? 1),
    }
  }
  
  // Fallback
  return {
    content: [],
    totalElements: 0,
    totalPages: 0,
  }
}
```

## Thứ tự thực hiện

1. Tạo DocumentEntity class với các fields cần thiết
2. Tạo DocumentRepository interface
3. Cập nhật FileStorageService và Implementation
4. Cập nhật DocumentController để trả về Page<DocumentEntity>
5. Tạo DocumentSeeder để seed 5 documents
6. Cập nhật frontend mapper để xử lý response format
7. Rebuild và restart document-management-service
8. Test API /documents trả về 5 items
9. Verify frontend hiển thị 5 documents

## Kết quả mong đợi

- MongoDB Atlas có collection "documents" với 5 records
- API GET /documents?page=0&size=5 trả về 5 documents
- Frontend hiển thị 5 documents tại http://localhost:3000/documents
- Response format nhất quán với RestResponse wrapper

### To-dos

- [ ] Tạo DocumentEntity class trong entity folder
- [ ] Tạo DocumentRepository interface
- [ ] Cập nhật FileStorageService để trả về Page<DocumentEntity>
- [ ] Cập nhật DocumentController để sử dụng Page<DocumentEntity>
- [ ] Tạo DocumentSeeder để seed 5 documents vào MongoDB
- [ ] Cập nhật mapPaginated để xử lý cả 2 response formats
- [ ] Rebuild document-management-service và test API
- [ ] Verify frontend hiển thị 5 documents
- [ ] Xóa tất cả 25 todos cũ không còn liên quan