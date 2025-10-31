# Organization & Contract Management Workflow

## 🎭 Roles & Permissions

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

## 📋 PHẦN 1: ĐĂNG KÝ VÀ ĐĂNG NHẬP LẦN ĐẦU

### **Bước 1: User mới đăng ký**
- User đăng ký tài khoản → Xác thực email → Đăng nhập
- Hệ thống kiểm tra: User có thuộc tổ chức nào không?

### **Bước 2: Nếu chưa có tổ chức**
Hiển thị màn hình welcome:
- "Bạn chưa thuộc tổ chức nào"
- **Lựa chọn 1:** Tạo tổ chức mới (Trở thành Owner)
- **Lựa chọn 2:** Kiểm tra email xem có lời mời không

### **Bước 3: Tạo tổ chức mới**
**Form nhập:**
- Tên tổ chức (bắt buộc)
- Mã tổ chức (tùy chọn)
- Mô tả, địa chỉ, email, số điện thoại

**Submit → Backend tự động:**
- Tạo Organization
- Set user = Owner (ownerUserId)
- Khởi tạo workflow mặc định 3 cấp
- Khởi tạo default roles & permissions
- Thêm user vào members đầu tiên

### **Bước 4: Setup Wizard (tùy chọn)**
Wizard 3 bước:
1. **Mời thành viên** (email + role selection)
2. **Chỉ định Managers** với permissions
3. **Upload hợp đồng** đầu tiên

Có thể skip và vào dashboard ngay.

---

## 🔄 PHẦN 2: CHUYỂN ĐỔI GIỮA CÁC TỔ CHỨC

### **Multi-Organization Support**
- User có thể thuộc nhiều tổ chức với vai trò khác nhau
- Mỗi tổ chức độc lập: contracts, members, settings riêng

### **Organization Selector**
```
Header: Logo | [Tổ chức A ▼] | User Menu

Dropdown hiển thị:
  Công ty A (Owner) ← Active
  Công ty B (Manager)  
  Công ty C (Member)
  ─────────────────
  Tạo tổ chức mới
```

### **Switching Flow**
1. User click chọn "Công ty B"
2. Frontend gọi: `POST /api/v1/users/me/switch-organization`
3. Backend update `lastActiveOrg`
4. Frontend reload dashboard với data của Công ty B
5. Update localStorage: `activeOrgId`

### **Data Isolation**
- Dashboard chỉ hiển thị data của tổ chức active
- Contracts, members, settings đều theo context org active
- URL structure: `/org/{orgId}/dashboard`

---

## 👥 PHẦN 3: QUẢN LÝ THÀNH VIÊN

### **Vai trò có quyền:**
- **Owner:** Toàn quyền
- **Manager có permission `member:invite`:** Có quyền mời

### **Flow mời thành viên:**

#### **Bước 1: Vào Members Management**
- Navigate: `Settings → Members`
- Hiển thị bảng danh sách:
  - Cột: Tên | Email | Vai trò | Quyền hạn | Actions
  - Nút: `[+ Invite Member]`

#### **Bước 2: Invite Member Form**
- Nhập email người cần mời
- Chọn vai trò:
  - ⭕ Member (Nhân viên cơ bản)
  - ⭕ Manager (Quản lý & phê duyệt)

#### **Bước 3: Nếu chọn Manager → Chọn Permissions**
```
☐ Phê duyệt pháp lý (approve:legal)
☐ Phê duyệt tài chính (approve:finance)
☐ Phê duyệt cấp cao (approve:executive)
☐ Mời thành viên (member:invite)
☐ Quản lý settings (org:settings)
```

#### **Bước 4: Gửi lời mời**
Backend tạo Invitation:
- email, organizationId, roleIds
- token (UUID), expiresAt (7 days)
- status = PENDING

Gửi email với link: `/invitations/accept?token=xxx`

#### **Bước 5: Người được mời accept**
1. Click link → Login (hoặc Register nếu chưa có account)
2. Xác nhận chấp nhận
3. Backend tạo OrganizationMembership:
   - userId, organizationId, role, permissions
   - status = ACTIVE

