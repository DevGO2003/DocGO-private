# 📄 Đầu ra Upload Hợp đồng & Flow Phê duyệt

## 📊 I. ĐẦU RA KHI UPLOAD FILE HỢP ĐỒNG

### **1. API Endpoint Upload**
```http
POST http://localhost:8003/api/v1/automation-service/upload
Content-Type: multipart/form-data

file: [contract-file.pdf]
repositoryId: repo-123 (optional)
```

---

### **2. Response Structure - SYNC Processing (File < 5MB)**

```json
{
  "apiVersion": "v1",
  "statusCode": 201,
  "shortMessage": "Created",
  "description": "Document uploaded and processed successfully (sync)",
  "timestamp": "2024-11-04T12:30:00Z",
  "requestId": "uuid-request-123",
  "correlationId": "corr-456",
  "path": "/api/v1/automation-service/upload",
  
  "data": {
    "documentId": "file-abc-123",
    "fileUrl": "s3://docgo-files/file-abc-123.pdf",
    "correlationId": "corr-456",
    
    "overview": {
      "fileName": "hop-dong-1-ty.pdf",
      "fileSize": 2457600,
      "mimeType": "application/pdf",
      "uploadedAt": "2024-11-04T12:30:00Z",
      "ownerUserId": "user-123",
      "status": "PROCESSED"
    },
    
    "metadata": {
      "documentType": "CONTRACT",
      "isContract": true,
      "confidence": 0.95,
      "language": "vi",
      "region": "VN",
      "pageCount": 15,
      "classification": {
        "model": "gemini-1.5-flash",
        "inputTokens": 3500,
        "outputTokens": 250
      }
    },
    
    "content": {
      "rawText": "NỘI DUNG HỢP ĐỒNG...",
      "ocrText": "CÔNG TY TNHH...",
      "ocrEngine": "tesseract",
      "ocrConfidence": 0.92,
      "extractedAt": "2024-11-04T12:30:05Z"
    },
    
    "contract": {
      "effectiveDate": "2024-01-15T00:00:00",
      "expiryDate": "2026-01-15T00:00:00",
      "totalValue": 1000000000,
      "currency": "VND",
      "summary": "Hợp đồng cung cấp dịch vụ phát triển phần mềm DocGO Platform...",
      "project": "Dự án DocGO Platform",
      "department": "Phòng CNTT",
      "priority": "HIGH",
      "confidentiality": "CONFIDENTIAL",
      "contractType": "CONTRACT",
      
      "parties": [
        {
          "id": "party-001",
          "name": "CÔNG TY TNHH DEVGO2003",
          "type": "VENDOR",
          "role": "Bên A - Nhà cung cấp",
          "contact": {
            "email": "contact@devgo2003.com",
            "phone": "+84-28-3821-5678",
            "address": "123 Lê Văn Việt, Q9, TP.HCM"
          },
          "representative": {
            "name": "Nguyễn Văn An",
            "position": "Giám đốc",
            "email": "an.nguyen@devgo2003.com"
          },
          "taxCode": "0312345678"
        },
        {
          "id": "party-002",
          "name": "CÔNG TY CỔ PHẦN ABC",
          "type": "CLIENT",
          "role": "Bên B - Khách hàng",
          "contact": {
            "email": "info@abc.com",
            "phone": "+84-24-3943-8888",
            "address": "Hà Nội"
          },
          "representative": {
            "name": "Trần Thị Bình",
            "position": "Giám đốc Công nghệ",
            "email": "binh.tran@abc.com"
          },
          "taxCode": "0109876543"
        }
      ],
      
      "payment": {
        "totalValue": 1000000000,
        "currency": "VND",
        "method": "BANK_TRANSFER",
        "schedule": [
          {
            "milestone": "Ký hợp đồng",
            "percentage": 20,
            "amount": 200000000,
            "dueDate": "2024-01-20T00:00:00",
            "status": "PAID"
          },
          {
            "milestone": "Hoàn thành phân tích",
            "percentage": 15,
            "amount": 150000000,
            "dueDate": "2024-03-15T00:00:00",
            "status": "PENDING"
          },
          {
            "milestone": "Hoàn thành module chính",
            "percentage": 25,
            "amount": 250000000,
            "dueDate": "2024-07-01T00:00:00",
            "status": "PENDING"
          }
        ]
      },
      
      "clauses": {
        "key": [
          {
            "name": "Điều 8: Trách nhiệm pháp lý",
            "description": "Quy định bồi thường tối đa 30% giá trị hợp đồng",
            "content": "Bên vi phạm phải bồi thường...",
            "importance": "HIGH",
            "risk": "HIGH",
            "advice": "Nên mua bảo hiểm trách nhiệm nghề nghiệp",
            "pageNumber": 5
          }
        ],
        "favorable": [
          {
            "name": "Điều 10: Bảo hành",
            "description": "Bảo hành miễn phí 12 tháng",
            "content": "Bên A cam kết bảo hành...",
            "importance": "HIGH",
            "advice": "Lập danh sách lỗi và yêu cầu khắc phục kịp thời",
            "pageNumber": 6
          }
        ],
        "unfavorable": [
          {
            "name": "Điều 6: Phạt chậm tiến độ",
            "description": "Phạt 0.5%/ngày nếu chậm tiến độ",
            "content": "Nếu chậm tiến độ sẽ bị phạt...",
            "impact": "Rủi ro tài chính cao, tối đa 100 triệu",
            "affectedParties": ["party-001"],
            "pageNumber": 4
          }
        ],
        "all": [
          {
            "name": "Điều 1: Định nghĩa",
            "description": "Định nghĩa các thuật ngữ",
            "content": "Hệ thống DocGO Platform là...",
            "importance": "MEDIUM",
            "risk": "LOW",
            "pageNumber": 1
          }
        ]
      },
      
      "reminders": [
        {
          "id": "reminder-001",
          "type": "PAYMENT_DUE",
          "title": "Thanh toán đợt 2",
          "description": "Thanh toán 150 triệu",
          "dueDate": "2024-03-15T00:00:00",
          "status": "PENDING",
          "priority": "HIGH"
        }
      ],
      
      "risk": {
        "level": "MEDIUM",
        "factors": [
          {
            "category": "FINANCIAL",
            "description": "Rủi ro thanh toán chậm",
            "severity": "MEDIUM",
            "probability": "LOW",
            "impact": "Ảnh hưởng dòng tiền",
            "mitigation": "Theo dõi sát thanh toán"
          }
        ],
        "assessment": "Hợp đồng có mức rủi ro trung bình",
        "recommendations": "Cần theo dõi tiến độ"
      },
      
      "compliance": {
        "status": "COMPLIANT",
        "regulations": [],
        "certifications": [],
        "auditRequirements": null,
        "reportingRequirements": null
      }
    }
  }
}
```

