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

// Helper to get current user from Redux store
const getCurrentUser = () => {
  try {
    const authData = localStorage.getItem('docgo_auth_v1');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.user || null;
    }
  } catch (e) {
    console.error('Error parsing auth data:', e);
  }
  return null;
};

// Helper to get auth headers
const getAuthHeaders = () => {
  // Get user from auth system (Redux store persisted in localStorage)
  const user = getCurrentUser();
  const authData = localStorage.getItem('docgo_auth_v1');
  let token = '';
  
  try {
    if (authData) {
      const parsed = JSON.parse(authData);
      token = parsed.tokenData?.accessToken || parsed.token || '';
    }
  } catch (e) {
    console.error('Error getting token:', e);
  }

  // Get organization from localStorage
  const organizationId = localStorage.getItem('currentOrganizationId');

  // Encode values that may contain non-ASCII characters (Vietnamese, special chars)
  const encodeHeaderValue = (value: string | null) => {
    if (!value) return '';
    try {
      // Use base64 encoding for Unicode support
      return btoa(unescape(encodeURIComponent(value)));
    } catch (e) {
      console.error('Error encoding header value:', e);
      return '';
    }
  };

  // Extract user info from Redux user object
  const userId = user?.id || '';
  const userName = user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || user?.username || '';
  const userEmail = user?.email || '';
  
  // Get role and permissions from localStorage (set by organization membership)
  // These are organization-specific, not the global user role
  const userRole = localStorage.getItem('organizationRole') || user?.role || 'MEMBER';
  const userPermissions = localStorage.getItem('organizationPermissions') || '';
  
  console.log('[ApprovalAPI] Headers:', {
    userId,
    userName,
    userEmail,
    userRole,
    userPermissions,
    organizationId
  });

  return {
    'Authorization': `Bearer ${token}`,
    'X-User-Id': userId,
    'X-User-Name': encodeHeaderValue(userName), // Encoded
    'X-User-Email': encodeHeaderValue(userEmail), // Encoded
    'X-User-Role': userRole,
    'X-User-Permissions': userPermissions,
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
