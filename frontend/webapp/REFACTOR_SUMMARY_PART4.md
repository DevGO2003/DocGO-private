# 📋 T\u00f3m t\u1eaft Refactor Ph\u1ea7n 4 - Repository Detail

## ✅ Đã hoàn thành

### 1. **RepositoryDetailTabs Component** ✅
**File**: `features/repositories/views/components/RepositoryDetailTabs.tsx`

#### Changes:
- ✅ Thêm tab **Overview** (Tổng quan) - vị trí đầu tiên
- ✅ Loại bỏ tab **Settings** 
- ✅ Disable tab **Activity** với tooltip
- ✅ Sử dụng **CommonTabs** từ UIComponents thay vì custom tabs

#### Tabs hiện tại:
```typescript
[
  { id: 'overview', label: 'Tổng quan', icon: Info, disabled: false },
  { id: 'files', label: 'Files', icon: FileText, disabled: false },
  { id: 'members', label: 'Members', icon: Users, disabled: false },
  { id: 'activity', label: 'Activity', icon: Activity, disabled: true,
    tooltip: 'Tạm thời chưa có, tương lai các phiên bản kế tiếp sẽ có' }
]
```

#### Tooltip cho disabled tab:
```tsx
{tab.disabled && tab.tooltip && (
  <div title={tab.tooltip} className="inline-block cursor-not-allowed">
    {tabContent}
  </div>
)}
```

---

### 2. **Repository Detail Page** ✅ (Partially)
**File**: `features/repositories/views/pages/RepositoryDetail/RepositoryDetail.tsx`

#### Đã fix:
- ✅ Thay `activeTab` default từ `'info'` → `'overview'`
- ✅ Thêm `description` vào RepositoryLayout header
- ✅ Loại bỏ header thừa (đã có RepositoryLayout)
- ✅ Sử dụng Card từ `@shared/components` (đã export CommonCard)
- ✅ Xóa unused imports (Info, RepositoryType, useRepositoryActivity)
- ✅ Tab Overview hiển thị đầy đủ thông tin repository

#### Overview Tab Content:
```tsx
<Card className="p-6">
  <div className="space-y-6">
    {/* Row 1: Tên, Loại, Trạng thái */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>Tên Repository</div>
      <div>Loại (Cá nhân/Tổ chức)</div>
      <div>Trạng thái (Công khai/Riêng tư)</div>
    </div>

    {/* Row 2: Mô tả */}
    <div>Mô tả</div>

    {/* Row 3: Chủ sở hữu, Tổ chức */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>Chủ sở hữu: {ownerName}</div>
      <div>Tổ chức: {organizationName}</div>
    </div>

    {/* Row 4: Stats - Số files, Số members, Dung lượng */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
      <div>Số lượng file: {fileCount}</div>
      <div>Số thành viên: {memberCount}</div>
      <div>Dung lượng: {totalSize}</div>
    </div>

    {/* Row 5: Ngày tạo, Cập nhật */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
      <div>Ngày tạo: {createdAt}</div>
      <div>Cập nhật lần cuối: {updatedAt}</div>
    </div>
  </div>
</Card>
```

---

## ⚠️ Vẫn còn một số lỗi TypeScript

### Lỗi hiện tại (cần fix):

1. **membersData type issue** (Line 248, 256):
```typescript
// Problem: membersData có type {}
membersData?.content && membersData.content.length > 0

// Fix cần làm: Thêm type cho useRepositoryMembers
interface MembersResponse {
  content: Array<{
    id: string;
    username: string;
    email: string;
    role: string;
  }>;
  totalElements: number;
  totalPages: number;
  // ... pagination fields
}
```

---

## 🎯 Phần còn lại cần làm

### 1. **Fix TypeScript errors** (P0 - Critical)
- [ ] Add proper type for `membersData`
- [ ] Fix members tab rendering

### 2. **Implement Permission System** (P1 - High)