---

### **3. Response Structure - ASYNC Processing (File >= 5MB)**

```json
{
  "apiVersion": "v1",
  "statusCode": 202,
  "shortMessage": "Accepted",
  "description": "Document accepted for processing (async)",
  "timestamp": "2024-11-04T12:30:00Z",
  
  "data": {
    "documentId": "file-xyz-789",
    "fileUrl": "s3://docgo-files/file-xyz-789.pdf",
    "websocketUrl": "ws://localhost:8003/ws/document/file-xyz-789",
    "correlationId": "corr-789",
    
    "status": "PROCESSING",
    "message": "Document uploaded, processing in background...",
    "estimatedCompletionTime": "2024-11-04T12:35:00Z"
  }
}
```

**WebSocket Updates:**
```json
{
  "type": "progress",
  "documentId": "file-xyz-789",
  "status": "PROCESSING",
  "progress": 45,
  "currentStep": "AI_CONTRACT_ANALYSIS",
  "message": "Analyzing contract clauses..."
}

// Final result
{
  "type": "completed",
  "documentId": "file-xyz-789",
  "status": "COMPLETED",
  "progress": 100,
  "contract": { /* full contract data */ }
}
```

---

## ⚙️ II. FLOW PHÊ DUYỆT HỢP ĐỒNG

### **A. Quy trình phê duyệt theo GIÁ TRỊ HỢP ĐỒNG**

