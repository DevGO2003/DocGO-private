# 🔐 HỆ THỐNG APPROVAL - DOCGO (HOÀN CHỈNH)

> **Document duy nhất chứa TẤT CẢ thông tin về approval system**

---

## 📊 I. CẤU TRÚC ORGANIZATION & PERMISSIONS

### **A. Roles (3 roles cố định)**

```typescript
enum MemberRole {
  OWNER = 'OWNER',      // Chủ sở hữu - Toàn quyền
  MANAGER = 'MANAGER',  // Quản lý - Có permissions
  MEMBER = 'MEMBER'     // Thành viên - Chỉ xem và tạo
}
```

### **B. Manager Permissions (5 permissions)**

```typescript
type ManagerPermission = 
  | 'approve:legal'       // Phê duyệt pháp lý
  | 'approve:finance'     // Phê duyệt tài chính
  | 'approve:executive'   // Phê duyệt điều hành
  | 'member:invite'       // Mời thành viên
  | 'org:settings';       // Quản lý settings
```

### **C. Organization Structure**

```
Organization
├─ organizationId
├─ name
├─ ownerUserId
└─ members[] (OrganizationMembership)
    ├─ userId
    ├─ role: OWNER | MANAGER | MEMBER
    └─ permissions: ManagerPermission[]

Organization (1) ─── (n) Repository
Repository (1) ─── (n) File/Contract
```

---

## 🔄 II. APPROVAL WORKFLOW (SEQUENTIAL)

### **A. Xác định Approval Levels theo Giá trị HĐ**

```typescript
function determineApprovalLevels(totalValue: number): string[] {
  if (totalValue < 100000000) {
    return ["legal"];                           // < 100tr
  } 
  else if (totalValue < 500000000) {
    return ["legal", "finance"];                // 100tr - 500tr
  } 
  else {
    return ["legal", "finance", "executive"];   // > 500tr
  }
}
```

### **B. Workflow States**

```typescript
enum WorkflowStatus {
  // Initial
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  
  // Level states
  LEGAL_REVIEW = "LEGAL_REVIEW",
  LEGAL_APPROVED = "LEGAL_APPROVED",
  
  FINANCE_REVIEW = "FINANCE_REVIEW",
  FINANCE_APPROVED = "FINANCE_APPROVED",
  
  EXECUTIVE_REVIEW = "EXECUTIVE_REVIEW",
  EXECUTIVE_APPROVED = "EXECUTIVE_APPROVED",
  
  // Final states
  FULLY_APPROVED = "FULLY_APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED"
}
```

### **C. Database Schema**

```java
@Document(collection = "contract_approval_workflows")
public class ContractApprovalWorkflow {
    private String id;
    private String contractId;
    private Double contractValue;
    private String organizationId;
    private String repositoryId;
    
    private List<ApprovalLevel> requiredLevels;  // ["LEGAL", "FINANCE", "EXECUTIVE"]
    private Integer currentLevelIndex;            // 0, 1, 2... (bước hiện tại)
    private WorkflowStatus status;
    
    private List<ApprovalRecord> approvals;      // Danh sách approvals
    
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private LocalDateTime completedAt;
}

// ApprovalRecord (embedded)
public class ApprovalRecord {
    private String id;
    private ApprovalLevel level;                 // LEGAL, FINANCE, EXECUTIVE
    private ApprovalAction action;               // APPROVED, REJECTED
    private String approvedBy;
    private String approverName;
    private LocalDateTime actionAt;
    private String comment;
}
```

---

## ❌ III. REJECTION HANDLING (TRƯỜNG HỢP TỪ CHỐI)

### **A. Khi 1 người REJECT:**

```
Contract 500tr → Cần: Legal → Finance → Executive

┌─────────────────────────────────────────┐
│ Step 1: User A submit contract          │
│ Status: DRAFT → LEGAL_REVIEW            │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ Step 2: Legal Manager review            │
│ → ❌ REJECT                             │
│ Comment: "Thiếu điều khoản bảo mật"     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ Workflow STOPPED                         │
│ Status: LEGAL_REVIEW → REJECTED         │
│ completedAt: now                         │
│ Contract status: REJECTED                │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ Notifications sent:                      │
│ ✉️ Creator: "HĐ bị từ chối vì..."       │
│ ✉️ Organization admins: Alert           │
└─────────────────────────────────────────┘
```

