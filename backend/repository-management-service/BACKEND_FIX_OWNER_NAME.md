# ✅ Fix Backend - Thêm ownerName vào Repository Response

## 🎯 Vấn đề

Frontend cần hiển thị **TÊN** user (ví dụ: "Nguyễn Văn A") thay vì **ID** user (ví dụ: "user-456").

```tsx
// Frontend mong đợi:
{
  "ownerUserId": "user-456",
  "ownerName": "Nguyễn Văn A"  // ✅ Cần field này
}
```

---

## 📊 Phân tích Backend

### 1. ✅ DTO đã có field `ownerName`
**File**: `RepositoryDTO.java`

```java
// Line 38 - ĐÃ CÓ SẴN
private String ownerName;
```

### 2. ❌ Service chưa populate ownerName
**File**: `RepositoryServiceImpl.java`

**Trước đây**:
```java
// Line 53 - Chỉ map từ Entity, không có ownerName
return entities.map(RepositoryDTO::fromEntity);
```

**Vấn đề**: `fromEntity()` không populate `ownerName` vì Entity không có field này.

---

## 🛠️ Giải pháp

### Tạo method `enrichWithUserNames()`:
1. Lấy danh sách unique `ownerUserId` từ repositories
2. Gọi User Management Service bulk API để lấy user info
3. Map `userId` → `fullName` (firstName + lastName)
4. Populate `ownerName` vào từng RepositoryDTO

---

## 📝 Changes Made

### File: `RepositoryServiceImpl.java`

#### 1. Thêm method `enrichWithUserNames()`

```java
/**
 * Enrich RepositoryDTOs with ownerName by calling User Management Service
 */
@SuppressWarnings("unchecked")
private Page<RepositoryDTO> enrichWithUserNames(Page<RepositoryDTO> page) {
    try {
        // Collect unique owner user IDs
        List<String> ownerIds = page.getContent().stream()
            .map(RepositoryDTO::getOwnerUserId)
            .filter(id -> id != null && !id.isEmpty())
            .distinct()
            .collect(Collectors.toList());
        
        if (ownerIds.isEmpty()) {
            return page;
        }
        
        // Call User Management Service bulk API
        String url = userManagementServiceUrl + "/api/v1/user-management-service/users/bulk?ids=" + String.join(",", ownerIds);
        log.info("Fetching user names from: {}", url);
        
        Map<String, Object> response = restTemplate.getForObject(url, Map.class);
        if (response != null && response.containsKey("data")) {
            List<Map<String, Object>> users = (List<Map<String, Object>>) response.get("data");
            
            // Create userId -> userName map
            Map<String, String> userNameMap = users.stream()
                .collect(Collectors.toMap(
                    user -> (String) user.get("id"),
                    user -> {
                        String firstName = (String) user.get("firstName");
                        String lastName = (String) user.get("lastName");
                        String username = (String) user.get("username");
                        
                        if (firstName != null && lastName != null) {
                            return firstName + " " + lastName;
                        } else if (firstName != null) {
                            return firstName;
                        } else if (lastName != null) {
                            return lastName;
                        } else if (username != null) {
                            return username;
                        }
                        return "Unknown User";
                    },
                    (existing, replacement) -> existing // Keep first value if duplicate
                ));
            
            // Populate ownerName
            page.getContent().forEach(dto -> {
                String ownerName = userNameMap.get(dto.getOwnerUserId());
                if (ownerName != null) {
                    dto.setOwnerName(ownerName);
                }
            });
        }
        
        return page;
    } catch (Exception e) {
        log.warn("Failed to enrich with user names: {}", e.getMessage());
        // Return original page if enrichment fails
        return page;
    }
}
```

#### 2. Update TẤT CẢ methods trả về `Page<RepositoryDTO>`

**Các methods đã update**:

1. ✅ `getAllRepositories()` - Line 53
2. ✅ `getMyRepositories()` - Line 60
3. ✅ `getPersonalRepositories()` - Line 69
4. ✅ `getOrganizationRepositories()` - Line 78
5. ✅ `getUserOrganizationRepositories()` - Line 100, 108
6. ✅ `getPublicRepositories()` - Line 428
7. ✅ `searchRepositories()` - Line 249
8. ✅ `searchPersonalRepositories()` - Line 256
9. ✅ `searchOrganizationRepositories()` - Line 263
10. ✅ `searchUserOrganizationRepositories()` - Line 356
11. ✅ `searchPublicRepositories()` - Line 435

**Trước**:
```java
return entities.map(RepositoryDTO::fromEntity);
```

**Sau**:
```java
return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
```

---

## 🔗 Dependencies

### User Management Service API

