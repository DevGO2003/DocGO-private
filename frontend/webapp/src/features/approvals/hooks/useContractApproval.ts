/**
 * Hook để quản lý approval workflow
 */

import { useState, useEffect, useCallback } from 'react';
import { approvalApi } from '../api/approvalApi';
import { ContractApprovalWorkflow, getCurrentLevel, canUserApprove } from '../types/approval.types';

interface UseContractApprovalOptions {
  contractId: string;
  userRole: string;
  userPermissions: string[];
  autoRefresh?: boolean;
  refreshInterval?: number; // ms
}

export const useContractApproval = ({
  contractId,
  userRole,
  userPermissions,
  autoRefresh = false,
  refreshInterval = 30000 // 30s
}: UseContractApprovalOptions) => {
  const [workflow, setWorkflow] = useState<ContractApprovalWorkflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch workflow
  const fetchWorkflow = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await approvalApi.getWorkflow(contractId);
      setWorkflow(data);
    } catch (err: any) {
      console.error('Error fetching workflow:', err);
      setError(err.message || 'Không thể tải workflow');
      setWorkflow(null);
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  // Initial fetch
  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWorkflow();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchWorkflow]);

  // Start approval workflow
  const startApproval = async (comment?: string) => {
    try {
      setSubmitting(true);
      setError(null);
      const newWorkflow = await approvalApi.startApproval(contractId, { comment });
      setWorkflow(newWorkflow);
      return newWorkflow;
    } catch (err: any) {
      setError(err.message || 'Không thể gửi phê duyệt');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Approve current level
  const approve = async (comment?: string) => {
    try {
      setSubmitting(true);
      setError(null);
      const updatedWorkflow = await approvalApi.approve(contractId, { comment });
      setWorkflow(updatedWorkflow);
      return updatedWorkflow;
    } catch (err: any) {
      setError(err.message || 'Không thể phê duyệt');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Reject current level
  const reject = async (comment: string) => {
    if (!comment || comment.trim().length < 10) {
      throw new Error('Lý do từ chối phải có ít nhất 10 ký tự');
    }

    try {
      setSubmitting(true);
      setError(null);
      const updatedWorkflow = await approvalApi.reject(contractId, { comment });
      setWorkflow(updatedWorkflow);
      return updatedWorkflow;
    } catch (err: any) {
      setError(err.message || 'Không thể từ chối');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  // Get workflow history
  const getHistory = async () => {
    try {
      const history = await approvalApi.getWorkflowHistory(contractId);
      return history;
    } catch (err: any) {
      console.error('Error fetching history:', err);
      return [];
    }
  };

  // Helper computed values
  const currentLevel = workflow ? getCurrentLevel(workflow) : null;
  const userCanApprove = workflow ? canUserApprove(workflow, userRole, userPermissions) : false;
  const isCompleted = workflow?.status === 'FULLY_APPROVED' || workflow?.status === 'REJECTED';
  const isPending = workflow && !isCompleted;

  return {
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
    refresh: fetchWorkflow,
    getHistory
  };
};