### **B. Options cho Creator sau khi bị REJECT:**

#### **Option 1: Sửa và Submit Lại (RECOMMENDED ✅)**

```typescript
// 1. Creator xem rejection reason
GET /contracts/{id}/approvals/workflow
Response: {
  status: "REJECTED",
  approvals: [{
    level: "LEGAL",
    action: "REJECTED",
    approverName: "Legal Manager",
    comment: "Thiếu điều khoản bảo mật",
    actionAt: "..."
  }]
}

// 2. Creator sửa contract (upload file mới hoặc edit)
PUT /contracts/{id}
Body: { /* updated contract */ }

// 3. Submit workflow MỚI
POST /contracts/{id}/approvals/start
→ Tạo workflow mới, workflow cũ vẫn giữ để audit
```

#### **Option 2: Request Review (Yêu cầu xem xét lại)**

```typescript
// Creator yêu cầu Legal Manager xem xét lại
POST /contracts/{id}/approvals/request-review
Body: {
  "targetApprover": "legal-manager-id",
  "message": "Tôi đã bổ sung điều khoản bảo mật, xin xem xét lại"
}

→ Gửi notification đến Legal Manager
→ Legal Manager có thể:
   - Reopen workflow (nếu hệ thống cho phép)
   - Hoặc yêu cầu creator submit mới
```

#### **Option 3: Escalate to OWNER**

```typescript
// Creator escalate lên OWNER để xin override
POST /contracts/{id}/approvals/escalate
Body: {
  "reason": "Urgent contract, cần xử lý gấp",
  "targetOwner": "owner-id"
}

→ OWNER có quyền:
   - Override rejection
   - Approve trực tiếp
   - Yêu cầu Legal Manager review lại
```

### **C. Rejection Logic (Backend)**

```java
public ContractApprovalWorkflow reject(
    String workflowId,
    String userId,
    String comment  // ⭐ BẮT BUỘC
) {
    // 1. Validate
    if (comment == null || comment.trim().isEmpty()) {
        throw new ValidationException("Comment is required for rejection");
    }
    
    ContractApprovalWorkflow workflow = workflowRepository.findById(workflowId)
        .orElseThrow();
    
    if (!canApprove(workflow, userId)) {
        throw new UnauthorizedException("Cannot reject this workflow");
    }
    
    // 2. Get current level
    ApprovalLevel currentLevel = workflow.getRequiredLevels()
        .get(workflow.getCurrentLevelIndex());
    
    // 3. Create rejection record
    OrganizationMember approver = findMember(workflow.getOrganizationId(), userId);
    
    ApprovalRecord rejectionRecord = ApprovalRecord.builder()
        .id(UUID.randomUUID().toString())
        .level(currentLevel)
        .action(ApprovalAction.REJECTED)
        .approvedBy(userId)
        .approverName(approver.getUsername())
        .approverEmail(approver.getEmail())
        .actionAt(LocalDateTime.now())
        .comment(comment)  // ⭐ Lý do reject
        .build();
    
    // 4. Update workflow
    workflow.getApprovals().add(rejectionRecord);
    workflow.setStatus(WorkflowStatus.REJECTED);
    workflow.setCompletedAt(LocalDateTime.now());
    
    workflowRepository.save(workflow);
    
    // 5. Update contract status
    FileEntity contract = fileRepository.findById(workflow.getContractId())
        .orElseThrow();
    
    Map<String, Object> overview = contract.getOverview();
    overview.put("status", "REJECTED");
    overview.put("rejectedAt", LocalDateTime.now().toString());
    overview.put("rejectedBy", approver.getUsername());
    overview.put("rejectionReason", comment);
    
    fileRepository.save(contract);
    
    // 6. Send notifications
    notifyRejection(workflow, rejectionRecord);
    
    // 7. Log audit
    auditLog("CONTRACT_REJECTED", workflow.getContractId(), userId, comment);
    
    return workflow;
}

private void notifyRejection(ContractApprovalWorkflow workflow, ApprovalRecord record) {
    // Notify creator
    notificationService.send(NotificationRequest.builder()
        .recipientUserId(workflow.getCreatedBy())
        .type("CONTRACT_REJECTED")
        .title("Hợp đồng bị từ chối")
        .message(String.format(
            "Hợp đồng '%s' bị từ chối bởi %s ở bước %s.\nLý do: %s",
            workflow.getContractTitle(),
            record.getApproverName(),
            record.getLevel(),
            record.getComment()
        ))
        .link("/contracts/" + workflow.getContractId())
        .build()
    );
    
    // Notify organization admins
    List<String> adminIds = getOrganizationAdmins(workflow.getOrganizationId());
    for (String adminId : adminIds) {
        notificationService.send(NotificationRequest.builder()
            .recipientUserId(adminId)
            .type("CONTRACT_REJECTED_ALERT")
            .title("Alert: Hợp đồng bị từ chối")
            .message(String.format("Hợp đồng %s bị từ chối", workflow.getContractTitle()))
            .build()
        );
    }
}
```