**Endpoint**: `GET /api/v1/user-management-service/users/bulk?ids={id1},{id2},{id3}`

**Response**:
```json
{
  "data": [
    {
      "id": "user-456",
      "username": "nguyenvana",
      "firstName": "Nguyễn Văn",
      "lastName": "A",
      "email": "nguyenvana@example.com"
    }
  ]
}
```

**Config**:
```properties
# application.properties
user.management.service.url=http://localhost:8001
```

---

## 📊 Luồng dữ liệu

```
1. Frontend gọi: GET /api/v1/repository-management-service/repositories/my

2. RepositoryServiceImpl.getMyRepositories()
   ↓
3. Query MongoDB → List<RepositoryEntity>
   ↓
4. Map to RepositoryDTO (chưa có ownerName)
   ↓
5. enrichWithUserNames()
   ├─ Collect ownerUserIds: ["user-1", "user-2"]
   ├─ Call User API: GET /users/bulk?ids=user-1,user-2
   ├─ Get user names: {"user-1": "Nguyễn Văn A", "user-2": "Trần Thị B"}
   └─ Populate ownerName vào DTOs
   ↓
6. Return với ownerName đầy đủ

7. Frontend nhận:
{
  "content": [
    {
      "id": "repo-123",
      "ownerUserId": "user-1",
      "ownerName": "Nguyễn Văn A"  // ✅
    }
  ]
}
```

---

## ✅ Kết quả

### Response trước khi fix:
```json
{
  "id": "repo-123",
  "name": "My Repository",
  "ownerUserId": "user-456",
  "ownerName": null  // ❌ NULL
}
```

### Response sau khi fix:
```json
{
  "id": "repo-123",
  "name": "My Repository",
  "ownerUserId": "user-456",
  "ownerName": "Nguyễn Văn A"  // ✅ TÊN
}
```

---

## 🎯 Priority Logic

Method chọn tên theo thứ tự:
1. `firstName + " " + lastName` (ưu tiên nhất)
2. `firstName` (nếu không có lastName)
3. `lastName` (nếu không có firstName)
4. `username` (fallback)
5. `"Unknown User"` (last resort)

---

## 🚨 Error Handling

```java
try {
    // Enrich with user names
} catch (Exception e) {
    log.warn("Failed to enrich with user names: {}", e.getMessage());
    // Return original page if enrichment fails
    return page;
}
```

**Graceful degradation**:
- Nếu User Management Service down → Trả về repositories với `ownerName = null`
- Frontend vẫn hoạt động, chỉ hiển thị "Chưa có thông tin"

---

## 🧪 Testing

### 1. Test Unit
```java
@Test
public void testEnrichWithUserNames() {
    // Mock User Management Service response
    // Assert ownerName is populated correctly
}
```

### 2. Test Integration
```bash
# 1. Start User Management Service
cd backend/user-management-service
mvn spring-boot:run

# 2. Start Repository Service
cd backend/repository-management-service
mvn spring-boot:run

# 3. Test API
curl http://localhost:8002/api/v1/repository-management-service/repositories/my \
  -H "Authorization: Bearer YOUR_TOKEN"

# Expected response: ownerName not null
```

### 3. Test Frontend
```bash
# Open browser
http://localhost:3000/repositories

# Check: "Chủ sở hữu" column shows names, not IDs
```

---

## 📂 Files Modified

1. ✅ `RepositoryServiceImpl.java` - Thêm `enrichWithUserNames()` method
2. ✅ `RepositoryServiceImpl.java` - Update 11 methods trả về `Page<RepositoryDTO>`

---

## 🚀 Deployment

### Prerequisites:
- ✅ User Management Service running on port 8001
- ✅ MongoDB running
- ✅ `user.management.service.url` configured

### Steps:
```bash
# 1. Rebuild service
cd backend/repository-management-service
mvn clean install

# 2. Restart service
mvn spring-boot:run

# 3. Test API
curl http://localhost:8002/api/v1/repository-management-service/repositories/my
```

---

## ✅ Checklist

- [x] DTO has `ownerName` field
- [x] Method `enrichWithUserNames()` created
- [x] All 11 methods updated
- [x] Error handling added
- [x] Logging added
- [x] Graceful degradation implemented
- [ ] Unit tests written (TODO)
- [ ] Integration tests run (TODO)
- [ ] Frontend verified (TODO)

---

## 🎉 Hoàn thành

**Repository Service giờ trả về `ownerName` đầy đủ cho frontend!**

Frontend có thể hiển thị:
```tsx
<span>{repo.ownerName || 'Chưa có thông tin'}</span>
```

Thay vì:
```tsx
<span>{repo.ownerUserId}</span>  // ❌ Hiển thị ID
```
