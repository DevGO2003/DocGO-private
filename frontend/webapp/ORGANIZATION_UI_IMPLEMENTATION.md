# Organization & Workspace UI Implementation

## 📋 Tóm tắt

Đã thiết kế và triển khai UI cho Organizations với Workspace theo workflow design trong `ORGANIZATION_WORKFLOW_DESIGN.md`. Workspace có giao diện thống nhất cho tất cả roles (Owner/Manager/Member), chỉ khác quyền truy cập các features.

## ✅ Đã hoàn thành

### 1. **Organization Types & Models**
- ✅ Cập nhật `MemberRole` enum: `OWNER`, `MANAGER`, `MEMBER`
- ✅ Thêm `ManagerPermission` type với các quyền:
  - `approve:legal` - Phê duyệt pháp lý
  - `approve:finance` - Phê duyệt tài chính
  - `approve:executive` - Phê duyệt cấp điều hành
  - `member:invite` - Mời thành viên
  - `org:settings` - Quản lý settings
- ✅ Thêm `OrganizationMembership` interface
- ✅ Cập nhật `Organization` với `userRole` và `userPermissions`

**File:** `frontend/webapp/src/features/organization/models/types/organization.types.ts`

---

### 2. **OrganizationList Page**
- ✅ Hiển thị role badges trên mỗi organization card
- ✅ Badges với icons và màu sắc phân biệt:
  - 🟣 **Owner** (Purple) - Crown icon
  - 🔵 **Manager** (Blue) - UserCog icon
  - 🟢 **Member** (Green) - Shield icon
- ✅ Click vào organization → Navigate đến Workspace
- ✅ Giữ nguyên các features: Search, Pagination, Empty state

**File:** `frontend/webapp/src/features/organization/views/pages/OrganizationList/OrganizationList.tsx`

**Route:** `http://localhost:3000/organizations`

---

### 3. **OrganizationWorkspace Page** 🆕
Workspace với giao diện thống nhất cho tất cả roles.

#### **Header Section:**
- Organization info với logo và description
- Button "Upload Contract" (nổi bật)
- Button "Back to Organizations"

#### **Stats Cards (4 cards):**
- 📄 **Total Contracts** - Tổng số hợp đồng
- ⏰ **Pending** - Đang chờ duyệt
- ✅ **Approved** - Đã duyệt
- ❌ **Rejected** - Đã từ chối

#### **Tabs Navigation:**
1. **Contracts** - Danh sách tất cả hợp đồng
2. **Pending Approvals** - Hợp đồng chờ duyệt (Manager/Owner)
3. **Reports** - Báo cáo & thống kê
4. **Members** - Quản lý thành viên
5. **Settings** - Cấu hình tổ chức

**Đặc điểm:**
- ✅ UI giống nhau cho tất cả roles
- ✅ Permissions sẽ ẩn/hiện các buttons và features
- ✅ Responsive design với Tailwind CSS
- ✅ Smooth animations với Framer Motion

**File:** `frontend/webapp/src/features/organization/views/pages/OrganizationWorkspace/OrganizationWorkspace.tsx`

**Route:** `http://localhost:3000/organizations/:id/workspace`

---

### 4. **OrganizationSelector Component** 🆕
Dropdown component để switch giữa các organizations.

#### **Features:**
- ✅ Hiển thị organization hiện tại với logo và role badge
- ✅ Dropdown list tất cả organizations user thuộc về
- ✅ Hiển thị role của user trong mỗi org
- ✅ Active organization được highlight với checkmark
- ✅ Button "Create New Organization" ở cuối dropdown
- ✅ Click outside để đóng dropdown

#### **Usage:**
```tsx
import { OrganizationSelector } from '@features/organization';

<OrganizationSelector
  currentOrganizationId={currentOrgId}
  onOrganizationChange={(orgId) => handleSwitch(orgId)}
/>
```

**File:** `frontend/webapp/src/features/organization/views/components/OrganizationSelector/OrganizationSelector.tsx`

---

### 5. **PermissionGuard Component** 🆕
Component để kiểm soát quyền truy cập dựa trên role và permissions.

#### **Features:**
- ✅ Role-based access control (OWNER > MANAGER > MEMBER)
- ✅ Permission-based access control
- ✅ Owner luôn có toàn quyền
- ✅ Customizable fallback UI
- ✅ Default "Access Denied" screen

#### **Usage:**
```tsx
import { PermissionGuard } from '@features/organization';

// Check role
<PermissionGuard
  requiredRole={MemberRole.MANAGER}
  currentRole={currentRole}
  currentPermissions={permissions}
>
  <ManagerOnlyFeature />
</PermissionGuard>

// Check permission
<PermissionGuard
  requiredPermission="member:invite"
  currentRole={currentRole}
  currentPermissions={permissions}
>
  <InviteMemberButton />
</PermissionGuard>
```

**File:** `frontend/webapp/src/features/organization/views/components/PermissionGuard/PermissionGuard.tsx`

---

### 6. **Permission Hooks** 🆕
Custom hooks để kiểm tra permissions trong components.

#### **Available Hooks:**

**`usePermission`** - Generic permission checker
```tsx
const { hasPermission, userRole, userPermissions } = usePermission({
  organization,
  requiredPermission: 'approve:legal',
  requiredRole: MemberRole.MANAGER,
});
```

**`useIsOwner`** - Check if user is owner
```tsx
const isOwner = useIsOwner(organization);
```

**`useIsManager`** - Check if user is manager
```tsx
const isManager = useIsManager(organization);
```

