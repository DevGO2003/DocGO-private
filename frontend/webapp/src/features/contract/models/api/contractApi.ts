import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/lib/api';
import type { Contract, ContractUploadData } from '../types/contract.types';
import type { PaginatedResponse, PaginationParams } from '@features/repository';

// Use real backend API
const BASE_PATH = '/api/v1/repository-management-service';

const contractApi = {
  // Upload contract with file
  uploadContract: async (data: ContractUploadData): Promise<Contract> => {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('title', data.title);
    if (data.description) {
      formData.append('description', data.description);
    }
    formData.append('organizationId', data.organizationId);
    if (data.repositoryId) {
      formData.append('repositoryId', data.repositoryId);
    }

    const response = await apiClient.post<Contract>(
      `${BASE_PATH}/contracts/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data!;
  },

  // Get contracts by organization
  getContractsByOrganization: async (
    orgId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Contract>> => {
    const response = await apiClient.get<PaginatedResponse<Contract>>(
      `${BASE_PATH}/organizations/${orgId}/contracts`,
      { params }
    );
    return response.data.data!;
  },

  // Get contract by ID
  getContractById: async (id: string): Promise<Contract> => {
    const response = await apiClient.get<Contract>(`${BASE_PATH}/contracts/${id}`);
    return response.data.data!;
  },

  // Delete contract
  deleteContract: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`${BASE_PATH}/contracts/${id}`);
  },
};

// React Query hooks
export const useUploadContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contractApi.uploadContract,
    onSuccess: () => {
      // Invalidate all contract queries to refresh data
      queryClient.invalidateQueries({ 
        queryKey: ['contracts']
      });
    },
  });
};

export const useOrganizationContracts = (orgId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['contracts', 'organization', orgId, params],
    queryFn: () => contractApi.getContractsByOrganization(orgId, params),
    enabled: !!orgId,
  });
};

export const useContract = (id: string) => {
  return useQuery({
    queryKey: ['contract', id],
    queryFn: () => contractApi.getContractById(id),
    enabled: !!id,
  });
};

export const useDeleteContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: contractApi.deleteContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
};

export default contractApi;