### **Quản lý thành viên sau khi joined:**
Owner có thể:
- Thăng cấp Member → Manager
- Hạ cấp Manager → Member  
- Thêm/bớt permissions của Manager
- Remove member (trừ chính mình)
- Transfer ownership

---

## 📄 PHẦN 4: TẢI LÊN VÀ PHÊ DUYỆT HỢP ĐỒNG

### **AI CÓ THỂ UPLOAD HỢP ĐỒNG?**
✅ **Tất cả roles đều có thể upload:**
- **Owner** - Có thể upload
- **Manager** - Có thể upload
- **Member** - Có thể upload

**Nguyên tắc:** Mọi người trong tổ chức đều có thể tạo/upload hợp đồng.

---

### **UPLOAD FLOW**

#### **Bước 1: Upload file (Owner/Manager/Member)**
- Navigate: `Contracts → [+ Upload New Contract]`
- Chọn file PDF hoặc hình ảnh
- Upload → Backend nhận file

#### **Bước 2: OCR Processing**
- Backend gửi file đến Automation Service
- Automation xử lý OCR trích xuất:
  - Số hợp đồng, Tên hợp đồng
  - Bên A, Bên B
  - Giá trị hợp đồng
  - Ngày ký, Ngày hiệu lực, Ngày hết hạn
- Trả kết quả về Repository Service

#### **Bước 3: Review & Edit**
- Frontend hiển thị form với thông tin đã trích xuất
- Member review và sửa nếu cần
- Có thể thêm: Loại HĐ, Tags, Ghi chú
- Save as Draft (status = DRAFT)

#### **Bước 4: Submit for Approval**
- Member click `[Submit for Approval]`
- Status: `DRAFT → PENDING_APPROVAL`
- Backend đánh giá giá trị để chọn workflow

---

### **WORKFLOW TỰ ĐỘNG THEO GIÁ TRỊ**

> **QUAN TRỌNG:** Owner có technical permission approve NHƯNG theo best practice, Owner **KHÔNG NÊN** tự approve hợp đồng của chính mình. Workflow dành cho Managers.

---

#### **Case 1: Hợp đồng < 100M VND**

**Workflow: Basic Approval (1 bước)**

**Ai có thể approve:**
- ✅ Manager có **BẤT KỲ** permission approve nào:
  - `approve:legal` HOẶC
  - `approve:finance` HOẶC
  - `approve:executive`

**Flow:**
```
Member upload HĐ 80M
  ↓
Submit for approval
  ↓
Status: PENDING_APPROVAL
  ↓
Notification → TẤT CẢ Managers có approve permission
  ↓
Manager A (có approve:legal) → Click [Approve]
  ↓
Status: APPROVED ✅
```

**Đặc điểm:**
- Chỉ cần 1 Manager bất kỳ approve
- Manager nào approve trước thì OK
- Không cần tuần tự

**Ví dụ:**
```
Org có 3 Managers:
- Manager A: approve:legal
- Manager B: approve:finance  
- Manager C: approve:executive

→ Cả 3 đều nhận notification
→ Manager B approve trước → APPROVED ✅
```

---

#### **Case 2: Hợp đồng 100M - 1B VND**

**Workflow: Advanced Approval (2 bước tuần tự)**

**Bước 1: Phê duyệt pháp lý**

**Ai có thể approve:**
- ✅ Manager có permission `approve:legal`

**Flow:**
```
Member upload HĐ 500M
  ↓
Submit for approval
  ↓
Status: PENDING_APPROVAL
Step 1: Legal Review (PENDING)
Step 2: Finance Review (WAITING)
  ↓
Notification → Managers có approve:legal
  ↓
Manager Legal → Review & [Approve]
  ↓
Step 1: APPROVED ✅
Step 2: Finance Review (PENDING) ← Tự động chuyển
  ↓
Notification → Managers có approve:finance
```

**Timeout:** 48 giờ