```typescript
interface ApprovalRule {
  minValue: number;           // Giá trị tối thiểu (VND)
  maxValue: number | null;    // Giá trị tối đa (null = không giới hạn)
  requiredApprovers: ApprovalLevel[];
  autoApprove: boolean;       // Tự động duyệt nếu đủ điều kiện
}

interface ApprovalLevel {
  level: number;              // Cấp duyệt (1, 2, 3...)
  role: string;               // Vai trò cần duyệt
  minApprovers: number;       // Số lượng người duyệt tối thiểu
  timeoutHours: number;       // Thời gian timeout (giờ)
}
```

### **1. Bảng quy định phê duyệt theo giá trị (Theo Permission System thực tế)**

⭐ **Hệ thống có 3 cấp duyệt theo Permissions:**
- **Legal Approval** (`approve:legal`)
- **Finance Approval** (`approve:finance`)  
- **Executive Approval** (`approve:executive`)

| Giá trị hợp đồng | Legal | Finance | Executive | Owner Override |
|------------------|-------|---------|-----------|----------------|
| **< 100 triệu** | ✅ Required | ❌ Skip | ❌ Skip | ✅ Có thể override |
| **100tr - 500tr** | ✅ Required | ✅ Required | ❌ Skip | ✅ Có thể override |
| **500tr - 1 tỷ** | ✅ Required | ✅ Required | ✅ Required | ✅ Có thể override |
| **> 1 tỷ** | ✅ Required | ✅ Required | ✅ Required | ✅ Bắt buộc OWNER duyệt |

**Lưu ý:**
- OWNER có thể approve trực tiếp mọi contract mà không cần qua 3 cấp
- MANAGER chỉ approve được nếu có permission tương ứng
- MEMBER không có quyền approve

### **2. Config mẫu (Theo Permission System thực tế)**

```json
{
  "approvalRules": [
    {
      "name": "Hợp đồng dưới 100 triệu",
      "minValue": 0,
      "maxValue": 100000000,
      "requiredPermissions": ["approve:legal"],
      "ownerCanOverride": true,
      "timeoutHours": 24
    },
    {
      "name": "Hợp đồng 100-500 triệu",
      "minValue": 100000001,
      "maxValue": 500000000,
      "requiredPermissions": [
        "approve:legal",
        "approve:finance"
      ],
      "ownerCanOverride": true,
      "timeoutHours": 48
    },
    {
      "name": "Hợp đồng 500tr - 1 tỷ",
      "minValue": 500000001,
      "maxValue": 1000000000,
      "requiredPermissions": [
        "approve:legal",
        "approve:finance",
        "approve:executive"
      ],
      "ownerCanOverride": true,
      "timeoutHours": 72
    },
    {
      "name": "Hợp đồng trên 1 tỷ",
      "minValue": 1000000001,
      "maxValue": null,
      "requiredPermissions": [
        "approve:legal",
        "approve:finance",
        "approve:executive"
      ],
      "ownerRequired": true,
      "ownerCanOverride": true,
      "timeoutHours": 168
    }
  ]
}
```

---

### **B. PHÊ DUYỆT THEO PERMISSION & ORGANIZATION**

⭐ **HỆ THỐNG SỬ DỤNG 3 ROLES CỐ ĐỊNH VÀ 5 PERMISSIONS CHO MANAGER**

### **1. Cấu trúc Roles & Permissions (THỰC TẾ)**

```typescript
// 3 Roles cố định
export enum MemberRole {
  OWNER = 'OWNER',       // Chủ sở hữu - Toàn quyền
  MANAGER = 'MANAGER',   // Quản lý - Có permissions tùy chọn
  MEMBER = 'MEMBER'      // Thành viên - Chỉ xem và tạo
}

// 5 Permissions cho MANAGER
export type ManagerPermission = 
  | 'approve:legal'       // Legal Approval
  | 'approve:finance'     // Finance Approval
  | 'approve:executive'   // Executive Approval
  | 'member:invite'       // Invite Members
  | 'org:settings';       // Manage Settings

// Organization Member
interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  email: string;
  role: MemberRole;              // OWNER, MANAGER, hoặc MEMBER
  permissions?: ManagerPermission[]; // Chỉ có nếu role = MANAGER
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  joinedAt: string;
}
```