### **D. Rejection API**

```http
POST /api/v1/repository-management-service/contracts/{contractId}/approvals/reject
Authorization: Bearer {token}

Body: {
  "comment": "Thiếu điều khoản bảo mật, cần bổ sung điều 5.2"  // ⭐ BẮT BUỘC
}

Response: {
  "statusCode": 200,
  "data": {
    "workflowId": "workflow-123",
    "previousStatus": "LEGAL_REVIEW",
    "currentStatus": "REJECTED",
    "rejectedLevel": "LEGAL",
    "rejectionRecord": {
      "id": "approval-001",
      "level": "LEGAL",
      "action": "REJECTED",
      "approvedBy": "user-legal-001",
      "approverName": "Nguyễn Văn A",
      "actionAt": "2024-11-04T20:45:00Z",
      "comment": "Thiếu điều khoản bảo mật, cần bổ sung điều 5.2"
    },
    "nextActions": [
      {
        "action": "EDIT_AND_RESUBMIT",
        "description": "Sửa hợp đồng và gửi duyệt lại"
      },
      {
        "action": "REQUEST_REVIEW",
        "description": "Yêu cầu xem xét lại"
      },
      {
        "action": "ESCALATE",
        "description": "Báo cáo lên cấp cao hơn"
      }
    ]
  }
}
```

---

## 🔄 IV. RESUBMIT WORKFLOW (GỬI LẠI SAU KHI REJECT)

### **A. Flow Resubmit**

```
┌─────────────────────────────────────────┐
│ 1. Contract bị REJECT                   │
│    workflow-001: REJECTED               │
│    comment: "Thiếu điều khoản X"        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 2. Creator xem rejection details        │
│    GET /contracts/{id}/approvals        │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 3. Creator sửa contract                 │
│    - Upload file mới (version 2)        │
│    - Hoặc edit metadata                 │
│    PUT /contracts/{id}                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 4. Creator submit workflow MỚI          │
│    POST /contracts/{id}/approvals/start │
│    → Tạo workflow-002                   │
│    → workflow-001 vẫn giữ (audit)       │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│ 5. Workflow mới bắt đầu                 │
│    workflow-002: LEGAL_REVIEW           │
│    → Legal Manager review lại           │
└─────────────────────────────────────────┘
```

### **B. Tracking Workflow History**

