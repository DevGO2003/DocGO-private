/**
 * Approval Action Modal
 * Modal để approve hoặc reject hợp đồng
 */

import React, { useState } from 'react';
import { Dialog, Button, Textarea } from '@shared/components';
import { ApprovalLevel, getApprovalLevelLabel } from '../types/approval.types';

interface ApprovalActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  action: 'approve' | 'reject';
  level: ApprovalLevel;
  contractTitle: string;
  onSubmit: (comment: string) => Promise<void>;
}

export const ApprovalActionModal: React.FC<ApprovalActionModalProps> = ({
  isOpen,
  onClose,
  action,
  level,
  contractTitle,
  onSubmit
}) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setError('');

    // Validate
    if (action === 'reject' && comment.trim().length < 10) {
      setError('Lý do từ chối phải có ít nhất 10 ký tự');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(comment);
      setComment('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isApprove = action === 'approve';

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={`${isApprove ? '✅ Phê duyệt' : '❌ Từ chối'} ${getApprovalLevelLabel(level)}`}
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : (isApprove ? '✅ Phê duyệt' : '❌ Từ chối')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Contract info */}
        <div className="p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Hợp đồng:</p>
          <p className="text-sm font-medium text-gray-900 mt-1">{contractTitle}</p>
        </div>

        {/* Comment input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isApprove ? 'Nhận xét (tùy chọn)' : 'Lý do từ chối (bắt buộc)'}
            {!isApprove && <span className="text-red-500"> *</span>}
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder={
              isApprove
                ? 'Nhập nhận xét của bạn...'
                : 'Vui lòng nêu rõ lý do từ chối và hướng sửa...'
            }
          />
          {!isApprove && (
            <p className="mt-1 text-xs text-gray-500">
              Tối thiểu 10 ký tự. Vui lòng nêu rõ lý do và hướng xử lý.
            </p>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
};