### **2. Invite Member với Permissions**

**API:** Invite member vào organization với role và permissions

```http
POST /api/v1/user-management-service/organizations/{orgId}/members/invite
Content-Type: application/json

{
  "email": "manager@example.com",
  "role": "MANAGER",
  "permissions": ["approve:legal", "approve:finance", "member:invite"]
}

Response:
{
  "statusCode": 201,
  "data": {
    "invitationId": "inv-123",
    "token": "eyJhbGc...",
    "email": "manager@example.com",
    "role": "MANAGER",
    "permissions": ["approve:legal", "approve:finance", "member:invite"],
    "expiresAt": "2024-11-11T00:00:00Z"
  }
}
```

**3 Ví dụ invite khác nhau:**

```http
# 1. Invite MEMBER (không cần permissions)
POST /organizations/{orgId}/members/invite
{
  "email": "member@example.com",
  "role": "MEMBER"
}

# 2. Invite MANAGER với Legal Approval
POST /organizations/{orgId}/members/invite
{
  "email": "legal@example.com",
  "role": "MANAGER",
  "permissions": ["approve:legal"]
}

# 3. Invite MANAGER với Full Permissions
POST /organizations/{orgId}/members/invite
{
  "email": "director@example.com",
  "role": "MANAGER",
  "permissions": [
    "approve:legal",
    "approve:finance", 
    "approve:executive",
    "member:invite",
    "org:settings"
  ]
}
```

### **3. Ví dụ Organization với Members**

```json
{
  "organizationId": "org-abc-123",
  "name": "Công ty ABC",
  "ownerUserId": "user-owner-001",
  "memberCount": 5,
  
  "members": [
    {
      "userId": "user-owner-001",
      "email": "ceo@company.com",
      "role": "OWNER",
      "permissions": null,
      "status": "ACTIVE",
      "joinedAt": "2024-01-01T00:00:00Z"
    },
    {
      "userId": "user-002",
      "email": "legal@company.com",
      "role": "MANAGER",
      "permissions": ["approve:legal"],
      "status": "ACTIVE",
      "joinedAt": "2024-02-01T00:00:00Z"
    },
    {
      "userId": "user-003",
      "email": "finance@company.com",
      "role": "MANAGER",
      "permissions": ["approve:finance"],
      "status": "ACTIVE",
      "joinedAt": "2024-02-15T00:00:00Z"
    },
    {
      "userId": "user-004",
      "email": "director@company.com",
      "role": "MANAGER",
      "permissions": [
        "approve:legal",
        "approve:finance",
        "approve:executive",
        "member:invite",
        "org:settings"
      ],
      "status": "ACTIVE",
      "joinedAt": "2024-03-01T00:00:00Z"
    },
    {
      "userId": "user-005",
      "email": "staff@company.com",
      "role": "MEMBER",
      "permissions": null,
      "status": "ACTIVE",
      "joinedAt": "2024-04-01T00:00:00Z"
    }
  ]
}
```

### **4. Tìm Approvers trong Organization**

```typescript
// Logic tìm users có quyền duyệt theo permission
async function findApprovers(
  organizationId: string,
  permission: 'legal' | 'finance' | 'executive'
): Promise<OrganizationMember[]> {
  
  const requiredPermission = `approve:${permission}` as ManagerPermission;
  
  // Lấy tất cả members của organization
  const members = await OrganizationMember.find({
    organizationId,
    status: 'ACTIVE'
  });
  
  // Filter members có quyền approve
  const approvers = members.filter(member => {
    // OWNER có thể approve tất cả
    if (member.role === MemberRole.OWNER) {
      return true;
    }
    
    // MANAGER phải có permission tương ứng
    if (member.role === MemberRole.MANAGER && member.permissions) {
      return member.permissions.includes(requiredPermission);
    }
    
    // MEMBER không có quyền approve
    return false;
  });
  
  return approvers;
}

// Ví dụ sử dụng:
const legalApprovers = await findApprovers('org-abc-123', 'legal');
// Returns: [OWNER, MANAGERs có approve:legal]

const financeApprovers = await findApprovers('org-abc-123', 'finance');
// Returns: [OWNER, MANAGERs có approve:finance]

const executiveApprovers = await findApprovers('org-abc-123', 'executive');
// Returns: [OWNER, MANAGERs có approve:executive]
```

