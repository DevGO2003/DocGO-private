# 🔴 P0 - CRITICAL TASKS

**Ưu tiên cao nhất** - Ảnh hưởng lớn đến functionality  
**Nguồn:** refactor-requirements.md, agent-task-part6-part7.md, prompt-unify-ui-components.md

---

## 1️⃣ Authentication Auto-Refresh Token

**File:** `frontend/webapp/src/shared/lib/api/apiClient.ts`  
**Nguồn:** agent-task-part6-part7.md (Line 339-433)

### Checklist
- [ ] Cải thiện detection của lỗi "Missing or invalid authorization header"
- [ ] Thêm check cho error message: `includes('missing')`, `includes('invalid authorization')`
- [ ] Thêm auto-retry logic trong response interceptor
- [ ] Set `originalRequest._retry = true` để tránh loop
- [ ] Gọi `handleUnauthorized()` để refresh token
- [ ] Retry request với token mới
- [ ] Update `enhancedApiClient.ts` tương tự (nếu có dùng)

### Code snippet
```typescript
const isAuthHeaderError = errorMessage.includes('missing') || 
                         errorMessage.includes('invalid authorization')

if ((isUnauthorized || isForbidden) && !originalRequest._retry) {
  originalRequest._retry = true
  const refreshSuccess = await this.handleUnauthorized()
  if (refreshSuccess) {
    originalRequest.headers.Authorization = `Bearer ${this.getAuthToken()}`
    return this.client(originalRequest)
  }
}
```

**Thời gian ước tính:** 2-3 giờ

---

## 2️⃣ Thống Nhất Tab UI - CommonTab

**Nguồn:** prompt-unify-ui-components.md (Line 11-57)  
**Mục tiêu:** Thay tất cả `<button>` tabs → `CommonTab` component

### A. RepositoryTabs.tsx
**File:** `frontend/webapp/src/features/repositories/views/components/RepositoryTabs.tsx`
- [ ] Import `Tabs`, `TabList`, `CommonTab` từ `@shared/components`
- [ ] Thay tất cả `<button>` → `<CommonTab>`
- [ ] Giữ nguyên functionality (activeTab, onTabChange, counts)

### B. OrganizationWorkspace.tsx
**File:** `frontend/webapp/src/features/organizations/views/pages/OrganizationWorkspace/OrganizationWorkspace.tsx`
- [ ] Line 234-252: Thay `<button>` tabs → `CommonTab`
- [ ] Giữ icon và label

### C. OrganizationDetail.tsx
**File:** `frontend/webapp/src/features/organizations/views/pages/OrganizationDetail/OrganizationDetail.tsx`
- [ ] Line 236-249: Thay `<button>` tabs → `CommonTab`
- [ ] Line 424, 436, 448: `<input type="checkbox">` → `Checkbox`
- [ ] Line 269, 273, 279, 286: `<label>` → `Label` (nếu có)

### D. RepositoryDetail.tsx
**File:** `frontend/webapp/src/features/repositories/views/pages/RepositoryDetail/RepositoryDetail.tsx`
- [ ] Line 256-295: Thay `<button>` tabs → `CommonTab`

### E. Settings.tsx
**File:** `frontend/webapp/src/features/settings/views/pages/Settings.tsx`
- [ ] Line 166-178: `<button>` tabs → `CommonTab`
- [ ] Line 373-383: `<input checkbox>` → `Checkbox`
- [ ] Line 403, 424, 444, 464: `<select>` → `Select`
- [ ] Line 301: `<button>` password → `Button`

### F. Profile.tsx
**File:** `frontend/webapp/src/features/profile/views/pages/Profile/Profile.tsx`
- [ ] Line 207, 223, 243, 261, 281, 297: `<label>` → `Label`

### G. UploadPage.tsx
**File:** `frontend/webapp/src/features/upload/views/pages/UploadPage.tsx`
- [ ] Line 207-212: `<button>` close modal → `Button`

### Pattern chuẩn
```tsx
<Tabs>
  <TabList>
    <CommonTab value={tabId} activeValue={activeTab} onSelect={setActiveTab}>
      <Icon className="w-4 h-4" />
      {label}
    </CommonTab>
  </TabList>
</Tabs>
```

**Thời gian ước tính:** 4-5 giờ (7 files)

---

## 3️⃣ Repository Detail Page - Major Changes

**File:** `frontend/webapp/src/features/repositories/views/pages/RepositoryDetail/RepositoryDetail.tsx`  
**Nguồn:** refactor-requirements.md (Line 568-876)

