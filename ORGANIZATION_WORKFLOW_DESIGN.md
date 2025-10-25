# ORGANIZATION WORKFLOW & FRONTEND DESIGN - DocGO

## MỤC TIÊU
Thiết kế hệ thống organization với 3 roles đơn giản (Owner/Manager/Member), workflow tự động dựa trên giá trị hợp đồng, và UI/UX thân thiện cho multi-organization support.

---

## PHẦN 1: LUỒNG LÀM VIỆC CHI TIẾT

### 1. ĐĂNG KÝ VÀ ĐĂNG NHẬP LẦN ĐẦU

**Bước 1: User mới đăng ký**
- User đăng ký tài khoản → Xác thực email → Đăng nhập
- Hệ thống kiểm tra: User có thuộc tổ chức nào không?

**Bước 2: Nếu chưa có tổ chức**
- Hiển thị màn hình welcome:
  - "Bạn chưa thuộc tổ chức nào"
  - Lựa chọn 1: Tạo tổ chức mới (Trở thành Owner)
  - Lựa chọn 2: Kiểm tra email xem có lời mời không

**Bước 3: Tạo tổ chức mới**
- Form nhập:
  - Tên tổ chức (bắt buộc)
  - Mã tổ chức (tùy chọn)
  - Mô tả, địa chỉ, email, số điện thoại
- Submit → Backend tự động:
  - Tạo Organization
  - Set user = Owner (ownerUserId)
  - Khởi tạo workflow mặc định 3 cấp
  - Khởi tạo default roles & permissions
  - Thêm user vào members đầu tiên

**Bước 4: Setup Wizard (tùy chọn)**
- Wizard 3 bước:
  - Bước 1: Mời thành viên (email + role selection)
  - Bước 2: Chỉ định Managers với permissions
  - Bước 3: Upload hợp đồng đầu tiên
- Có thể skip và vào dashboard ngay

---

### 2. CHUYỂN ĐỔI GIỮA CÁC TỔ CHỨC

**Multi-Organization Support**
- User có thể thuộc nhiều tổ chức với vai trò khác nhau
- Mỗi tổ chức độc lập: contracts, members, settings riêng

**Organization Selector**
- Header: Logo | [Tổ chức A ▼] | User Menu
- Dropdown hiển thị:
  - Công ty A (Owner) ← Active
  - Công ty B (Manager)
  - Công ty C (Member)
  - ─────────────────
  - + Tạo tổ chức mới

**Switching Flow**
1. User click chọn "Công ty B"
2. Frontend gọi: `POST /api/v1/users/me/switch-organization`
3. Backend update lastActiveOrg
4. Frontend reload dashboard với data của Công ty B
5. Update localStorage: activeOrgId

**Data Isolation**
- Dashboard chỉ hiển thị data của tổ chức active
- Contracts, members, settings đều theo context org active
- URL structure: `/org/{orgId}/dashboard`

---

### 3. QUẢN LÝ THÀNH VIÊN

**Vai trò có quyền:**
- Owner: Toàn quyền
- Manager có permission `member:invite`: Có quyền mời

**Flow mời thành viên:**

**Bước 1: Vào Members Management**
- Navigate: Settings → Members
- Hiển thị bảng danh sách:
  - Cột: Tên | Email | Vai trò | Quyền hạn | Actions
  - Nút: [+ Invite Member]

**Bước 2: Invite Member Form**
- Nhập email người cần mời
- Chọn vai trò:
  - ⭕ Member (Nhân viên cơ bản)
  - ⭕ Manager (Quản lý & phê duyệt)

**Bước 3: Nếu chọn Manager → Chọn Permissions**
- ☐ Phê duyệt pháp lý (`approve:legal`)
- ☐ Phê duyệt tài chính (`approve:finance`)
- ☐ Phê duyệt cấp cao (`approve:executive`)
- ☐ Mời thành viên (`member:invite`)
- ☐ Quản lý settings (`org:settings`)

**Bước 4: Gửi lời mời**
- Backend tạo Invitation:
  - email, organizationId, roleIds
  - token (UUID), expiresAt (7 days)
  - status = PENDING
- Gửi email với link: `/invitations/accept?token=xxx`