**Check quyền của user:**

```typescript
function canApprove(
  user: OrganizationMember,
  approvalType: 'legal' | 'finance' | 'executive'
): boolean {
  // OWNER có thể approve tất cả
  if (user.role === MemberRole.OWNER) {
    return true;
  }
  
  // MANAGER cần có permission tương ứng
  if (user.role === MemberRole.MANAGER && user.permissions) {
    const requiredPermission = `approve:${approvalType}`;
    return user.permissions.includes(requiredPermission);
  }
  
  // MEMBER không có quyền
  return false;
}

// Ví dụ:
const user = {
  role: MemberRole.MANAGER,
  permissions: ['approve:legal', 'approve:finance']
};

canApprove(user, 'legal');     // ✅ true
canApprove(user, 'finance');   // ✅ true
canApprove(user, 'executive'); // ❌ false
```

---

### **C. WORKFLOW STATE MACHINE**

```
┌─────────────┐
│   DRAFT     │ ← Tạo hợp đồng mới
└──────┬──────┘
       │
       ↓
┌─────────────┐
│  PENDING    │ ← Gửi yêu cầu phê duyệt
│  APPROVAL   │
└──────┬──────┘
       │
       ├──→ ┌──────────────────┐
       │    │  LEVEL_1_REVIEW  │ ← Team Lead duyệt
       │    └────────┬─────────┘
       │             │
       │             ├──→ REJECTED ──→ ┌──────────────┐
       │             │                 │   REJECTED   │
       │             ↓                 └──────────────┘
       │    ┌──────────────────┐
       │    │  LEVEL_2_REVIEW  │ ← Manager duyệt
       │    └────────┬─────────┘
       │             │
       │             ├──→ REJECTED
       │             ↓
       │    ┌──────────────────┐
       │    │  LEVEL_3_REVIEW  │ ← Director duyệt
       │    └────────┬─────────┘
       │             │
       │             ├──→ REJECTED
       │             ↓
       │    ┌──────────────────┐
       │    │  LEVEL_4_REVIEW  │ ← CEO duyệt (nếu > 1 tỷ)
       │    └────────┬─────────┘
       │             │
       ↓             ↓
┌─────────────┐
│  APPROVED   │ ← Đã duyệt
└──────┬──────┘
       │
       ↓
┌─────────────┐
│   ACTIVE    │ ← Hợp đồng có hiệu lực
└──────┬──────┘
       │
       ├──→ EXPIRED
       ├──→ TERMINATED
       └──→ ARCHIVED
```

---

### **D. DATA STRUCTURE CHO APPROVAL SYSTEM**

```typescript
interface ContractApprovalWorkflow {
  workflowId: string;
  contractId: string;
  contractValue: number;
  currency: string;
  organizationId: string;
  
  status: WorkflowStatus;
  currentLevel: number;
  
  approvalSteps: ApprovalStep[];
  
  createdAt: string;
  createdBy: string;
  completedAt: string | null;
}

enum WorkflowStatus {
  DRAFT = "DRAFT",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  LEVEL_1_REVIEW = "LEVEL_1_REVIEW",
  LEVEL_2_REVIEW = "LEVEL_2_REVIEW",
  LEVEL_3_REVIEW = "LEVEL_3_REVIEW",
  LEVEL_4_REVIEW = "LEVEL_4_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  TERMINATED = "TERMINATED"
}

interface ApprovalStep {
  stepId: string;
  level: number;
  role: string;
  requiredApprovers: number;
  
  approvers: Approver[];
  
  status: StepStatus;
  startedAt: string;
  completedAt: string | null;
  timeoutAt: string;
}

interface Approver {
  userId: string;
  userName: string;
  userRole: string;
  
  action: ApprovalAction | null;
  actionAt: string | null;
  comment: string | null;
}

enum ApprovalAction {
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  DELEGATED = "DELEGATED"
}
```

---

## 🎯 III. API ENDPOINTS CHO APPROVAL SYSTEM

