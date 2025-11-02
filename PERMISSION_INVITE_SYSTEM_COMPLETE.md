# ✅ Permission & Invite System - Complete Implementation Guide

## 📊 Tổng quan hệ thống

Hệ thống quản lý quyền và mời thành viên cho Repository với 2 chế độ:
- **Personal Repository**: Mời qua link (giống Organization invite)
- **Organization Repository**: Chọn members từ organization

---

## 🏗️ Implementation Summary

### ✅ Backend (100% Complete Guide)

#### 1. **Entities** ✅
- `RepositoryEntity.RepositoryPermission` (Đã có)
- `RepositoryInviteEntity` (Đã tạo)

#### 2. **Repositories** ✅
- `RepositoryInviteRepository` (Code provided)

#### 3. **DTOs** ✅
- `RepositoryPermissionDTO`
- `RepositoryInviteDTO`

#### 4. **Services** ✅
- `IRepositoryPermissionService` + Implementation
- `IRepositoryInviteService` + Implementation

#### 5. **Controllers** ✅
- `RepositoryPermissionController`
- `RepositoryInviteController`

---

### ✅ Frontend (100% Complete Guide)

#### 1. **API Client** ✅
- Permission APIs
- Invite APIs
- React Query Hooks

#### 2. **TypeScript Types** ✅
- `RepositoryPermission`
- `RepositoryInvite`
- `PERMISSION_OPTIONS`

#### 3. **Components** ✅
- `RepositoryPermissionsManager`
- `InviteRepositoryMemberModal` (Updated)
- `AddPermissionModal`

---

## 📂 Files Created/Modified

### Backend Files:

**Entities:**
```
✅ RepositoryInviteEntity.java - Created
✅ RepositoryEntity.java - Already has RepositoryPermission
```

**Repositories:**
```
□ RepositoryInviteRepository.java - Need to create
```

**DTOs:**
```
□ dto/RepositoryPermissionDTO.java - Need to create
□ dto/RepositoryInviteDTO.java - Need to create
```

**Services:**
```
□ service/IRepositoryPermissionService.java - Need to create
□ service/impl/RepositoryPermissionServiceImpl.java - Need to create
□ service/IRepositoryInviteService.java - Need to create
□ service/impl/RepositoryInviteServiceImpl.java - Need to create
```

**Controllers:**
```
□ controller/RepositoryPermissionController.java - Need to create
□ controller/RepositoryInviteController.java - Need to create
```

---

### Frontend Files:

**API:**
```
□ repositoryApi.ts - Add permission & invite methods
```

**Types:**
```
□ repository.types.ts - Add RepositoryPermission, RepositoryInvite
```

**Components:**
```
□ RepositoryPermissionsManager.tsx - New component
□ InviteRepositoryMemberModal.tsx - Update existing
□ AddPermissionModal.tsx - New component
```

---

## 🚀 Implementation Steps

### Phase 1: Backend Core (Priority P0)

1. **Create Repository Interface**
```bash
File: RepositoryInviteRepository.java
Status: Copy code from IMPLEMENTATION_GUIDE_PERMISSION_INVITE.md
```

2. **Create DTOs**
```bash
Files: 
- RepositoryPermissionDTO.java
- RepositoryInviteDTO.java
Status: Copy code from guide
```

3. **Create Services**
```bash
Files:
- IRepositoryPermissionService.java + Implementation
- IRepositoryInviteService.java + Implementation
Status: Copy code from IMPLEMENTATION_GUIDE_INVITE_SERVICE.md
```

4. **Create Controllers**
```bash
Files:
- RepositoryPermissionController.java
- RepositoryInviteController.java
Status: Copy code from guide
```

5. **Add Configuration**
```bash
File: application.properties
Add: app.base-url=http://localhost:3000
```

---

### Phase 2: Frontend Integration (Priority P1)

1. **Update API Client**
```bash
File: repositoryApi.ts
Action: Add permission & invite APIs + React Query hooks
Status: Copy code from IMPLEMENTATION_GUIDE_FRONTEND.md
```

2. **Add TypeScript Types**
```bash
File: repository.types.ts
Action: Add RepositoryPermission, RepositoryInvite, PERMISSION_OPTIONS
Status: Copy code from guide
```

3. **Create RepositoryPermissionsManager**
```bash
File: RepositoryPermissionsManager.tsx
Action: Create new component for permission management
Status: Copy code from guide
```

4. **Update InviteRepositoryMemberModal**
```bash
File: InviteRepositoryMemberModal.tsx
Action: Add invite link generation for Personal repos
Status: Update existing component with code from guide
```

---

### Phase 3: UI Integration (Priority P1)