**Bước 5: Người được mời accept**
- Click link → Login (hoặc Register nếu chưa có account)
- Xác nhận chấp nhận
- Backend tạo OrganizationMembership:
  - userId, organizationId, role, permissions
  - status = ACTIVE

**Quản lý thành viên sau khi joined:**
- Owner có thể:
  - Thăng cấp Member → Manager
  - Hạ cấp Manager → Member
  - Thêm/bớt permissions của Manager
  - Remove member (trừ chính mình)
  - Transfer ownership

---

### 4. TẢI LÊN VÀ PHÊ DUYỆT HỢP ĐỒNG

**UPLOAD FLOW**

**Bước 1: Member upload file**
- Navigate: Contracts → [+ Upload New Contract]
- Chọn file PDF hoặc hình ảnh
- Upload → Backend nhận file

**Bước 2: OCR Processing**
- Backend gửi file đến Automation Service
- Automation xử lý OCR trích xuất:
  - Số hợp đồng, Tên hợp đồng
  - Bên A, Bên B
  - Giá trị hợp đồng
  - Ngày ký, Ngày hiệu lực, Ngày hết hạn
- Trả kết quả về Repository Service

**Bước 3: Review & Edit**
- Frontend hiển thị form với thông tin đã trích xuất
- Member review và sửa nếu cần
- Có thể thêm: Loại HĐ, Tags, Ghi chú
- Save as Draft (status = DRAFT)

**Bước 4: Submit for Approval**
- Member click [Submit for Approval]
- Status: DRAFT → PENDING_APPROVAL
- Backend đánh giá giá trị để chọn workflow

---

**WORKFLOW TỰ ĐỘNG THEO GIÁ TRỊ**

**Case 1: Hợp đồng < 100M VND**
- **Workflow: Basic Approval**
- Chỉ cần 1 Manager bất kỳ approve
- Notification → Tất cả Managers
- Manager nào approve trước thì OK
- Status: PENDING → APPROVED

**Case 2: Hợp đồng 100M - 1B VND**
- **Workflow: Advanced Approval (2 bước tuần tự)**

Bước 1: Phê duyệt pháp lý
- Notification → Managers có `approve:legal`
- Manager xem xét từ góc độ pháp lý
- Approve + Comment → Next step
- Timeout: 48 giờ

Bước 2: Phê duyệt tài chính
- Notification → Managers có `approve:finance`
- Manager xem xét từ góc độ tài chính
- Approve + Comment → APPROVED
- Timeout: 48 giờ

**Case 3: Hợp đồng >= 1B VND**
- **Workflow: Executive Approval (3 bước)**

Bước 1 & 2: Giống Case 2

Bước 3: Phê duyệt cấp điều hành
- Notification → Managers có `approve:executive`
- Giám đốc/CEO xem xét chiến lược
- Approve → APPROVED
- Timeout: 72 giờ

**XỬ LÝ REJECTION**
- Bất kỳ Manager nào Reject → Workflow dừng
- Status: PENDING → REJECTED
- Notification → Member (người tạo)
- Member có thể:
  - Xem lý do reject + comments
  - Chỉnh sửa hợp đồng
  - Submit lại (workflow restart từ đầu)

**TIMEOUT & ESCALATION**
- Mỗi step có timeout (48-72h)
- Quá timeout → Auto escalate
- Notification → Owner hoặc cấp cao hơn

---

### 5. KÝ ĐIỆN TỬ HỢP ĐỒNG

**Điều kiện:** Status = APPROVED

**Bước 1: Setup E-Signature**
- Owner/Manager vào Contract Detail
- Click [Setup E-Signature]
- Modal hiện ra:
  - Chọn người ký từ tổ chức
  - Thêm email người ký đối tác (nếu có)
  - Thứ tự ký (tuần tự hoặc song song)

**Bước 2: Gửi yêu cầu ký**
- Mỗi người nhận email với link + token
- Link dẫn đến: `/contracts/{id}/sign?token=xxx`

**Bước 3: Thực hiện ký**
- Người ký click link → Xem hợp đồng
- Đặt chữ ký điện tử vào vị trí quy định
- Xác nhận ký → Lưu chữ ký

