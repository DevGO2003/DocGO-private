/**
 * Approval Workflow Status Component
 * Hiển thị trạng thái workflow phê duyệt
 */

import React from 'react';
import { Card, Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import {
  ContractApprovalWorkflow,
  ApprovalLevel,
  ApprovalAction,
  getApprovalLevelLabel,
  getCurrentLevel,
  canUserApprove
} from '../types/approval.types';

interface ApprovalWorkflowStatusProps {
  workflow: ContractApprovalWorkflow;
  userRole: string;
  userPermissions: string[];
  onApprove?: () => void;
  onReject?: () => void;
}

export const ApprovalWorkflowStatus: React.FC<ApprovalWorkflowStatusProps> = ({
  workflow,
  userRole,
  userPermissions,
  onApprove,
  onReject
}) => {
  const currentLevel = getCurrentLevel(workflow);
  const canApprove = currentLevel && canUserApprove(workflow, userRole, userPermissions);

  const getStepStatus = (level: ApprovalLevel) => {
    const approval = workflow.approvals.find(a => a.level === level);
    
    if (!approval) {
      return currentLevel === level ? 'current' : 'pending';
    }
    
    return approval.action === ApprovalAction.APPROVED ? 'approved' : 'rejected';
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'border-green-500 bg-green-50';
      case 'rejected':
        return 'border-red-500 bg-red-50';
      case 'current':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Trạng thái phê duyệt</h3>
        <p className="text-sm text-gray-500 mt-1">
          Hợp đồng: {workflow.contractTitle} • Giá trị: {workflow.contractValue.toLocaleString('vi-VN')} VND
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {workflow.requiredLevels.map((level, index) => {
          const status = getStepStatus(level);
          const approval = workflow.approvals.find(a => a.level === level);
          
          return (
            <div key={level} className="relative">
              {/* Connector line */}
              {index < workflow.requiredLevels.length - 1 && (
                <div className="absolute left-3 top-12 w-0.5 h-full bg-gray-200" />
              )}
              
              {/* Step */}
              <div className={`flex items-start gap-4 p-4 border-2 rounded-lg ${getStepColor(status)}`}>
                {/* Icon */}
                <div className="flex-shrink-0">
                  {status === 'approved' && <CommonIcon name="check" size={24} color="#16a34a" />}
                  {status === 'rejected' && <CommonIcon name="x" size={24} color="#ef4444" />}
                  {status === 'current' && <CommonIcon name="clock" size={24} color="#3b82f6" />}
                  {status === 'pending' && <CommonIcon name="alert-circle" size={24} color="#d1d5db" />}
                </div>
                
                {/* Content */}
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900">
                      {index + 1}. {getApprovalLevelLabel(level)}
                    </h4>
                    {status === 'current' && (
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                        Đang chờ duyệt
                      </span>
                    )}
                    {status === 'approved' && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        Đã duyệt
                      </span>
                    )}
                    {status === 'rejected' && (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Bị từ chối
                      </span>
                    )}
                  </div>
                  
                  {/* Approval details */}
                  {approval && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">{approval.approverName}</span>
                        {' '}({approval.approverEmail})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(approval.actionAt).toLocaleString('vi-VN')}
                      </p>
                      {approval.comment && (
                        <p className="mt-2 p-2 bg-white rounded border border-gray-200">
                          {approval.comment}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action buttons */}
      {canApprove && workflow.status !== 'FULLY_APPROVED' && workflow.status !== 'REJECTED' && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onReject}>
              ❌ Từ chối
            </Button>
            <Button onClick={onApprove}>
              ✅ Phê duyệt {currentLevel && getApprovalLevelLabel(currentLevel)}
            </Button>
          </div>
        </div>
      )}

      {/* Info message if cannot approve */}
      {currentLevel && !canApprove && workflow.status !== 'FULLY_APPROVED' && workflow.status !== 'REJECTED' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ℹ️ Bạn không có quyền phê duyệt bước này. Cần quyền: approve:{currentLevel.toLowerCase()}
          </p>
        </div>
      )}

      {/* Completed message */}
      {workflow.status === 'FULLY_APPROVED' && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium">
            ✅ Hợp đồng đã được phê duyệt hoàn toàn
          </p>
          <p className="text-xs text-green-600 mt-1">
            Hoàn thành lúc: {workflow.completedAt && new Date(workflow.completedAt).toLocaleString('vi-VN')}
          </p>
        </div>
      )}

      {/* Rejected message */}
      {workflow.status === 'REJECTED' && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">
            ❌ Hợp đồng bị từ chối
          </p>
          {workflow.approvals.find(a => a.action === ApprovalAction.REJECTED) && (
            <p className="text-xs text-red-600 mt-1">
              Bạn có thể sửa hợp đồng và gửi duyệt lại
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