**Nếu có nhiều Manager Legal:**
- Manager Legal A
- Manager Legal B
- Manager Legal C

→ Chỉ cần 1 người approve là đủ

---

**Bước 2: Phê duyệt tài chính**

**Ai có thể approve:**
- ✅ Manager có permission `approve:finance`

**Flow:**
```
Step 1: APPROVED ✅
  ↓
Step 2: Finance Review (PENDING)
  ↓
Notification → Managers có approve:finance
  ↓
Manager Finance → Review & [Approve]
  ↓
Step 2: APPROVED ✅
  ↓
Status: APPROVED ✅ (Hoàn tất)
```

**Timeout:** 48 giờ

**Đặc điểm:**
- **Tuần tự:** Phải qua Legal trước mới đến Finance
- Mỗi step chỉ cần 1 Manager approve

---

#### **Case 3: Hợp đồng >= 1B VND**

**Workflow: Executive Approval (3 bước tuần tự)**

**Bước 1: Phê duyệt pháp lý**
- Giống Case 2, Bước 1
- Manager có `approve:legal`
- Timeout: 48 giờ

**Bước 2: Phê duyệt tài chính**
- Giống Case 2, Bước 2
- Manager có `approve:finance`
- Timeout: 48 giờ

**Bước 3: Phê duyệt cấp điều hành**

**Ai có thể approve:**
- ✅ Manager có permission `approve:executive`

**Flow:**
```
Member upload HĐ 1.5B
  ↓
Step 1: Legal (PENDING) → Approved ✅
  ↓
Step 2: Finance (PENDING) → Approved ✅
  ↓
Step 3: Executive (PENDING)
  ↓
Notification → Managers có approve:executive
  ↓
Manager Executive (CEO/Giám đốc) → Review & [Approve]
  ↓
Step 3: APPROVED ✅
  ↓
Status: APPROVED ✅ (Hoàn tất)
```

**Timeout:** 72 giờ (dài hơn vì quan trọng)

**Đặc điểm:**
- **3 bước tuần tự:** Legal → Finance → Executive
- Mỗi step chỉ cần 1 Manager approve
- Không thể skip step

**Ví dụ đầy đủ:**
```
Org có 5 Managers:
- Manager A: approve:legal, member:invite
- Manager B: approve:legal
- Manager C: approve:finance
- Manager D: approve:finance, org:settings
- Manager E: approve:executive

Workflow HĐ 1.5B:
Step 1: A hoặc B approve (chỉ cần 1)
Step 2: C hoặc D approve (chỉ cần 1)
Step 3: E approve (chỉ có 1 người)
```

---

### **XỬ LÝ REJECTION**

**Ai có thể reject:**
- ✅ Manager đang xét duyệt ở step hiện tại
- ✅ Owner (có thể reject bất kỳ lúc nào)

**Flow:**
```
Contract đang ở Step 2: Finance Review
  ↓
Manager Finance → Review & [Reject]
  Lý do: "Giá trị quá cao, cần thương lượng lại"
  ↓
Workflow DỪNG ngay lập tức
  ↓
Status: REJECTED ❌
  ↓
Notification → Member (người upload)
  ↓
Member xem lý do → Chỉnh sửa → Submit lại
  ↓
Workflow restart từ Step 1
```

**Đặc điểm:**
- Reject ở bất kỳ step nào → Dừng toàn bộ workflow
- Không tiếp tục sang step tiếp theo
- Member phải edit và submit lại từ đầu

---

### **TIMEOUT & ESCALATION**

**Timeout cho mỗi step:**
- Basic Approval (< 100M): 24 giờ
- Legal Review: 48 giờ
- Finance Review: 48 giờ
- Executive Review: 72 giờ

**Khi timeout:**
```
Step 1: Legal Review (PENDING)
  ↓
48 giờ qua, chưa có Manager approve
  ↓
Auto Escalation:
  1. Email nhắc nhở → Managers có approve:legal
  2. Notification → Owner
  3. Status: PENDING_ESCALATED ⚠️
  ↓
Owner có 2 options:
  Option 1: Nhắc Manager xử lý
  Option 2: Owner Override (approve trực tiếp)
```

