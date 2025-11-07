# 🔧 Fix Approval Status Display

## 📋 Vấn đề

Khi xem danh sách hợp đồng tại workspace (`/organizations/{id}/workspace`), status hiển thị là "DRAFT" thay vì các trạng thái phê duyệt thực tế như:
- `PENDING_APPROVAL` - Chờ phê duyệt
- `LEGAL_REVIEW` - Đang chờ Pháp lý duyệt  
- `FINANCE_REVIEW` - Đang chờ Tài chính duyệt
- `EXECUTIVE_REVIEW` - Đang chờ Điều hành duyệt
- `FULLY_APPROVED` - Đã phê duyệt hoàn toàn
- `REJECTED` - Bị từ chối

## 🔍 Nguyên nhân

Hệ thống có **2 loại status riêng biệt**:

### 1. Document Status (`overview.status`)
- Lưu trong FileEntity collection
- Các giá trị: `DRAFT`, `ACTIVE`, `PENDING`, `ARCHIVED`, etc.
- Dùng cho lifecycle của document

### 2. Approval Workflow Status (`overview.approvalStatus`)
- Được sync từ ContractApprovalWorkflow collection
- Các giá trị: `PENDING_APPROVAL`, `LEGAL_REVIEW`, `FULLY_APPROVED`, `REJECTED`, etc.
- Dùng cho quy trình phê duyệt

**Vấn đề:** Frontend đang ưu tiên đọc `status` thay vì `approvalStatus`

## ✅ Giải pháp

### 1. Backend (Đã có sẵn ✓)

Backend đã có logic sync workflow status vào file entity:

```java
// ContractApprovalService.java - Line 329-337
private void updateContractStatus(String contractId, WorkflowStatus status) {
    FileEntity contract = fileRepository.findById(contractId).orElse(null);
    if (contract != null) {
        Map<String, Object> overview = contract.getOverview();
        overview.put("approvalStatus", status.name()); // ✅ Lưu vào approvalStatus
        overview.put("approvalStatusUpdatedAt", LocalDateTime.now().toString());
        fileRepository.save(contract);
    }
}
```

### 2. Frontend - Các thay đổi

#### A. File Mapper (`file-mapper.ts`)

**Thêm mapping cho approvalStatus:**

```typescript
return {
  id: String(fileId),
  title: ov.title || `Document ${fileId}`,
  status: ov.status || 'DRAFT',
  // ✅ NEW: Map approval status from workflow
  approvalStatus: ov.approvalStatus || null,
  workflowStatus: ov.workflowStatus || null,
  // ... rest of fields
}
```

#### B. Organization Workspace (`OrganizationWorkspace.tsx`)

**1. Đổi thứ tự ưu tiên trong `getContractStatus()`:**

```typescript
const getContractStatus = (contract: any) => {
  // ✅ Priority: approvalStatus > workflowStatus > status
  return contract.approvalStatus 
    || contract.workflowStatus 
    || (contract.workflow?.status)
    || contract.status 
    || 'DRAFT';
};
```

**2. Cập nhật stats để đếm đúng các trạng thái:**

```typescript
const stats = {
  pendingApprovals: contracts.filter(c => {
    const status = getContractStatus(c);
    return status === 'PENDING_APPROVAL' || 
           status === 'LEGAL_REVIEW' || 
           status === 'FINANCE_REVIEW' || 
           status === 'EXECUTIVE_REVIEW';
  }).length,
  approved: contracts.filter(c => {
    const status = getContractStatus(c);
    return status === 'FULLY_APPROVED' || 
           status === 'LEGAL_APPROVED' || 
           status === 'FINANCE_APPROVED' || 
           status === 'EXECUTIVE_APPROVED';
  }).length,
  // ...
}
```

**3. Hiển thị status chi tiết cho pending contracts:**

```typescript
const getStatusDisplay = (status: string) => {
  switch(status) {
    case 'PENDING_APPROVAL': return '⏳ Chờ phê duyệt';
    case 'LEGAL_REVIEW': return '⚖️ Đang chờ Pháp lý duyệt';
    case 'FINANCE_REVIEW': return '💰 Đang chờ Tài chính duyệt';
    case 'EXECUTIVE_REVIEW': return '👔 Đang chờ Điều hành duyệt';
    default: return '⏳ Chờ duyệt';
  }
};
```

**4. Hiển thị status chi tiết cho approved/rejected contracts:**