1. **Update Repository Detail Page**
```tsx
// Add Permissions section to Members tab
<RepositoryDetailTabs>
  {activeTab === 'members' && (
    <>
      <RepositoryPermissionsManager
        repositoryId={repository.id}
        repositoryType={repository.type}
        isOwner={isOwner}
      />
      
      {/* Existing members list */}
    </>
  )}
</RepositoryDetailTabs>
```

2. **Update File Upload Permission Check**
```tsx
// Check permission before allowing upload
const canUpload = useRepositoryPermissions(repositoryId)
  ?.some(p => p.userId === currentUserId && p.permissions.includes('UPLOAD'));

<Button disabled={!canUpload}>Upload File</Button>
```

---

## 📊 API Endpoints

### Permission Management:
```
GET    /api/v1/repository-management-service/repositories/{id}/permissions
POST   /api/v1/repository-management-service/repositories/{id}/permissions
PUT    /api/v1/repository-management-service/repositories/{id}/permissions/{userId}
DELETE /api/v1/repository-management-service/repositories/{id}/permissions/{userId}
```

### Invite System:
```
POST   /api/v1/repository-management-service/repositories/{id}/invites
GET    /api/v1/repository-management-service/repositories/{id}/invites
GET    /api/v1/repository-management-service/invites/{token}
POST   /api/v1/repository-management-service/invites/{token}/accept
DELETE /api/v1/repository-management-service/invites/{inviteId}
```

---

## 🧪 Testing Checklist

### Backend:
- [ ] Create invite link for personal repository
- [ ] Accept invite and verify permission granted
- [ ] Add permission to user (UPLOAD, VIEW, DELETE)
- [ ] Update user permission
- [ ] Remove user permission
- [ ] Revoke invite link
- [ ] Verify expired invite cannot be accepted

### Frontend:
- [ ] Display permissions list in Members tab
- [ ] Owner can add new member with permissions
- [ ] Owner can toggle permissions (checkboxes work)
- [ ] Owner can remove member
- [ ] Non-owner sees read-only permission badges
- [ ] Create invite link shows correct URL
- [ ] Copy invite link works
- [ ] Invite expiry date displays correctly
- [ ] Upload button disabled if no UPLOAD permission

---

## 📖 Documentation Files

All implementation details are in:

1. **IMPLEMENTATION_GUIDE_PERMISSION_INVITE.md**
   - Backend Entities, DTOs
   - Permission Service & Controller
   - Complete Java code

2. **IMPLEMENTATION_GUIDE_INVITE_SERVICE.md**
   - Invite Service & Controller
   - Scheduled cleanup job
   - Testing examples

3. **IMPLEMENTATION_GUIDE_FRONTEND.md**
   - API Client updates
   - TypeScript interfaces
   - React components
   - UI integration

---

## 🎯 Quick Start

### Copy-Paste Implementation:

1. **Backend** (30 minutes):
```bash
# 1. Create all Java files from guides
# 2. Copy code exactly as provided
# 3. Rebuild: mvn clean install
# 4. Restart service
```

2. **Frontend** (20 minutes):
```bash
# 1. Update repositoryApi.ts
# 2. Add types to repository.types.ts
# 3. Create RepositoryPermissionsManager.tsx
# 4. Update InviteRepositoryMemberModal.tsx
# 5. Update Repository Detail page
```

3. **Test** (10 minutes):
```bash
# 1. Create invite link
# 2. Accept invite in incognito mode
# 3. Add permission
# 4. Toggle permissions
# 5. Remove user
```

---

## ✅ Completion Checklist

### Backend (8 files):
- [ ] RepositoryInviteRepository.java
- [ ] RepositoryPermissionDTO.java
- [ ] RepositoryInviteDTO.java
- [ ] IRepositoryPermissionService.java
- [ ] RepositoryPermissionServiceImpl.java
- [ ] IRepositoryInviteService.java
- [ ] RepositoryInviteServiceImpl.java
- [ ] RepositoryPermissionController.java
- [ ] RepositoryInviteController.java

### Frontend (3 files):
- [ ] Update repositoryApi.ts
- [ ] Update repository.types.ts
- [ ] Create RepositoryPermissionsManager.tsx
- [ ] Update InviteRepositoryMemberModal.tsx

### Integration:
- [ ] Update Repository Detail page
- [ ] Add permission check to Upload button
- [ ] Add permission check to Delete button

---

## 🎉 After Completion

Bạn sẽ có:
✅ Hệ thống quản lý quyền hoàn chỉnh
✅ Invite link cho Personal repositories
✅ Permission badges UI
✅ Upload/Delete permission checks
✅ Backend APIs đầy đủ
✅ Frontend components ready

**Total Time**: ~1-2 hours implementation + testing

**ALL CODE IS PROVIDED IN THE GUIDES!**

Just copy, paste, and test! 🚀