---

### **OWNER OVERRIDE (Trường hợp đặc biệt)**

**Khi nào dùng Owner Override:**
1. ❌ Tổ chức chỉ có 1 Owner, không có Manager
2. ❌ Thiếu Manager cho step cụ thể
3. ⚠️ Timeout quá lâu, cần xử lý gấp
4. ⚠️ Trường hợp khẩn cấp

**Flow cho Case: Thiếu Manager**

#### **Scenario 1: Tổ chức chỉ có Owner**
```
Owner upload HĐ 1.5B
  ↓
Click [Submit for Approval]
  ↓
System check: Cần 3 steps
  - approve:legal: ❌ Không có Manager
  - approve:finance: ❌ Không có Manager
  - approve:executive: ❌ Không có Manager
  ↓
⚠️ Warning Modal hiện ra:

┌──────────────────────────────────────┐
│ ⚠️ Workflow Cannot Start             │
├──────────────────────────────────────┤
│ This contract requires approval from:│
│                                       │
│ ❌ Legal Manager (Missing)           │
│ ❌ Finance Manager (Missing)         │
│ ❌ Executive Manager (Missing)       │
│                                       │
│ Options:                              │
│                                       │
│ [Invite Managers] (Recommended)      │
│ [Owner Override] (Not Recommended)   │
│ [Save as Draft]                      │
└──────────────────────────────────────┘
```

**Option 1: Invite Managers** ✅
```
Owner click [Invite Managers]
  ↓
Navigate to Members page
  ↓
Invite 3 người:
  - Manager A: approve:legal
  - Manager B: approve:finance
  - Manager C: approve:executive
  ↓
Họ accept invitation
  ↓
Quay lại contract → Submit lại
  ↓
Workflow chạy bình thường ✅
```

**Option 2: Owner Override** ⚠️
```
Owner click [Owner Override]
  ↓
Confirmation Modal:

┌──────────────────────────────────────┐
│ ⚠️ Owner Override Confirmation       │
├──────────────────────────────────────┤
│ You are bypassing the 3-level        │
│ approval workflow.                    │
│                                       │
│ This action will:                     │
│ • Skip Legal review                  │
│ • Skip Finance review                │
│ • Skip Executive review              │
│ • Approve contract immediately       │
│                                       │
│ Reason (required):                   │
│ [Organization has only 1 member...] │
│                                       │
│ ⚠️ This will be logged for audit     │
│                                       │
│ [Cancel] [⚠️ Confirm Override]        │
└──────────────────────────────────────┘

Owner enter reason → [Confirm]
  ↓
Status: APPROVED ⚠️
Approval Method: OWNER_OVERRIDE
Approved by: Owner Name
Reason: "Organization has only 1 member"
Timestamp: Oct 30, 2025 12:45 PM
  ↓
⚠️ Warning badge hiển thị trên contract
```

#### **Scenario 2: Thiếu Manager cho step cụ thể**
```
Org có:
- Manager A: approve:legal ✅
- Manager B: approve:finance ✅
- Không có Manager Executive ❌

Owner upload HĐ 1.5B
  ↓
Submit → Workflow start
  ↓
Step 1: Legal → Manager A approve ✅
Step 2: Finance → Manager B approve ✅
Step 3: Executive → ❌ Không có Manager
  ↓
System auto-escalate to Owner:

┌──────────────────────────────────────┐
│ ⚠️ Step 3 Cannot Proceed             │
├──────────────────────────────────────┤
│ No Manager with approve:executive    │
│ permission found.                     │
│                                       │
│ [Invite Executive Manager]           │
│ [Owner Override This Step]           │
└──────────────────────────────────────┘
```

---

### **AI CÓ THỂ XEM HỢP ĐỒNG?**

**Xem Contract Details:**
✅ **Owner** - Xem tất cả contracts
✅ **Manager** - Xem tất cả contracts
✅ **Member** - Xem contracts của mình + contracts đã approved

