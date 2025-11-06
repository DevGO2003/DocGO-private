# 🚀 Quick Start - Approval System

## 📦 1. Install (Đã có sẵn)

Tất cả files đã được tạo trong folder `features/approvals/`

## ⚡ 2. Sử dụng trong 3 bước

### Bước 1: Thêm vào Contract Detail Page

```tsx
import { useContractApproval, ApprovalWorkflowStatus, ApprovalActionModal } from '@features/approvals';

const YourContractPage = ({ contractId }) => {
  const { workflow, approve, reject, currentLevel } = useContractApproval({
    contractId,
    userRole: 'MANAGER',
    userPermissions: ['approve:legal']
  });

  return (
    <div>
      {workflow && (
        <ApprovalWorkflowStatus
          workflow={workflow}
          userRole="MANAGER"
          userPermissions={['approve:legal']}
          onApprove={() => setShowApproveModal(true)}
          onReject={() => setShowRejectModal(true)}
        />
      )}
    </div>
  );
};
```

### Bước 2: Thêm Route cho Dashboard

```tsx
// App.tsx or routes/index.tsx
import { MyApprovalsDashboard } from '@features/approvals';

<Route path="/approvals/me" element={<MyApprovalsDashboard />} />
```

### Bước 3: Configure .env

```env
REACT_APP_REPOSITORY_SERVICE_URL=http://localhost:8002/api/v1/repository-management-service
```

## 📖 Docs đầy đủ

Xem: `documents/APPROVAL-SYSTEM-INTEGRATION-GUIDE.md`

## 💡 Example

Xem: `examples/ContractDetailWithApproval.example.tsx`

## 🎯 Main Components

- `ApprovalWorkflowStatus` - Timeline hiển thị workflow
- `ApprovalActionModal` - Modal approve/reject
- `MyApprovalsDashboard` - Dashboard chờ duyệt
- `useContractApproval` - Hook quản lý workflow

## 🔗 API

```tsx
// Start approval
await approvalApi.startApproval(contractId, { comment });

// Approve
await approvalApi.approve(contractId, { comment });

// Reject
await approvalApi.reject(contractId, { comment });

// Get workflow
const workflow = await approvalApi.getWorkflow(contractId);
```

---

**That's it! 🎉**
