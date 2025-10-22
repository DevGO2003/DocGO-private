# Backend API Requirements: Repository Management

## Context
Frontend đã implement trang quản lý kho tài liệu (Repositories Management) tại `/repositories`. User có thể tạo và quản lý các kho tài liệu riêng, không còn bó buộc với repository có ID cố định.

## Yêu cầu Backend

### Base URL
```
/api/v1/repository-management-service/repositories
```

### Authentication
- Tất cả endpoints yêu cầu authentication (Bearer Token)
- Extract user info từ JWT token
- Nếu chưa có auth hoàn chỉnh: user mặc định là "admin"
- Người tạo repository tự động trở thành admin của repository đó

---

## API Endpoints

### 1. GET /repositories
**Mục đích**: Lấy danh sách tất cả repositories (có phân trang)

**Query Parameters**:
```typescript
{
  page?: number              // Default: 0
  size?: number              // Default: 20
  sortBy?: string            // Default: "createdAt"
  sortDirection?: string     // "asc" | "desc", Default: "desc"
  searchTerm?: string        // Tìm kiếm theo name, description
  includeDeleted?: boolean   // Default: false
}
```

**Response** (RestResponse envelope):
```json
{
  "statusCode": 200,
  "description": "Successfully retrieved repositories",
  "timestamp": "2025-01-22T10:00:00.000Z",
  "requestId": "req-xxx",
  "data": {
    "content": [
      {
        "id": "repo-1",
        "name": "Hợp đồng công ty",
        "description": "Kho lưu trữ hợp đồng công ty",
        "owner": "admin",
        "ownerName": "Administrator",
        "memberCount": 5,
        "fileCount": 120,
        "totalSize": 1048576000,
        "createdAt": "2025-01-20T10:00:00.000Z",
        "updatedAt": "2025-01-22T09:00:00.000Z",
        "isPublic": false,
        "tags": ["contract", "legal"]
      }
    ],
    "page": 0,
    "size": 20,
    "totalElements": 45,
    "totalPages": 3,
    "first": true,
    "last": false
  }
}
```

---

### 2. GET /repositories/my
**Mục đích**: Lấy danh sách repositories của user hiện tại

**Query Parameters**: Giống như GET /repositories

**Response**: Giống như GET /repositories nhưng chỉ trả về repositories mà user là owner hoặc member

---

### 3. GET /repositories/{id}
**Mục đích**: Lấy chi tiết một repository

**Path Parameter**:
- `id`: Repository ID

**Response**:
```json
{
  "statusCode": 200,
  "description": "Successfully retrieved repository",
  "timestamp": "2025-01-22T10:00:00.000Z",
  "requestId": "req-xxx",
  "data": {
    "id": "repo-1",
    "name": "Hợp đồng công ty",
    "description": "Kho lưu trữ hợp đồng công ty",
    "owner": "admin",
    "ownerName": "Administrator",
    "memberCount": 5,
    "fileCount": 120,
    "totalSize": 1048576000,
    "createdAt": "2025-01-20T10:00:00.000Z",
    "updatedAt": "2025-01-22T09:00:00.000Z",
    "isPublic": false,
    "tags": ["contract", "legal"],
    "members": [
      {
        "userId": "user-1",
        "username": "john.doe",
        "role": "ADMIN",
        "joinedAt": "2025-01-20T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 4. POST /repositories
**Mục đích**: Tạo repository mới

**Request Body**:
```json
{
  "name": "Tên kho tài liệu",
  "description": "Mô tả về kho tài liệu",
  "isPublic": false,
  "tags": ["tag1", "tag2"]
}
```

**Validation Rules**:
- `name`: Required, min 3 characters, max 100 characters
- `description`: Optional, max 500 characters
- `isPublic`: Optional, default false
- `tags`: Optional, array of strings

**Business Logic**:
1. Extract userId từ JWT token (hoặc dùng "admin" nếu chưa có auth)
2. Tạo repository mới
3. Tự động thêm người tạo làm admin của repository
4. Initialize memberCount = 1, fileCount = 0, totalSize = 0

**Response**:
```json
{
  "statusCode": 201,
  "description": "Repository created successfully",
  "timestamp": "2025-01-22T10:00:00.000Z",
  "requestId": "req-xxx",
  "data": {
    "id": "repo-new",
    "name": "Tên kho tài liệu",
    "description": "Mô tả về kho tài liệu",
    "owner": "admin",
    "ownerName": "Administrator",
    "memberCount": 1,
    "fileCount": 0,
    "totalSize": 0,
    "createdAt": "2025-01-22T10:00:00.000Z",
    "updatedAt": "2025-01-22T10:00:00.000Z",
    "isPublic": false,
    "tags": ["tag1", "tag2"]
  }
}
```

---

### 5. PUT /repositories/{id}
**Mục đích**: Cập nhật repository

**Path Parameter**:
- `id`: Repository ID

**Request Body**:
```json
{
  "name": "Tên mới",
  "description": "Mô tả mới",
  "isPublic": true,
  "tags": ["new-tag"]
}
```

**Authorization**:
- Chỉ owner hoặc admin của repository mới được update

**Response**: Giống như GET /repositories/{id}

---

### 6. DELETE /repositories/{id}
**Mục đích**: Xóa repository (soft delete)

**Path Parameter**:
- `id`: Repository ID

**Authorization**:
- Chỉ owner của repository mới được xóa

**Business Logic**:
1. Kiểm tra repository có files không
2. Nếu có files, yêu cầu xác nhận xóa hẳn (có thể implement force delete)
3. Soft delete repository (đánh dấu isDeleted = true)

**Response**:
```json
{
  "statusCode": 200,
  "description": "Repository deleted successfully",
  "timestamp": "2025-01-22T10:00:00.000Z",
  "requestId": "req-xxx",
  "data": {
    "id": "repo-1",
    "deletedAt": "2025-01-22T10:00:00.000Z"
  }
}
```

---

## Database Schema

### Repository Entity
```java
@Entity
@Table(name = "repositories")
public class Repository {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Column(length = 500)
    private String description;
    
