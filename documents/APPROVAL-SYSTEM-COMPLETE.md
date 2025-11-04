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

**APPROVAL SYSTEM ĐÃ HOÀN THÀNH VÀ SẴN SÀNG SỬ DỤNG!** 🎉