**Xem Pending Approvals:**
✅ **Owner** - Xem tất cả pending
✅ **Manager có approve permission** - Xem contracts cần mình approve
❌ **Manager không có approve permission** - Không xem
❌ **Member** - Không xem pending approvals

**Approve Contract:**
❌ **Owner** - Không nên approve (chỉ override khi cần)
✅ **Manager có permission tương ứng** - Approve theo workflow
❌ **Manager không có permission** - Không approve được
❌ **Member** - Không approve được

---

### **TÓM TẮT PERMISSIONS & WORKFLOWS**

#### **Upload Contract:**
| Role    | Can Upload? |
|---------|-------------|
| Owner   | ✅ Yes      |
| Manager | ✅ Yes      |
| Member  | ✅ Yes      |

#### **Approve Contract (theo workflow):**

**< 100M VND:**
| Role/Permission        | Can Approve? |
|------------------------|--------------|
| Manager (approve:legal)| ✅ Yes       |
| Manager (approve:finance)| ✅ Yes     |
| Manager (approve:executive)| ✅ Yes   |
| Manager (no approve)   | ❌ No        |
| Member                 | ❌ No        |

**100M - 1B VND:**
| Step | Permission Needed | Can Skip? |
|------|-------------------|-----------|
| 1    | approve:legal     | ❌ No     |
| 2    | approve:finance   | ❌ No     |

**>= 1B VND:**
| Step | Permission Needed | Can Skip? |
|------|-------------------|-----------|
| 1    | approve:legal     | ❌ No     |
| 2    | approve:finance   | ❌ No     |
| 3    | approve:executive | ❌ No     |

#### **Owner Override:**
| Scenario | When? | Recommended? |
|----------|-------|--------------|
| No Manager at all | ✅ Can | ⚠️ No, invite first |
| Missing specific permission | ✅ Can | ⚠️ No, invite first |
| Timeout emergency | ✅ Can | ⚠️ Case by case |
| Owner uploaded contract | ✅ Can | ❌ Never |

**Nguyên tắc:** Owner Override là **escape hatch**, không phải workflow thường xuyên!

---

### **XỬ LÝ NHIỀU HỢP ĐỒNG + NHIỀU MANAGER**

**Problem:** Có 2+ hợp đồng cùng pending, nhiều Manager cùng permission, làm sao phân bổ công việc?

**Solution: First-Come-First-Served với Optimistic Locking**

#### **Scenario:**
```
Org có 3 Legal Managers:
- Manager A: approve:legal
- Manager B: approve:legal  
- Manager C: approve:legal

Có 2 hợp đồng:
- Contract #1: 500M VND (PENDING_LEGAL)
- Contract #2: 800M VND (PENDING_LEGAL)
```

#### **UI: Pending Approvals List**

**Manager A login:**
```
┌─────────────────────────────────────────────────┐
│ 📋 Pending Legal Approvals (2)                  │
├─────────────────────────────────────────────────┤
│ Sort by: [Oldest First ▼]                      │
│                                                  │
│ Contract #1 - 500M VND                          │
│ Submitted: 2 hours ago                          │
│ Status: PENDING_LEGAL                           │
│ [Review & Approve] ──────────►                  │
│                                                  │
│ ─────────────────────────────────────────────── │
│                                                  │
│ Contract #2 - 800M VND                          │
│ Submitted: 1 hour ago                           │
│ Status: PENDING_LEGAL                           │
│ [Review & Approve] ──────────►                  │
└─────────────────────────────────────────────────┘
```

#### **Flow: Managers tự phân bổ**

**Step 1: Manager A chọn Contract #1**
```
Manager A → Click [Review & Approve] on Contract #1
  ↓
Navigate to Contract Detail Page
  ↓
Manager A đang review... (chưa approve)
```

**Step 2: Manager B chọn Contract #2**
```
Manager B login → Vào Pending Approvals
  ↓
Thấy 2 contracts: #1, #2
  ↓
Manager B chọn Contract #2 (khác với Manager A)
  ↓
Navigate to Contract Detail Page
  ↓
Manager B đang review...
```