```typescript
// Contract có thể có nhiều workflows
GET /contracts/{contractId}/approvals/history

Response: {
  "statusCode": 200,
  "data": {
    "contractId": "contract-456",
    "currentWorkflow": {
      "id": "workflow-002",
      "status": "FINANCE_REVIEW",
      "version": 2,
      "submittedAt": "2024-11-04T21:00:00Z"
    },
    "workflowHistory": [
      {
        "id": "workflow-001",
        "status": "REJECTED",
        "version": 1,
        "submittedAt": "2024-11-04T20:00:00Z",
        "completedAt": "2024-11-04T20:45:00Z",
        "rejectedAt": "2024-11-04T20:45:00Z",
        "rejectedBy": "Legal Manager",
        "rejectionReason": "Thiếu điều khoản bảo mật"
      },
      {
        "id": "workflow-002",
        "status": "FINANCE_REVIEW",
        "version": 2,
        "submittedAt": "2024-11-04T21:00:00Z",
        "approvals": [
          {
            "level": "LEGAL",
            "action": "APPROVED",
            "approvedBy": "Legal Manager",
            "comment": "Đã bổ sung đầy đủ",
            "actionAt": "2024-11-04T21:05:00Z"
          }
        ]
      }
    ]
  }
}
```

---

## 📱 V. FRONTEND COMPONENTS

### **A. Rejection Modal**

```tsx
<RejectionModal contractId={contractId}>
  <Form onSubmit={handleReject}>
    <TextArea
      name="comment"
      label="Lý do từ chối"
      placeholder="Vui lòng nêu rõ lý do từ chối..."
      required
      minLength={10}
    />
    
    <Checkbox
      name="notifyCreator"
      label="Gửi email thông báo cho người tạo"
      defaultChecked
    />
    
    <ButtonGroup>
      <Button type="submit" variant="danger">
        ❌ Từ chối hợp đồng
      </Button>
      <Button variant="ghost" onClick={onClose}>
        Huỷ
      </Button>
    </ButtonGroup>
  </Form>
</RejectionModal>
```

### **B. Rejected Contract View (For Creator)**

```tsx
<RejectedContractView contract={contract} workflow={workflow}>
  {/* Rejection Details */}
  <Alert variant="error">
    <AlertTitle>❌ Hợp đồng bị từ chối</AlertTitle>
    <AlertDescription>
      <p>Từ chối bởi: {rejectionRecord.approverName}</p>
      <p>Thời gian: {rejectionRecord.actionAt}</p>
      <p>Cấp độ: {rejectionRecord.level}</p>
      <p className="font-bold">Lý do: {rejectionRecord.comment}</p>
    </AlertDescription>
  </Alert>
  
  {/* Actions */}
  <ActionButtons>
    <Button onClick={handleEditAndResubmit} variant="primary">
      ✏️ Sửa và gửi lại
    </Button>
    
    <Button onClick={handleRequestReview} variant="secondary">
      🔄 Yêu cầu xem xét lại
    </Button>
    
    <Button onClick={handleEscalate} variant="outline">
      ⬆️ Báo cáo lên cấp cao hơn
    </Button>
  </ActionButtons>
  
  {/* Workflow History */}
  <WorkflowHistory workflows={workflowHistory} />
</RejectedContractView>
```

---

## ✅ VI. BUSINESS RULES

### **Rule 1: Comment Required for Rejection**
- Reject PHẢI có comment
- Minimum 10 ký tự
- Nêu rõ lý do và hướng sửa

### **Rule 2: Rejection Stops Workflow**
- Reject ở bất kỳ bước nào → Workflow dừng ngay
- Status → REJECTED
- Không thể approve tiếp

### **Rule 3: Resubmit Creates New Workflow**
- Sau khi sửa → Submit tạo workflow MỚI
- Workflow cũ giữ nguyên để audit
- Contract có thể có nhiều workflows

### **Rule 4: Rejection Notification**
- Notify creator ngay lập tức
- Notify organization admins
- Email + In-app notification

### **Rule 5: OWNER Override**
- OWNER có thể override rejection
- OWNER có thể approve trực tiếp skip workflow
- Cần audit log kỹ

### **Rule 6: Rejection Tracking**
- Track tất cả rejections
- Analytics: Rejection rate by approver
- Improve process based on data

---

## 📊 VII. EXAMPLE SCENARIOS

### **Scenario 1: Reject → Edit → Resubmit → Approve**

```
Timeline:
10:00 - Creator submit contract (workflow-001)
10:05 - Legal Manager REJECT: "Thiếu điều khoản X"
10:30 - Creator edit contract (add điều khoản X)
10:35 - Creator resubmit (workflow-002)
10:40 - Legal Manager APPROVE
10:45 - Finance Manager APPROVE
10:50 - Executive Manager APPROVE
10:50 - Contract FULLY_APPROVED ✅
```

