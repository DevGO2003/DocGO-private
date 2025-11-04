/**
 * My Approvals Dashboard
 * Trang dashboard hiển thị các hợp đồng chờ phê duyệt
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { approvalApi } from '../api/approvalApi';
import {
  ContractApprovalWorkflow,
  getApprovalLevelLabel,
  getWorkflowStatusLabel,
  getCurrentLevel
} from '../types/approval.types';

export const MyApprovalsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [pendingApprovals, setPendingApprovals] = useState<ContractApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    loadPendingApprovals();
  }, [page]);

  const loadPendingApprovals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await approvalApi.getMyPendingApprovals(page, 10);
      setPendingApprovals(response.content);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách phê duyệt');
    } finally {
      setLoading(false);
    }
  };

  const getWaitingTime = (submittedAt: string): string => {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Vừa xong';
    if (diffHours < 24) return `${diffHours} giờ trước`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ngày trước`;
  };

  if (loading && pendingApprovals.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
        <button
          onClick={loadPendingApprovals}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Phê duyệt của tôi</h1>
        <p className="mt-2 text-gray-600">
          Danh sách hợp đồng đang chờ bạn phê duyệt
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Chờ phê duyệt</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{pendingApprovals.length}</p>
            </div>
            <CommonIcon name="clock" size={48} color="#93c5fd" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã duyệt hôm nay</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <CommonIcon name="check" size={48} color="#86efac" />
          </div>
        </Card>

        <Card className="p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đã từ chối</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <CommonIcon name="x" size={48} color="#fca5a5" />
          </div>
        </Card>
      </div>

      {/* Pending list */}
      {pendingApprovals.length === 0 ? (
        <Card className="p-12 text-center">
          <CommonIcon name="file-text" size={64} color="#d1d5db" className="mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có hợp đồng chờ phê duyệt
          </h3>
          <p className="text-gray-600">
            Các hợp đồng cần bạn phê duyệt sẽ xuất hiện ở đây
          </p>
        </Card>
      ) : (
        <Card>
          <div className="divide-y divide-gray-200">
            {pendingApprovals.map((workflow) => {
              const currentLevel = getCurrentLevel(workflow);
              
              return (
                <div
                  key={workflow.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/contracts/${workflow.contractId}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      {/* Title */}
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {workflow.contractTitle}
                      </h3>

                      {/* Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          💰 {workflow.contractValue.toLocaleString('vi-VN')} VND
                        </span>
                        <span className="flex items-center gap-1">
                          👤 {workflow.createdByName}
                        </span>
                        <span className="flex items-center gap-1">
                          🕐 {getWaitingTime(workflow.submittedAt)}
                        </span>
                      </div>

                      {/* Current level */}
                      {currentLevel && (
                        <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          Đang chờ: {getApprovalLevelLabel(currentLevel)}
                        </div>
                      )}

                      {/* Progress */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2">
                          {workflow.requiredLevels.map((level, index) => (
                            <React.Fragment key={level}>
                              <div
                                className={`flex-1 h-2 rounded-full ${
                                  index < workflow.currentLevelIndex
                                    ? 'bg-green-500'
                                    : index === workflow.currentLevelIndex
                                    ? 'bg-blue-500'
                                    : 'bg-gray-200'
                                }`}
                              />
                              {index < workflow.requiredLevels.length - 1 && (
                                <div className="w-1 h-1 rounded-full bg-gray-300" />
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>
                            {workflow.currentLevelIndex} / {workflow.requiredLevels.length} bước
                          </span>
                          <span>{getWorkflowStatusLabel(workflow.status)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/contracts/${workflow.contractId}`);
                      }}
                    >
                      Xem & Phê duyệt
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {page + 1} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
              >
                Sau
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