**Step 3: Approve và Optimistic Lock**

**Case 1: Managers approve contracts khác nhau (OK)**
```
10:30:00 - Manager A approve Contract #1
  ↓
Backend: Contract #1 → APPROVED_LEGAL ✅

10:30:10 - Manager B approve Contract #2
  ↓
Backend: Contract #2 → APPROVED_LEGAL ✅

Result: Cả 2 contracts đều approved ✅
```

**Case 2: Cả 2 cùng chọn Contract #1 (Race Condition)**
```
Manager A và B đều đang review Contract #1

10:30:00 - Manager A click [Approve]
  ↓
Backend check: Contract #1 status = PENDING_LEGAL
  ↓
Update: Contract #1 → APPROVED_LEGAL ✅
Approved by: Manager A
  ↓
Response: Success

10:30:02 - Manager B click [Approve] (2 giây sau)
  ↓
Backend check: Contract #1 status = APPROVED_LEGAL
  ↓
Error: Already approved!
  ↓
Response to Manager B:

┌──────────────────────────────────────┐
│ ℹ️ Contract Already Approved         │
├──────────────────────────────────────┤
│ This contract was approved by        │
│ Manager A at 10:30:00 AM.            │
│                                       │
│ Your approval is no longer needed.   │
│                                       │
│ [Back to Pending List]               │
└──────────────────────────────────────┘

Manager B quay lại list → Chọn Contract #2
```

#### **Backend Implementation: Optimistic Lock**

**Database Schema:**
```sql
contracts (
  id VARCHAR PRIMARY KEY,
  status VARCHAR,  -- PENDING_LEGAL, APPROVED_LEGAL, etc.
  version INT,     -- Optimistic lock version
  ...
)

workflow_steps (
  id VARCHAR PRIMARY KEY,
  contract_id VARCHAR,
  step_number INT,
  step_type VARCHAR,  -- LEGAL, FINANCE, EXECUTIVE
  status VARCHAR,     -- PENDING, APPROVED, REJECTED
  approved_by VARCHAR,
  approved_at TIMESTAMP,
  ...
)
```

**Java Code:**
```java
@Service
@Transactional
public class ApprovalService {
    
    public void approveStep(String contractId, String managerId) {
        // 1. Get contract with lock
        Contract contract = contractRepository
            .findByIdForUpdate(contractId)
            .orElseThrow(() -> new NotFoundException("Contract not found"));
        
        // 2. Get current workflow step
        WorkflowStep currentStep = contract.getCurrentStep();
        
        // 3. Check if already approved
        if (currentStep.getStatus() == StepStatus.APPROVED) {
            throw new AlreadyApprovedException(
                "Step already approved by " + currentStep.getApprovedBy() +
                " at " + currentStep.getApprovedAt()
            );
        }
        
        // 4. Verify manager has permission
        if (!hasPermission(managerId, currentStep.getRequiredPermission())) {
            throw new UnauthorizedException("No permission to approve");
        }
        
        // 5. Approve step
        currentStep.setStatus(StepStatus.APPROVED);
        currentStep.setApprovedBy(managerId);
        currentStep.setApprovedAt(LocalDateTime.now());
        
        // 6. Move to next step or complete
        if (contract.hasNextStep()) {
            contract.moveToNextStep();
        } else {
            contract.setStatus(ContractStatus.APPROVED);
        }
        
        // 7. Save (version auto-incremented by JPA)
        contractRepository.save(contract);
        
        log.info("Contract {} approved by {} at step {}",
            contractId, managerId, currentStep.getStepNumber());
    }
}
```

**Frontend Handling:**
```typescript
const handleApprove = async () => {
  try {
    setLoading(true);
    
    await approveContract(contractId, managerId);
    
    toast.success('Contract approved successfully!');
    navigate('/pending-approvals');
    
  } catch (error) {
    if (error.code === 'ALREADY_APPROVED') {
      // Show modal: Already approved by someone else
      showAlreadyApprovedModal({
        approvedBy: error.approvedBy,
        approvedAt: error.approvedAt,
      });
    } else {
      toast.error(error.message);
    }
  } finally {
    setLoading(false);
  }
};
```