#### Requirements:
- **Personal Repository**:
  - Mời thành viên bằng link (tương tự mời vào tổ chức)
  - Người upload có quyền view và delete file của mình
  
- **Organization Repository**:
  - Chỉ chọn người trong tổ chức
  - Admin tổ chức cấp quyền:
    - Upload file
    - Xem file
    - Xóa file
  - Người upload mặc định có quyền view và delete file của mình

#### Components cần tạo/update:
```typescript
// Update InviteRepositoryMemberModal
interface InviteRepositoryMemberModalProps {
  repositoryType: 'PERSONAL' | 'ORGANIZATION';
  repositoryId: string;
  organizationId?: string; // Nếu là org repo
}

// Personal repo: Generate invite link
// Organization repo: Select from org members

// Create RepositoryPermissionsManager component
interface Permission {
  userId: string;
  canUpload: boolean;
  canView: boolean;
  canDelete: boolean;
}
```

### 3. **Update Backend API** (P1 - High)

#### New endpoints needed:
```typescript
// Repository permissions
POST   /api/v1/repository-management-service/repositories/{id}/permissions
GET    /api/v1/repository-management-service/repositories/{id}/permissions
PUT    /api/v1/repository-management-service/repositories/{id}/permissions/{userId}
DELETE /api/v1/repository-management-service/repositories/{id}/permissions/{userId}

// Repository invite (for personal repos)
POST   /api/v1/repository-management-service/repositories/{id}/invite
GET    /api/v1/repository-management-service/repositories/{id}/invite/{token}
POST   /api/v1/repository-management-service/repositories/{id}/accept-invite
```

---

## 📊 Cấu trúc Permission

### Backend Entity:
```java
@Document(collection = "repositories")
public class RepositoryEntity {
    // Existing fields...
    
    @Field("permissions")
    private List<RepositoryPermission> permissions;
    
    public static class RepositoryPermission {
        private String userId;
        private String role; // OWNER, ADMIN, EDITOR, VIEWER
        private List<String> permissions; // UPLOAD, VIEW, DELETE
        private LocalDateTime grantedAt;
        private String grantedBy;
    }
}
```

### Frontend Interface:
```typescript
interface RepositoryPermission {
  userId: string;
  userName: string;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'VIEWER';
  permissions: {
    upload: boolean;
    view: boolean;
    delete: boolean;
  };
  grantedAt: string;
  grantedBy: string;
}
```

---

## 🚀 Implementation Plan

### Phase 1: Fix current errors ✅ (NOW)
1. Fix TypeScript types for membersData
2. Test tabs navigation
3. Test Overview tab display

### Phase 2: Backend Permission API (P1)
1. Add `permissions` field to RepositoryEntity
2. Create RepositoryPermissionController
3. Implement CRUD for permissions
4. Add permission check middleware

### Phase 3: Frontend Permission UI (P1)
1. Create RepositoryPermissionsManager component
2. Add permissions tab (optional) or in members tab
3. Update InviteRepositoryMemberModal:
   - Personal: Generate invite link
   - Organization: Select from org members
4. Add permission badges to members list

### Phase 4: File Upload Permission Check (P1)
1. Check user permission before allowing upload
2. Filter files based on view permission
3. Show/hide delete button based on permission

---

## ✅ Summary

**Phần 4 hoàn thành**:
- ✅ Overview tab với thông tin đầy đủ
- ✅ Loại bỏ Settings tab
- ✅ Disable Activity tab với tooltip
- ✅ Dùng CommonTabs từ UIComponents
- ✅ Hiển thị ownerName thay vì ownerUserId
- ✅ Loại bỏ header thừa

**Cần làm tiếp**:
- ⏳ Fix TypeScript errors (membersData type)
- ⏳ Implement permission system (Backend + Frontend)
- ⏳ Implement invite system (Personal vs Organization)

**Sẵn sàng test**: `http://localhost:3000/repositories/{id}`