### A. Thêm Tab "Thông tin Repository"
- [ ] Import `Info` icon từ lucide-react
- [ ] Thêm tab "info" vào tabs list (tab đầu tiên)
- [ ] Set default `activeTab = 'info'`
- [ ] Tạo tab content hiển thị: description, owner, organization

### B. Xóa Tab Settings
- [ ] Xóa tab "settings" khỏi tabs array
- [ ] Xóa settings tab content (Lines 393-407)

### C. Xóa Duplicate Header
- [ ] Lines 126-174: Xóa Back button, Settings button, Repository title
- [ ] Lines 177-253: Xóa Repository Info Card
- [ ] Lý do: Đã có trong RepositoryLayout

### D. Disable Activity Tab
- [ ] Thêm `disabled={true}` cho Activity tab
- [ ] Thêm `title="Tạm thời chưa có"`
- [ ] Thêm `className="opacity-50 cursor-not-allowed"`

### E. Invite Member Modal
- [ ] Thêm state `showInviteModal`
- [ ] Thêm button "Mời thành viên" trong members tab
- [ ] Tạo `InviteRepositoryMemberModal.tsx` component
- [ ] Logic: Personal → link sharing, Org → chọn members
- [ ] Admin có thể cấp quyền (upload, view, delete)

**Thời gian ước tính:** 3-4 giờ

---

## 4️⃣ Organizations Workspace - Major Changes

**File:** `frontend/webapp/src/features/organizations/views/pages/OrganizationWorkspace/OrganizationWorkspace.tsx`  
**Nguồn:** agent-task-part6-part7.md (Line 8-336)

### A. Nút "Mở danh sách kho"
- [ ] Tab Contracts (Line 284): Thêm button navigate `/organizations/{id}/contracts/full-list`
- [ ] Tab Repositories (Line 396): Thêm button navigate `/organizations/{id}/repositories/full-list`

### B. Gộp Tab Hợp đồng + Chờ phê duyệt
- [ ] Line 45: Xóa `'pending-approvals'` từ `WorkspaceTab` type
- [ ] Line 102-109: Xóa tab object `pending-approvals`
- [ ] Line 377-393: Xóa tab content
- [ ] Cập nhật Tab Contracts:
  - [ ] Hiển thị TẤT CẢ hợp đồng
  - [ ] `PENDING_APPROVAL` lên trên (không giới hạn)
  - [ ] Thêm search input
  - [ ] Thêm filter button

### C. Di chuyển Stats vào Tab Báo cáo
- [ ] Lines 198-251: Xóa/comment Stats Cards ở đầu
- [ ] Tạo tab `'reports'` (nếu chưa có)
- [ ] Update type: `'reports' | 'contracts' | 'repositories' | 'members' | 'settings'`
- [ ] Thêm 6 stats cards:
  - [ ] Tổng số hợp đồng (existing)
  - [ ] Đang chờ (existing)
  - [ ] Đã duyệt (existing)
  - [ ] Đã từ chối (existing)
  - [ ] **Tổng số file** (MỚI - cần API)
  - [ ] **Tổng số repository** (MỚI - dùng `repositoriesData?.totalElements`)

### D. Thay đổi thứ tự tabs
- [ ] Đặt `'reports'` lên đầu (trước 'contracts')
- [ ] Order: reports → contracts → repositories → members → settings

### E. Giới hạn hiển thị gần đây
- [ ] Thêm state `showAllContracts`, `showAllRepositories`
- [ ] Hiển thị 10-20 items đầu tiên
- [ ] Thêm button "Mở danh sách kho" khi có nhiều hơn

**Thời gian ước tính:** 4-5 giờ

---

## ✅ Checklist Tổng

- [ ] **Task 1:** Authentication auto-refresh (2-3h)
- [ ] **Task 2:** Thống nhất Tab UI - 7 files (4-5h)
- [ ] **Task 3:** Repository Detail changes (3-4h)
- [ ] **Task 4:** Organizations Workspace changes (4-5h)

**Tổng thời gian ước tính:** 13-17 giờ (~2 ngày làm việc)

---

## 🎯 Khuyến nghị thực hiện

1. **Ngày 1:** Task 1 + Task 2 (6-8h)
2. **Ngày 2:** Task 3 + Task 4 (7-9h)

Hoặc chia nhỏ hơn:
- **Morning:** Authentication + 3 files Tab UI
- **Afternoon:** 4 files Tab UI còn lại
- **Next day morning:** Repository Detail
- **Next day afternoon:** Organizations Workspace