**Bước 4: Hoàn tất**
- Khi tất cả đã ký xong
- Status: APPROVED → SIGNED
- Generate PDF final với tất cả chữ ký
- Lưu trữ vĩnh viễn
- Notification → Tất cả bên liên quan

---

### 6. QUẢN LÝ WORKFLOW & SETTINGS

**Owner vào Settings → Workflow**

**Section 1: Quy trình cơ bản (< 100M)**
- Số lượng Manager cần approve: [1 ▼] hoặc [2 ▼]
- Timeout: [24] giờ

**Section 2: Quy trình nâng cao (100M - 1B)**
- ☑ Yêu cầu phê duyệt pháp lý
- ☑ Yêu cầu phê duyệt tài chính
- Timeout mỗi bước: [48] giờ
- ☑ Auto escalate nếu quá timeout

**Section 3: Phê duyệt cấp cao (>= 1B)**
- ☑ Yêu cầu phê duyệt cấp điều hành
- Timeout: [72] giờ
- Người phê duyệt: [Chọn specific users]

**Các Settings khác:**
- **General:** Logo, tên, mô tả, địa chỉ
- **Billing:** Subscription, payment methods
- **Integrations:** API keys, webhooks

---

## PHẦN 2: CẤU TRÚC FRONTEND

### 1. PAGE STRUCTURE

```
├── /                              Landing page
├── /login                         Đăng nhập
├── /register                      Đăng ký
├── /dashboard                     Dashboard (redirect to active org)
├── /organizations                 Danh sách tổ chức của user
├── /organizations/create          Tạo tổ chức mới
├── /organizations/:orgId
│   ├── /dashboard                 Dashboard của org
│   ├── /settings
│   │   ├── /general              Thông tin chung
│   │   ├── /members              Quản lý thành viên
│   │   ├── /workflow             Cấu hình workflow
│   │   └── /billing              Thanh toán
│   ├── /contracts                Danh sách hợp đồng
│   ├── /contracts/upload         Upload hợp đồng mới
│   ├── /contracts/:contractId    Chi tiết hợp đồng
│   ├── /approvals                Hợp đồng chờ duyệt (Manager)
│   └── /reports                  Thống kê báo cáo
```

### 2. COMPONENT ARCHITECTURE

**Core Components:**
- `OrganizationSelector` - Dropdown switch organizations
- `RoleBadge` - Badge hiển thị Owner/Manager/Member
- `PermissionGuard` - HOC kiểm tra permissions

**Member Management:**
- `MemberTable` - Bảng danh sách members
- `InviteMemberModal` - Form mời thành viên
- `PermissionCheckboxList` - Chọn permissions cho Manager

**Contract Management:**
- `ContractCard` / `ContractListItem` - Hiển thị hợp đồng
- `ContractStatusBadge` - Badge trạng thái màu sắc
- `ContractUploadWizard` - Multi-step upload form
- `ApprovalTimeline` - Timeline các bước phê duyệt
- `ApprovalActions` - Nút Approve/Reject cho Manager

**Workflow:**
- `WorkflowConfig` - Cấu hình 3 cấp workflow
- `WorkflowStepCard` - Card hiển thị từng step

### 3. HOOKS

```typescript
// Authentication & User
useAuth()                    // User info, login/logout
useOrganizations()           // Danh sách orgs của user
useActiveOrganization()      // Org đang active

// Permissions
usePermission(permission)    // Check quyền trong org active
useRole()                    // Role của user trong org active

// Organization Management
useOrganizationMembers()     // CRUD members
useOrganizationSettings()    // Get/update settings
useWorkflowConfig()          // Get/update workflow

// Contract Management
useContracts(filters)        // Fetch contracts với filters
useContractDetail(id)        // Chi tiết hợp đồng
useContractUpload()          // Upload hợp đồng
useContractApproval()        // Approve/reject
```

### 4. SERVICES

```typescript
// authService.ts
- login(email, password)
- register(userData)
- getCurrentUser()
- switchOrganization(orgId)

// organizationService.ts
- getMyOrganizations()
- createOrganization(data)
- getOrganization(id)
- updateOrganization(id, data)
- inviteMember(orgId, data)
- updateMember(orgId, userId, data)
- removeMember(orgId, userId)

// contractService.ts
- uploadContract(orgId, file)
- getContracts(orgId, filters)
- getContract(id)
- updateContract(id, data)
- submitForApproval(id)
- approveContract(id, comment)
- rejectContract(id, reason)

// workflowService.ts
- getWorkflowConfig(orgId)
- updateWorkflowConfig(orgId, config)
```