    @Column(nullable = false)
    private String owner; // userId hoặc username
    
    @Column(length = 100)
    private String ownerName; // Tên hiển thị
    
    @Column(nullable = false)
    private Integer memberCount = 1;
    
    @Column(nullable = false)
    private Integer fileCount = 0;
    
    @Column(nullable = false)
    private Long totalSize = 0L; // bytes
    
    @Column(nullable = false)
    private Boolean isPublic = false;
    
    @Column(nullable = false)
    private Boolean isDeleted = false;
    
    @ElementCollection
    @CollectionTable(name = "repository_tags")
    private List<String> tags;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime deletedAt;
    
    // Relationships
    @OneToMany(mappedBy = "repository")
    private List<RepositoryMember> members;
    
    @OneToMany(mappedBy = "repository")
    private List<File> files;
}
```

### RepositoryMember Entity
```java
@Entity
@Table(name = "repository_members")
public class RepositoryMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    @ManyToOne
    @JoinColumn(name = "repository_id")
    private Repository repository;
    
    @Column(nullable = false)
    private String userId;
    
    @Column(nullable = false)
    private String username;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role; // ADMIN, EDITOR, VIEWER
    
    @CreationTimestamp
    private LocalDateTime joinedAt;
}

enum MemberRole {
    ADMIN,   // Toàn quyền
    EDITOR,  // Upload, edit files
    VIEWER   // Chỉ xem
}
```

---

## Cập nhật File Entity

Thêm relationship với Repository:

```java
@Entity
@Table(name = "files")
public class File {
    // ... existing fields ...
    
    @ManyToOne
    @JoinColumn(name = "repository_id", nullable = false)
    private Repository repository;
    
    // Khi upload file cần truyền thêm repositoryId
}
```

---

## Error Handling

### Common Errors

**404 - Repository Not Found**:
```json
{
  "statusCode": 404,
  "description": "Repository not found with id: repo-xxx",
  "timestamp": "2025-01-22T10:00:00.000Z",
  "requestId": "req-xxx",
  "path": "/api/v1/repository-management-service/repositories/repo-xxx"
}
```

**403 - Forbidden**:
```json
{
  "statusCode": 403,
  "description": "You don't have permission to access this repository",
  "timestamp": "2025-01-22T10:00:00.000Z",
  "requestId": "req-xxx",
  "path": "/api/v1/repository-management-service/repositories/repo-xxx"
}
```

**400 - Validation Error**:
```json
{
  "statusCode": 400,
  "description": "Validation failed",
  "timestamp": "2025-01-22T10:00:00.000Z",
  "requestId": "req-xxx",
  "path": "/api/v1/repository-management-service/repositories",
  "errors": {
    "name": "Name must be at least 3 characters"
  }
}
```

---

## Additional Requirements

### 1. File Upload Integration
- Khi upload file, phải truyền `repositoryId`
- Backend phải validate user có quyền upload vào repository không
- Sau khi upload thành công, tăng `fileCount` và `totalSize` của repository

### 2. Statistics Update
- Khi thêm member: tăng `memberCount`
- Khi xóa member: giảm `memberCount`
- Khi upload file: tăng `fileCount`, tăng `totalSize`
- Khi xóa file: giảm `fileCount`, giảm `totalSize`

### 3. Search & Filter
- Search theo `name`, `description`, `tags`
- Filter theo `isPublic`, `owner`
- Sort theo `createdAt`, `updatedAt`, `name`, `fileCount`

### 4. Authorization Matrix
```
Action          | Owner | Admin | Editor | Viewer | Public
----------------|-------|-------|--------|--------|--------
View            | ✅    | ✅    | ✅     | ✅     | ✅ (if isPublic)
Create Repo     | ✅    | ✅    | ✅     | ✅     | ✅
Update Repo     | ✅    | ✅    | ❌     | ❌     | ❌
Delete Repo     | ✅    | ❌    | ❌     | ❌     | ❌
Add Member      | ✅    | ✅    | ❌     | ❌     | ❌
Remove Member   | ✅    | ✅    | ❌     | ❌     | ❌
Upload File     | ✅    | ✅    | ✅     | ❌     | ❌
Delete File     | ✅    | ✅    | ✅     | ❌     | ❌
View File       | ✅    | ✅    | ✅     | ✅     | ✅ (if repo isPublic)
```

---

## Testing Checklist

- [ ] Tạo repository mới với user "admin"
- [ ] Tạo repository với user đã đăng nhập
- [ ] List tất cả repositories
- [ ] List repositories của user hiện tại
- [ ] Update repository (chỉ owner/admin)
- [ ] Delete repository (chỉ owner)
- [ ] Upload file vào repository
- [ ] Kiểm tra statistics update (fileCount, totalSize)
- [ ] Test authorization cho từng role
- [ ] Test search & filter
- [ ] Test pagination

---

## Notes

- Frontend đang dùng `documentAPI.getAllRepositories()` để gọi API
- Frontend đang dùng `useAuth()` để lấy thông tin user
- Nếu `user` null thì mặc định dùng "admin"
- Response phải tuân thủ RestResponse envelope
- Tất cả timestamps dùng ISO 8601 format
- ID dùng UUID hoặc String tùy backend
