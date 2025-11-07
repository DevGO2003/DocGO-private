import React from 'react';
import { ApprovalWorkflowStatus } from '@features/approvals/components/ApprovalWorkflowStatus';
import { ContractApprovalWorkflow } from '@features/approvals/types/approval.types';

interface ApprovalTabProps {
  workflow: ContractApprovalWorkflow | null;
  userRole: string;
  userPermissions: string[];
  onApprove?: () => void;
  onReject?: () => void;
}

export const ApprovalTab: React.FC<ApprovalTabProps> = ({
  workflow,
  userRole,
  userPermissions,
  onApprove,
  onReject
}) => {
  if (!workflow) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: '#f3f4f6' }}>
          <svg className="w-8 h-8" style={{ color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2" style={{ color: '#374151' }}>
          Chưa có quy trình phê duyệt
        </h3>
        <p style={{ color: '#6b7280' }}>
          Hợp đồng này chưa được gửi phê duyệt. Click nút "Gửi duyệt" ở trên để bắt đầu quy trình phê duyệt.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ApprovalWorkflowStatus
        workflow={workflow}
        userRole={userRole}
        userPermissions={userPermissions}
        onApprove={onApprove}
        onReject={onReject}
      />
    </div>
  );
};