### 5. STATE MANAGEMENT

**Global State (Context):**
```typescript
AuthContext {
  user: User | null
  organizations: Organization[]
  activeOrganization: Organization | null
  switchOrganization: (id) => Promise<void>
}

OrganizationContext {
  members: Member[]
  workflow: WorkflowConfig
  settings: OrgSettings
  refreshMembers: () => Promise<void>
  updateWorkflow: (config) => Promise<void>
}
```

**Local State:**
- Contracts list: Managed by `useContracts` hook
- Contract detail: Managed by `useContractDetail` hook
- Form states: Local component state

### 6. ROUTING & GUARDS

**Route Protection:**
```typescript
// Yêu cầu đăng nhập
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Yêu cầu thuộc organization
<OrganizationRoute orgId={orgId}>
  <OrgDashboard />
</OrganizationRoute>

// Yêu cầu permission cụ thể
<PermissionRoute permission="org:settings">
  <Settings />
</PermissionRoute>
```

### 7. UI/UX PATTERNS

**Loading States:**
- Skeleton screens cho pages
- Spinner cho buttons/actions
- Progress bar cho uploads

**Error Handling:**
- Toast notifications cho errors
- Inline errors cho form validation
- Error boundaries cho component crashes

**Responsive:**
- Mobile: Stack layout, bottom navigation
- Tablet: Sidebar collapsible
- Desktop: Full sidebar, multi-column

**Themes:**
- Light mode / Dark mode
- Consistent colors, typography, spacing
- Tailwind CSS + shadcn/ui components

---

## PHẦN 3: DATA MODELS

### Organization
```typescript
{
  id: string
  name: string
  code?: string
  description?: string
  ownerUserId: string
  adminUserIds: string[]
  memberCount: number
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  settings: {
    allowMemberInvite: boolean
    requireAdminApproval: boolean
  }
  createdAt: DateTime
  updatedAt: DateTime
}
```

### OrganizationMembership
```typescript
{
  id: string
  organizationId: string
  userId: string
  role: 'owner' | 'manager' | 'member'
  permissions: string[]  // ['approve:legal', 'approve:finance', ...]
  status: 'PENDING' | 'ACTIVE' | 'INACTIVE'
  invitedBy?: string
  joinedAt: DateTime
}
```

### Contract
```typescript
{
  id: string
  organizationId: string
  contractNumber: string
  title: string
  value: number
  partyA: string
  partyB: string
  signDate: Date
  effectiveDate: Date
  expiryDate: Date
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SIGNED'
  createdBy: string
  currentApprovalStep?: number
  approvalHistory: ApprovalRecord[]
}
```

### WorkflowConfig
```typescript
{
  organizationId: string
  basicApproval: {
    enabled: boolean
    requiredApprovers: 1 | 2
    maxValue: 100_000_000
  }
  advancedApproval: {
    enabled: boolean
    steps: [
      { name: 'Legal', permission: 'approve:legal', timeout: 48 },
      { name: 'Finance', permission: 'approve:finance', timeout: 48 }
    ]
    minValue: 100_000_000
    maxValue: 1_000_000_000
  }
  executiveApproval: {
    enabled: boolean
    permission: 'approve:executive'
    minValue: 1_000_000_000
    timeout: 72
  }
}
```

---

## TÓM TẮT

**3 Roles đơn giản:**
- Owner: Toàn quyền
- Manager: Phê duyệt + quyền tùy chỉnh
- Member: Upload & quản lý HĐ của mình

**Workflow tự động:**
- < 100M: 1 Manager approve
- 100M - 1B: Legal + Finance (2 bước)
- >= 1B: Legal + Finance + Executive (3 bước)

**Multi-org support:**
- User thuộc nhiều org với vai trò khác nhau
- Organization Selector để switch
- Data isolation theo org active

**Frontend architecture:**
- Component-based với React/Next.js
- Custom hooks cho business logic
- Context API cho global state
- Protected routes với permission checks