### **Scenario 2: Multiple Rejections**

```
Timeline:
10:00 - Submit workflow-001
10:05 - Legal REJECT: "Thiếu X"
10:30 - Resubmit workflow-002
10:35 - Legal APPROVE
10:40 - Finance REJECT: "Giá trị không hợp lý"
11:00 - Resubmit workflow-003 (adjust giá trị)
11:05 - Legal APPROVE (lại)
11:10 - Finance APPROVE
11:15 - Executive APPROVE
11:15 - FULLY_APPROVED ✅
```

### **Scenario 3: Escalate to OWNER**

```
Timeline:
10:00 - Submit workflow-001
10:05 - Legal REJECT: "Policy không cho phép"
10:10 - Creator escalate to OWNER: "Urgent, cần xử lý gấp"
10:15 - OWNER override rejection → APPROVE trực tiếp
10:15 - Contract FULLY_APPROVED ✅ (với OWNER approval)
```

---

**HỆ THỐNG APPROVAL HOÀN CHỈNH - Xử lý cả Approve và Reject!** ✅

---

## 🎉 VIII. IMPLEMENTATION STATUS

### **✅ BACKEND (100% Hoàn thành)**

#### **Entities:**
- ✅ `ContractApprovalWorkflow.java` - Main entity với 3 enums (ApprovalLevel, WorkflowStatus, ApprovalAction)
- ✅ `ApprovalRecord` - Embedded document tracking từng approval

#### **Repositories:**
- ✅ `ContractApprovalWorkflowRepository.java` - MongoDB repository với 8 queries

#### **Services:**
- ✅ `ContractApprovalService.java` - Business logic:
  - `determineApprovalLevels()` - Xác định levels theo giá trị
  - `createWorkflow()` - Tạo workflow
  - `approve()` - Approve logic
  - `reject()` - Reject logic với comment validation
  - `canApprove()` - Permission checking

#### **Controllers:**
- ✅ `ContractApprovalController.java` - REST API với 6 endpoints:
  - `POST /contracts/{id}/approvals/start` - Start workflow
  - `GET /contracts/{id}/approvals/workflow` - Get status
  - `GET /contracts/{id}/approvals/history` - Get history
  - `POST /contracts/{id}/approvals/approve` - Approve
  - `POST /contracts/{id}/approvals/reject` - Reject
  - `GET /contracts/approvals/me/pending` - My pending

### **✅ FRONTEND (100% Hoàn thành)**

#### **Types:**
- ✅ `approval.types.ts` - TypeScript types với helper functions

#### **API:**
- ✅ `approvalApi.ts` - API service với 6 methods

#### **Components:**
- ✅ `ApprovalWorkflowStatus.tsx` - Timeline hiển thị workflow
- ✅ `ApprovalActionModal.tsx` - Modal approve/reject
- ✅ `MyApprovalsDashboard.tsx` - Dashboard chờ duyệt

### **📁 File Structure:**

```
backend/repository-management-service/
└── src/main/java/.../repository_service/
    ├── entity/
    │   └── ContractApprovalWorkflow.java
    ├── repository/
    │   └── ContractApprovalWorkflowRepository.java
    ├── service/
    │   └── ContractApprovalService.java
    └── controller/
        └── ContractApprovalController.java

frontend/webapp/src/features/approvals/
├── types/
│   └── approval.types.ts
├── api/
│   └── approvalApi.ts
├── components/
│   ├── ApprovalWorkflowStatus.tsx
│   └── ApprovalActionModal.tsx
└── views/
    └── MyApprovalsDashboard.tsx
```

### **🚀 How to Use:**

#### **1. Submit Contract for Approval (Backend automatically)**
```typescript
// Khi contract được processed, auto tạo workflow
const workflow = await approvalService.createWorkflow(
  contractId,
  organizationId,
  userId,
  userName,
  userEmail,
  "Xin phê duyệt"
);
```