```typescript
const getStatusInfo = (status: string) => {
  switch(status) {
    case 'FULLY_APPROVED':
      return { text: '✓ Đã phê duyệt hoàn toàn', className: 'bg-green-100 text-green-800' };
    case 'LEGAL_APPROVED':
      return { text: '⚖️ Pháp lý đã duyệt', className: 'bg-blue-100 text-blue-800' };
    case 'FINANCE_APPROVED':
      return { text: '💰 Tài chính đã duyệt', className: 'bg-blue-100 text-blue-800' };
    case 'EXECUTIVE_APPROVED':
      return { text: '👔 Điều hành đã duyệt', className: 'bg-blue-100 text-blue-800' };
    case 'REJECTED':
      return { text: '✗ Bị từ chối', className: 'bg-red-100 text-red-800' };
    // ...
  }
};
```

## 🧪 Cách test

### 1. Kiểm tra workspace hiển thị đúng status

1. Mở workspace: `http://localhost:3000/organizations/{orgId}/workspace`
2. Kiểm tra các hợp đồng có status:
   - ✅ Hợp đồng DRAFT → Hiển thị "📝 Nháp"
   - ✅ Hợp đồng đã gửi duyệt → Hiển thị "⏳ Chờ phê duyệt" hoặc "⚖️ Đang chờ Pháp lý duyệt"
   - ✅ Hợp đồng đã duyệt → Hiển thị "✓ Đã phê duyệt hoàn toàn"
   - ✅ Hợp đồng bị từ chối → Hiển thị "✗ Bị từ chối"

### 2. Kiểm tra luồng approval

1. Tạo hợp đồng mới với `totalValue` > 0
2. Gửi phê duyệt (nút "Gửi duyệt")
3. Kiểm tra status thay đổi:
   - Workspace: Status → `LEGAL_REVIEW` (⚖️ Đang chờ Pháp lý duyệt)
   - File detail: Hiển thị workflow với step hiện tại
4. Approve ở Legal level
5. Kiểm tra status thay đổi:
   - Nếu value < 100tr: `FULLY_APPROVED` (✓ Đã phê duyệt hoàn toàn)
   - Nếu value >= 100tr: `FINANCE_REVIEW` (💰 Đang chờ Tài chính duyệt)

### 3. Kiểm tra stats

1. Mở workspace
2. Kiểm tra số liệu thống kê:
   - ✅ "Chờ phê duyệt" đếm đúng số hợp đồng có status: PENDING_APPROVAL, LEGAL_REVIEW, FINANCE_REVIEW, EXECUTIVE_REVIEW
   - ✅ "Đã duyệt" đếm đúng số hợp đồng có status: FULLY_APPROVED, LEGAL_APPROVED, FINANCE_APPROVED, EXECUTIVE_APPROVED
   - ✅ "Từ chối" đếm đúng số hợp đồng có status: REJECTED, CANCELLED

## 📊 Workflow Status Flow

```
DRAFT (Nháp)
  ↓ [Gửi duyệt]
LEGAL_REVIEW (Đang chờ Pháp lý duyệt)
  ↓ [Approve]
LEGAL_APPROVED (Pháp lý đã duyệt)
  ↓ [Auto move if value >= 100tr]
FINANCE_REVIEW (Đang chờ Tài chính duyệt)
  ↓ [Approve]
FINANCE_APPROVED (Tài chính đã duyệt)
  ↓ [Auto move if value >= 500tr]
EXECUTIVE_REVIEW (Đang chờ Điều hành duyệt)
  ↓ [Approve]
EXECUTIVE_APPROVED (Điều hành đã duyệt)
  ↓ [Auto complete]
FULLY_APPROVED (Đã phê duyệt hoàn toàn)

[Reject tại bất kỳ step nào]
  ↓
REJECTED (Bị từ chối)
```

## 📝 Files Changed

1. ✅ `frontend/webapp/src/features/repositories/models/mappers/file-mapper.ts`
   - Thêm mapping cho `approvalStatus` và `workflowStatus`

2. ✅ `frontend/webapp/src/features/organizations/views/pages/OrganizationWorkspace/OrganizationWorkspace.tsx`
   - Đổi thứ tự ưu tiên status
   - Cập nhật stats calculation
   - Thêm status display mapping
   - Cập nhật filter logic

## 🎯 Kết quả mong đợi

- ✅ Workspace hiển thị đúng approval status thay vì document status
- ✅ Stats đếm đúng số hợp đồng theo từng trạng thái workflow
- ✅ Hiển thị chi tiết trạng thái phê duyệt (Legal/Finance/Executive)
- ✅ Phân biệt rõ ràng giữa các trạng thái: Chờ duyệt / Đã duyệt / Từ chối
- ✅ Tương thích với cả document status (DRAFT, ACTIVE) và workflow status

## 🔗 Related Files

- Backend: `backend/repository-management-service/src/main/java/com/devgo2003/docgo/repository_service/service/ContractApprovalService.java`
- Frontend Approval System: `frontend/webapp/src/features/approvals/`
- Documentation: `APPROVAL-SYSTEM-COMPLETE.md`