**`useCanApprove`** - Check if user can approve contracts
```tsx
const canApprove = useCanApprove(organization);
```

**`useCanManageMembers`** - Check member management permission
```tsx
const canManageMembers = useCanManageMembers(organization);
```

**`useCanManageSettings`** - Check settings management permission
```tsx
const canManageSettings = useCanManageSettings(organization);
```

**File:** `frontend/webapp/src/features/organization/hooks/usePermission.ts`

---

### 7. **Routes & Constants**
- ✅ Thêm `ORGANIZATION_WORKSPACE_PATH = '/organizations/:id/workspace'`
- ✅ Cập nhật routing trong `App.tsx`
- ✅ Protected routes với authentication

**Files:**
- `frontend/webapp/src/constants/routes.constants.ts`
- `frontend/webapp/src/App.tsx`

---

## 🎨 UI/UX Design Principles

### **Unified Interface**
- Tất cả roles nhìn thấy cùng một workspace layout
- Chỉ khác ở việc enable/disable các buttons và features
- Consistent navigation và structure

### **Role-Based UI**
- **Owner**: Full access, tất cả buttons enabled
- **Manager**: Tùy thuộc permissions được assign
- **Member**: Chỉ upload và xem contracts của mình

### **Color Coding**
- 🟣 **Purple** - Owner role
- 🔵 **Blue** - Manager role
- 🟢 **Green** - Member role
- 🟡 **Yellow** - Pending status
- 🔴 **Red** - Rejected/Error

### **Responsive Design**
- Mobile-first approach
- Tailwind CSS utilities
- Smooth transitions với Framer Motion

---

## 📂 File Structure

```
frontend/webapp/src/features/organization/
├── models/
│   └── types/
│       └── organization.types.ts          ✅ Updated
├── hooks/
│   ├── index.ts                           🆕 Created
│   └── usePermission.ts                   🆕 Created
├── views/
│   ├── components/
│   │   ├── index.ts                       🆕 Created
│   │   ├── OrganizationSelector/         🆕 Created
│   │   │   ├── index.ts
│   │   │   └── OrganizationSelector.tsx
│   │   └── PermissionGuard/               🆕 Created
│   │       ├── index.ts
│   │       └── PermissionGuard.tsx
│   └── pages/
│       ├── OrganizationList/              ✅ Updated
│       │   └── OrganizationList.tsx
│       ├── OrganizationDetail/            ⚠️ Existing (not changed)
│       │   └── OrganizationDetail.tsx
│       └── OrganizationWorkspace/         🆕 Created
│           ├── index.ts
│           └── OrganizationWorkspace.tsx
└── index.ts                               ✅ Updated
```

---

## 🚀 How to Use

### **1. View Organizations**
```
http://localhost:3000/organizations
```
- Hiển thị tất cả organizations user thuộc về
- Mỗi card hiển thị role badge
- Click để vào workspace

### **2. Enter Workspace**
```
http://localhost:3000/organizations/{orgId}/workspace
```
- Workspace với tabs: Contracts, Approvals, Reports, Members, Settings
- UI thống nhất cho tất cả roles
- Permissions control feature access

### **3. Switch Organizations**
- Sử dụng `OrganizationSelector` component trong header
- Click dropdown → chọn org khác
- Auto navigate đến workspace mới

---

## 🔒 Permission System

### **3 Roles:**
1. **Owner** - Toàn quyền, không cần permissions
2. **Manager** - Có quyền hạn tùy chỉnh
3. **Member** - Quyền cơ bản

### **5 Manager Permissions:**
1. `approve:legal` - Phê duyệt pháp lý
2. `approve:finance` - Phê duyệt tài chính
3. `approve:executive` - Phê duyệt cấp cao
4. `member:invite` - Mời thành viên mới
5. `org:settings` - Quản lý settings

---

## 📝 Next Steps

### **Cần triển khai tiếp:**

1. **Create Organization Modal**
   - Form tạo organization mới
   - Setup wizard (optional)

2. **Contracts Management**
   - Upload contract flow
   - Contract list với filters
   - Contract detail với workflow timeline

3. **Approval Workflow**
   - Pending approvals list cho Manager
   - Approve/Reject UI
   - Comments và history

4. **Members Management**
   - Invite member form
   - Permission assignment UI
   - Member list với actions

5. **Settings Management**
   - Organization settings
   - Workflow configuration
   - Billing & subscription

6. **Reports & Analytics**
   - Charts và statistics
   - Export data
   - Activity logs

---

## 🐛 Known Issues

### **TypeScript Errors** (sẽ tự động biến mất khi restart)
- `ORGANIZATION_WORKSPACE_PATH` chưa được TypeScript nhận ra
- Cần restart dev server: `Ctrl+C` → `npm run dev`

---

## ✨ Summary

Đã hoàn thành thiết kế UI cơ bản cho Organization & Workspace system:

✅ **Organization Types** - Đầy đủ role và permission types
✅ **OrganizationList** - Với role badges và workspace navigation  
✅ **OrganizationWorkspace** - Unified UI cho tất cả roles
✅ **OrganizationSelector** - Switch giữa organizations
✅ **PermissionGuard** - Component để control access
✅ **Permission Hooks** - Utilities để check permissions
✅ **Routes & Constants** - Đầy đủ routing setup

**Workspace URL:** `http://localhost:3000/organizations/:id/workspace`

Frontend đã sẵn sàng để integrate với backend APIs! 🚀