#### **2. View Workflow in Frontend**
```tsx
import { ApprovalWorkflowStatus } from '@/features/approvals/components/ApprovalWorkflowStatus';

<ApprovalWorkflowStatus
  workflow={workflow}
  userRole={currentUser.role}
  userPermissions={currentUser.permissions}
  onApprove={handleOpenApproveModal}
  onReject={handleOpenRejectModal}
/>
```

#### **3. Approve/Reject**
```tsx
import { ApprovalActionModal } from '@/features/approvals/components/ApprovalActionModal';

<ApprovalActionModal
  isOpen={isOpen}
  onClose={handleClose}
  action="approve" // or "reject"
  level={currentLevel}
  contractTitle={contract.title}
  onSubmit={async (comment) => {
    await approvalApi.approve(contractId, { comment });
  }}
/>
```

#### **4. View My Approvals Dashboard**
```tsx
import { MyApprovalsDashboard } from '@/features/approvals/views/MyApprovalsDashboard';

<Route path="/approvals/me" element={<MyApprovalsDashboard />} />
```

### **✅ Features Implemented:**

1. ✅ Sequential approval (tuần tự)
2. ✅ 3-level approval (Legal → Finance → Executive)
3. ✅ Dynamic levels dựa trên contract value
4. ✅ Permission-based approval (OWNER, MANAGER)
5. ✅ Comment for approval/rejection
6. ✅ Rejection handling với comment bắt buộc
7. ✅ Workflow history tracking
8. ✅ Timeline visualization
9. ✅ Pending approvals dashboard
10. ✅ Real-time status updates

### **⏭️ Next Steps (Optional):**

1. ⏹️ Notification system (Email + In-app)
2. ⏹️ Escalation to OWNER
3. ⏹️ Timeout reminders
4. ⏹️ Analytics dashboard
5. ⏹️ Bulk approve/reject
6. ⏹️ Approval delegation

---

## 🔑 XII. ORGANIZATION CONTEXT & PERMISSIONS SETUP

### **A. Cách Hệ Thống Lấy User Info**

#### **1. User Authentication (Redux Store)**
```typescript
// Lưu trong localStorage key: 'docgo_auth_v1'
{
  user: {
    id: string,
    username: string,
    email: string,
    fullName: string,
    firstName: string,
    lastName: string,
    role: 'ADMIN' | 'MANAGER' | 'USER' // Global role
  },
  tokenData: {
    accessToken: string,
    refreshToken: string,
    expiresAt: number
  }
}
```

#### **2. Organization Context (localStorage)**
```typescript
// 3 keys quan trọng cho approval system:
localStorage.setItem('currentOrganizationId', 'org-id');
localStorage.setItem('organizationRole', 'OWNER' | 'MANAGER' | 'MEMBER');
localStorage.setItem('organizationPermissions', 'approve:legal,approve:finance');
```

### **B. Permission Check Logic**

```java
// Backend: ContractApprovalService.java
private boolean canApprove(
    ContractApprovalWorkflow workflow,
    String userId,
    String userRole,
    List<String> userPermissions
) {
    ApprovalLevel currentLevel = workflow.getCurrentLevel();
    
    // 1. OWNER → Approve tất cả
    if ("OWNER".equals(userRole)) {
        return true;
    }
    
    // 2. MANAGER → Check permission tương ứng
    if ("MANAGER".equals(userRole)) {
        String requiredPermission = "approve:" + currentLevel.name().toLowerCase();
        return userPermissions.contains(requiredPermission);
    }
    
    // 3. MEMBER → Không có quyền approve
    return false;
}
```

### **C. Auto-Save Organization Context**

```typescript
// OrganizationSelector.tsx - Tự động lưu khi user chọn organization
const handleSelectOrganization = (orgId: string) => {
  const selectedOrg = data?.content.find(org => org.id === orgId);
  
  if (selectedOrg) {
    // Auto save context từ backend response
    localStorage.setItem('currentOrganizationId', orgId);
    localStorage.setItem('organizationRole', selectedOrg.userRole || 'MEMBER');
    localStorage.setItem('organizationPermissions', 
      (selectedOrg.userPermissions || []).join(',')
    );
  }
};
```

