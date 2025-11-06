/**
 * EXAMPLE: Cách tích hợp Approval Workflow vào Contract Detail Page
 * 
 * File này là VÍ DỤ - Copy code này vào Contract Detail Page thực tế của bạn
 */

import React, { useState } from 'react';
import { Card, Button } from '@shared/components';
import { useContractApproval } from '../hooks/useContractApproval';
import { ApprovalWorkflowStatus } from '../components/ApprovalWorkflowStatus';
import { ApprovalActionModal } from '../components/ApprovalActionModal';
import { ApprovalLevel } from '../types/approval.types';

interface ContractDetailWithApprovalProps {
  contractId: string;
  contract: any; // Replace with your contract type
}

export const ContractDetailWithApproval: React.FC<ContractDetailWithApprovalProps> = ({
  contractId,
  contract
}) => {
  // 1. Get user info (thay bằng cách lấy user thực tế của bạn)
  const currentUser = {
    role: localStorage.getItem('userRole') || 'MEMBER',
    permissions: (localStorage.getItem('userPermissions') || '').split(',').filter(Boolean)
  };

  // 2. Use approval hook
  const {
    workflow,
    loading,
    error,
    submitting,
    currentLevel,
    userCanApprove,
    isCompleted,
    isPending,
    startApproval,
    approve,
    reject,
    refresh
  } = useContractApproval({
    contractId,
    userRole: currentUser.role,
    userPermissions: currentUser.permissions,
    autoRefresh: true, // Auto refresh every 30s
    refreshInterval: 30000
  });

  // 3. Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStartApprovalModal, setShowStartApprovalModal] = useState(false);

  // 4. Handle start approval
  const handleStartApproval = async (comment?: string) => {
    try {
      await startApproval(comment);
      setShowStartApprovalModal(false);
      alert('Đã gửi phê duyệt thành công!');
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  // 5. Handle approve
  const handleApprove = async (comment: string) => {
    try {
      await approve(comment);
      setShowApproveModal(false);
      alert('Đã phê duyệt thành công!');
      refresh(); // Refresh workflow
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  // 6. Handle reject
  const handleReject = async (comment: string) => {
    try {
      await reject(comment);
      setShowRejectModal(false);
      alert('Đã từ chối!');
      refresh();
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Contract Info */}
      <Card className="p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{contract.title}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Giá trị hợp đồng</p>
            <p className="text-lg font-semibold">
              {contract.value?.toLocaleString('vi-VN')} VND
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Trạng thái</p>
            <p className="text-lg font-semibold">{contract.status}</p>
          </div>
        </div>
      </Card>

      {/* START APPROVAL BUTTON */}
      {contract.status === 'PROCESSED' && !workflow && (
        <Card className="p-6 mb-6">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Hợp đồng đã được xử lý xong. Bạn có thể gửi phê duyệt.
            </p>
            <Button 
              onClick={() => setShowStartApprovalModal(true)}
              disabled={submitting}
            >
              📤 Gửi phê duyệt
            </Button>
          </div>
        </Card>
      )}

      {/* APPROVAL WORKFLOW STATUS */}
      {workflow && (
        <div className="mb-6">
          <ApprovalWorkflowStatus
            workflow={workflow}
            userRole={currentUser.role}
            userPermissions={currentUser.permissions}
            onApprove={() => setShowApproveModal(true)}
            onReject={() => setShowRejectModal(true)}
          />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <Card className="p-6 text-center">
          <p>Đang tải...</p>
        </Card>
      )}

      {/* Error state */}
      {error && (
        <Card className="p-6 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* MODALS */}
      
      {/* Start Approval Modal */}
      {showStartApprovalModal && (
        <ApprovalActionModal
          isOpen={showStartApprovalModal}
          onClose={() => setShowStartApprovalModal(false)}
          action="approve"
          level={ApprovalLevel.LEGAL}
          contractTitle={contract.title}
          onSubmit={async (comment) => {
            await handleStartApproval(comment);
          }}
        />
      )}

      {/* Approve Modal */}
      {currentLevel && (
        <ApprovalActionModal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          action="approve"
          level={currentLevel}
          contractTitle={contract.title}
          onSubmit={handleApprove}
        />
      )}

      {/* Reject Modal */}
      {currentLevel && (
        <ApprovalActionModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          action="reject"
          level={currentLevel}
          contractTitle={contract.title}
          onSubmit={handleReject}
        />
      )}
    </div>
  );
};