#### **Best Practices cho Managers:**

**1. Tự phân bổ công việc hợp lý:**
- Ưu tiên contracts cũ nhất (oldest first)
- Ưu tiên contracts urgent
- Tránh cả team cùng review 1 contract

**2. Communication:**
- Team có thể dùng chat/comment: "Tôi đang review #1"
- Hoặc sort theo "Oldest First" để tự nhiên phân tán

**3. Efficient workflow:**
```
3 Managers + 6 Contracts pending:
- Manager A: Review #1, #2
- Manager B: Review #3, #4
- Manager C: Review #5, #6

→ Parallel processing
→ Faster throughput
```

#### **UI Features hỗ trợ:**

**Real-time counter:**
```
┌─────────────────────────────────────────────────┐
│ 📋 Pending Legal Approvals (2)                  │
│                                                  │
│ 👥 3 Legal Managers online                      │
│ ⏱️ Average approval time: 15 minutes            │
│                                                  │
│ [Refresh List]                                  │
└─────────────────────────────────────────────────┘
```

**Live updates (WebSocket - Optional):**
```typescript
// Contract approved → Remove from list automatically
socket.on('contract-approved', (contractId) => {
  if (currentList.includes(contractId)) {
    removeFromList(contractId);
    toast.info('Contract was approved by another manager');
  }
});
```

---

## ✍️ PHẦN 5: KÝ ĐIỆN TỬ HỢP ĐỒNG

### **Điều kiện:** Status = APPROVED

#### **Bước 1: Setup E-Signature**
- Owner/Manager vào Contract Detail
- Click `[Setup E-Signature]`
- Modal hiện ra:
  - Chọn người ký từ tổ chức
  - Thêm email người ký đối tác (nếu có)
  - Thứ tự ký (tuần tự hoặc song song)

#### **Bước 2: Gửi yêu cầu ký**
- Mỗi người nhận email với link + token
- Link dẫn đến: `/contracts/{id}/sign?token=xxx`

#### **Bước 3: Thực hiện ký**
- Người ký click link → Xem hợp đồng
- Đặt chữ ký điện tử vào vị trí quy định
- Xác nhận ký → Lưu chữ ký

#### **Bước 4: Hoàn tất**
- Khi tất cả đã ký xong
- Status: `APPROVED → SIGNED`
- Generate PDF final với tất cả chữ ký
- Lưu trữ vĩnh viễn
- Notification → Tất cả bên liên quan

---

## 📊 Summary Flow Diagram

```
User Register/Login
      ↓
Has Organization? 
   Yes → Select Org → Dashboard
   No  → Create Org / Check Invitations
      ↓
Create Organization
      ↓
Setup Wizard (Optional)
      ↓
Dashboard with Organization Context
      ↓
Upload Contract → OCR → Review → Submit
      ↓
Auto-select Workflow based on Value
      ↓
Approval Steps (Legal → Finance → Executive)
      ↓
Approved → Setup E-Signature → Signing
      ↓
Signed & Stored
```

---

## 🎯 Key Features

### **Multi-Organization**
- ✅ User thuộc nhiều tổ chức
- ✅ Switch context dễ dàng
- ✅ Data isolation per organization

### **Role-Based Access Control**
- ✅ 3 roles: Owner, Manager, Member
- ✅ 5 granular permissions cho Manager
- ✅ Owner bypass permissions

### **Smart Workflow**
- ✅ Auto-select workflow theo giá trị
- ✅ Sequential approval steps
- ✅ Timeout & escalation
- ✅ Rejection handling

### **E-Signature Integration**
- ✅ Multi-party signing
- ✅ Sequential or parallel signing
- ✅ Token-based access
- ✅ Final PDF generation

---

**Happy Managing! 🚀**