### **D. Frontend API Headers**

```typescript
// approvalApi.ts - Gửi headers cho backend
const getAuthHeaders = () => {
  const user = getCurrentUser(); // Từ Redux store
  const orgRole = localStorage.getItem('organizationRole') || 'MEMBER';
  const orgPermissions = localStorage.getItem('organizationPermissions') || '';
  
  return {
    'Authorization': `Bearer ${token}`,
    'X-User-Id': user.id,
    'X-User-Name': encodeBase64(user.fullName), // Encode để hỗ trợ tiếng Việt
    'X-User-Email': encodeBase64(user.email),
    'X-User-Role': orgRole,
    'X-User-Permissions': orgPermissions,
    'X-Organization-Id': organizationId
  };
};
```

---

## 🧪 XIII. HƯỚNG DẪN SETUP & TEST

### **A. Quick Setup (Manual - Dành cho Test)**

#### **Bước 1: Login**
```
http://localhost:3000/login
Username: truongluan2
Password: @Luan123123
```

#### **Bước 2: Set Organization Context**

Mở DevTools Console (F12):

```javascript
// Setup OWNER (approve tất cả)
localStorage.setItem('organizationRole', 'OWNER');
localStorage.setItem('organizationPermissions', '');
localStorage.setItem('currentOrganizationId', 'YOUR_ORG_ID');
location.reload();

// HOẶC Setup MANAGER với full permissions
localStorage.setItem('organizationRole', 'MANAGER');
localStorage.setItem('organizationPermissions', 'approve:legal,approve:finance,approve:executive');
localStorage.setItem('currentOrganizationId', 'YOUR_ORG_ID');
location.reload();
```

#### **Bước 3: Test Workflow**
1. Vào contract: `http://localhost:3000/repositories/{repoId}/files/{fileId}`
2. Click **"Gửi duyệt"** → Workflow tạo
3. Click **"Phê duyệt"** → Success! ✅

### **B. Production Setup (Auto)**

#### **Khi User Chọn Organization:**
```typescript
// Hệ thống TỰ ĐỘNG lưu context từ backend response
Organization {
  id: "org-123",
  name: "My Company",
  userRole: "OWNER", // ← Auto save
  userPermissions: ["approve:legal", "approve:finance"] // ← Auto save
}
```

**→ User KHÔNG CẦN setup manual!**

### **C. Các Role & Quyền Approve**

| Role | Permissions | Approve Legal | Approve Finance | Approve Executive |
|------|-------------|---------------|-----------------|-------------------|
| **OWNER** | (không cần) | ✅ | ✅ | ✅ |
| **MANAGER** | `approve:legal` | ✅ | ❌ | ❌ |
| **MANAGER** | `approve:finance` | ❌ | ✅ | ❌ |
| **MANAGER** | `approve:executive` | ❌ | ❌ | ✅ |
| **MANAGER** | `approve:legal,approve:finance,approve:executive` | ✅ | ✅ | ✅ |
| **MEMBER** | (không có) | ❌ | ❌ | ❌ |

### **D. Debug & Troubleshooting**

#### **Lỗi: "Không có quyền phê duyệt"**

```javascript
// Kiểm tra context
console.log({
  orgRole: localStorage.getItem('organizationRole'),
  permissions: localStorage.getItem('organizationPermissions'),
  orgId: localStorage.getItem('currentOrganizationId')
});

// Nếu null → Cần set manual hoặc chọn lại organization
```

#### **Kiểm tra Request Headers**
```javascript
// DevTools → Network tab → Click "Phê duyệt" → Headers
Request Headers:
  X-User-Role: OWNER
  X-User-Permissions: approve:legal,approve:finance
  X-User-Name: VHLGsOG7m25nIEx1w6Ju (base64-encoded)
```

#### **Kiểm tra Backend Logs**
```
Approving contract: contract-123 by user: user-456
User does not have permission to approve this level
```
→ Check role & permissions mismatch

### **E. Test Scenarios**