### **1. Tạo yêu cầu phê duyệt**
```http
POST /api/v1/repository-management-service/files/{fileId}/approvals/request

{
  "comment": "Xin phê duyệt hợp đồng 1 tỷ",
  "urgency": "HIGH",
  "estimatedStartDate": "2024-12-01"
}

Response:
{
  "workflowId": "workflow-123",
  "status": "PENDING_APPROVAL",
  "currentLevel": 1,
  "nextApprovers": [
    {
      "userId": "user-456",
      "name": "Nguyễn Team Lead",
      "role": "TEAM_LEAD"
    }
  ]
}
```

### **2. Phê duyệt / Từ chối**
```http
POST /api/v1/repository-management-service/files/{fileId}/approvals/{workflowId}/approve

{
  "action": "APPROVED",  // or "REJECTED"
  "comment": "Đồng ý. Hợp đồng hợp lý.",
  "conditions": []  // Điều kiện kèm theo (optional)
}
```

### **3. Lấy trạng thái approval**
```http
GET /api/v1/repository-management-service/files/{fileId}/approvals/{workflowId}

Response:
{
  "workflowId": "workflow-123",
  "status": "LEVEL_2_REVIEW",
  "currentLevel": 2,
  "progress": {
    "completedLevels": 1,
    "totalLevels": 3,
    "percentage": 33
  },
  "approvalHistory": [
    {
      "level": 1,
      "approver": "Nguyễn Team Lead",
      "action": "APPROVED",
      "comment": "OK",
      "actionAt": "2024-11-04T14:00:00Z"
    }
  ]
}
```

---

## 📱 IV. UI COMPONENTS CHO FRONTEND

### **1. Contract Upload Component**
```tsx
<ContractUploadForm
  onUploadSuccess={(contract) => {
    // Hiển thị contract data
    showContractPreview(contract);
    
    // Nếu cần approval, hiển thị button
    if (contract.contract.totalValue > 50000000) {
      showApprovalRequestButton();
    }
  }}
/>
```

### **2. Approval Request Button**
```tsx
<ApprovalRequestButton
  contractId={contract.documentId}
  contractValue={contract.contract.totalValue}
  onClick={() => {
    // Gọi API tạo approval workflow
    createApprovalRequest(contractId);
  }}
/>
```

### **3. Approval Timeline Component**
```tsx
<ApprovalTimeline
  workflowId={workflowId}
  steps={approvalSteps}
  currentLevel={currentLevel}
/>

// Hiển thị:
// ✅ Level 1: Team Lead - Approved (Nguyễn A, 04/11/2024 14:00)
// ⏳ Level 2: Manager - Pending (Chờ Trần B duyệt)
// 🔒 Level 3: Director - Locked
```

### **4. Approval Action Component (cho approver)**
```tsx
<ApprovalActionPanel
  workflowId={workflowId}
  contractData={contract}
  onApprove={(comment) => approveContract(workflowId, comment)}
  onReject={(reason) => rejectContract(workflowId, reason)}
/>
```

---

## ✅ V. CHECKLIST TRIỂN KHAI

### **Backend:**
- [ ] Tạo bảng `contract_approval_workflows` trong MongoDB
- [ ] Tạo bảng `approval_steps` và `approvers`
- [ ] Implement API: Create approval request
- [ ] Implement API: Approve / Reject
- [ ] Implement API: Get approval status
- [ ] Tạo background job check timeout
- [ ] Tạo notification service (email/in-app)

### **Frontend:**
- [ ] Component: Upload contract
- [ ] Component: Contract preview
- [ ] Component: Request approval button
- [ ] Component: Approval timeline
- [ ] Component: Approval action panel (approve/reject)
- [ ] Component: Approval notifications
- [ ] Page: My approvals (danh sách cần duyệt)
- [ ] Page: Approval history

### **Business Logic:**
- [ ] Config approval rules theo giá trị
- [ ] Config organization roles & permissions
- [ ] Workflow state machine
- [ ] Timeout handling
- [ ] Delegation logic (ủy quyền)
- [ ] Notification triggers

---

Đây là toàn bộ output khi upload hợp đồng và flow phê duyệt chi tiết! 🚀
