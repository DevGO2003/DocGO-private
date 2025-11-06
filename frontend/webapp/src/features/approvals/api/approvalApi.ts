/**
 * Approval API Service
 * Gọi các API endpoint của backend approval system
 */

import axios from 'axios';
import {
  ContractApprovalWorkflow,
  StartApprovalRequest,
  ApprovalActionRequest,
  ApprovalApiResponse
} from '../types/approval.types';

const API_BASE_URL = import.meta.env.VITE_REPOSITORY_SERVICE_URL || 'http://localhost:8002/api/v1/repository-management-service';

// Helper to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('userRole');
  const userPermissions = localStorage.getItem('userPermissions');
  const organizationId = localStorage.getItem('currentOrganizationId');

  return {
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId || '',
    'X-User-Name': userName || '',
    'X-User-Email': userEmail || '',
    'X-User-Role': userRole || '',
    'X-User-Permissions': userPermissions || '',
    'X-Organization-Id': organizationId || ''
  };
};

export const approvalApi = {
  /**
   * Start approval workflow
   */
  async startApproval(contractId: string, request: StartApprovalRequest): Promise<ContractApprovalWorkflow> {
    const response = await axios.post<ApprovalApiResponse<ContractApprovalWorkflow>>(
      `${API_BASE_URL}/contracts/${contractId}/approvals/start`,
      request,
      { headers: getAuthHeaders() }
    );
    return response.data.data;
  },

  /**
   * Get workflow status
   */
  async getWorkflow(contractId: string): Promise<ContractApprovalWorkflow | null> {
    try {
      const response = await axios.get<ApprovalApiResponse<ContractApprovalWorkflow>>(
        `${API_BASE_URL}/contracts/${contractId}/approvals/workflow`,
        { headers: getAuthHeaders() }
      );
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get workflow history
   */
  async getWorkflowHistory(contractId: string): Promise<ContractApprovalWorkflow[]> {
    const response = await axios.get<ApprovalApiResponse<ContractApprovalWorkflow[]>>(
      `${API_BASE_URL}/contracts/${contractId}/approvals/history`,
      { headers: getAuthHeaders() }
    );
    return response.data.data;
  },

  /**
   * Approve current level
   */
  async approve(contractId: string, request: ApprovalActionRequest): Promise<ContractApprovalWorkflow> {
    const response = await axios.post<ApprovalApiResponse<ContractApprovalWorkflow>>(
      `${API_BASE_URL}/contracts/${contractId}/approvals/approve`,
      request,
      { headers: getAuthHeaders() }
    );
    return response.data.data;
  },

  /**
   * Reject current level
   */
  async reject(contractId: string, request: ApprovalActionRequest): Promise<ContractApprovalWorkflow> {
    const response = await axios.post<ApprovalApiResponse<ContractApprovalWorkflow>>(
      `${API_BASE_URL}/contracts/${contractId}/approvals/reject`,
      request,
      { headers: getAuthHeaders() }
    );
    return response.data.data;
  },

  /**
   * Get my pending approvals
   */
  async getMyPendingApprovals(page: number = 0, size: number = 10): Promise<{
    content: ContractApprovalWorkflow[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await axios.get<ApprovalApiResponse<any>>(
      `${API_BASE_URL}/contracts/approvals/me/pending`,
      {
        params: { page, size },
        headers: getAuthHeaders()
      }
    );
    return response.data.data;
  }
};