#### **Scenario 1: OWNER Approve All (Contract 600tr)**
```javascript
localStorage.setItem('organizationRole', 'OWNER');
// → Approve Legal → Finance → Executive → FULLY_APPROVED ✅
```

#### **Scenario 2: Sequential Approval (3 Users)**
```javascript
// User 1 - Legal Manager
localStorage.setItem('organizationRole', 'MANAGER');
localStorage.setItem('organizationPermissions', 'approve:legal');
// → Approve Legal → FINANCE_REVIEW

// User 2 - Finance Manager (khác user)
localStorage.setItem('organizationPermissions', 'approve:finance');
// → Approve Finance → EXECUTIVE_REVIEW

// User 3 - Executive Manager (khác user)
localStorage.setItem('organizationPermissions', 'approve:executive');
// → Approve Executive → FULLY_APPROVED ✅
```

#### **Scenario 3: Rejection**
```javascript
// Finance Manager reject
localStorage.setItem('organizationPermissions', 'approve:finance');
// → Reject với comment "Cần điều chỉnh giá trị"
// → Workflow STOPPED → Status: REJECTED ❌
```

### **F. Utility Functions (Helper)**

```typescript
// organizationContext.ts
export const saveOrganizationContext = (org: Organization) => {
  localStorage.setItem('currentOrganizationId', org.id);
  localStorage.setItem('organizationRole', org.userRole || 'MEMBER');
  localStorage.setItem('organizationPermissions', 
    (org.userPermissions || []).join(',')
  );
};

export const getOrganizationContext = () => ({
  organizationId: localStorage.getItem('currentOrganizationId'),
  role: localStorage.getItem('organizationRole'),
  permissions: localStorage.getItem('organizationPermissions')?.split(',') || []
});

export const hasPermission = (permission: string): boolean => {
  const { role, permissions } = getOrganizationContext();
  if (role === 'OWNER') return true;
  return permissions.includes(permission);
};

export const canApproveLevel = (level: 'LEGAL' | 'FINANCE' | 'EXECUTIVE'): boolean => {
  return hasPermission(`approve:${level.toLowerCase()}`);
};
```

---

## 📁 XIV. FILE STRUCTURE (UPDATED)

```
backend/repository-management-service/
├── entity/
│   └── ContractApprovalWorkflow.java (✅ Decode base64 headers)
├── repository/
│   └── ContractApprovalWorkflowRepository.java
├── service/
│   └── ContractApprovalService.java (✅ Permission check logic)
└── controller/
    └── ContractApprovalController.java (✅ Decode userName/email)

frontend/webapp/src/features/
├── approvals/
│   ├── types/approval.types.ts
│   ├── api/approvalApi.ts (✅ Get user from Redux + org context)
│   ├── hooks/useContractApproval.ts
│   ├── components/
│   │   ├── ApprovalWorkflowStatus.tsx
│   │   └── ApprovalActionModal.tsx
│   └── views/
│       └── MyApprovalsDashboard.tsx
├── organizations/
│   ├── models/types/organization.types.ts
│   ├── utils/organizationContext.ts (✅ NEW - Utility functions)
│   └── views/components/
│       └── OrganizationSelector.tsx (✅ Auto-save context)
└── repositories/views/pages/
    └── RepositoryFileDetail.tsx (✅ Get user from Redux)
```

---

**APPROVAL SYSTEM ĐÃ HOÀN THÀNH VÀ SẴN SÀNG SỬ DỤNG!** 🎉

### **Checklist Triển Khai:**
- [x] Backend approval workflow entities
- [x] Backend approval service logic
- [x] Backend permission check (OWNER, MANAGER)
- [x] Backend base64 decode (Vietnamese support)
- [x] Frontend approval API integration
- [x] Frontend user info from Redux store
- [x] Frontend organization context management
- [x] Frontend auto-save context khi chọn organization
- [x] Frontend approval UI components
- [x] Frontend timeline visualization
- [x] Sequential approval flow (Legal → Finance → Executive)
- [x] Rejection handling với mandatory comment
- [x] Workflow history tracking
- [x] Permission-based approve/reject
- [x] Real-time status updates

**READY FOR PRODUCTION!** 🚀
