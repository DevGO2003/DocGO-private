import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/lib/api';
import {
  Organization,
  OrganizationCreateData,
  OrganizationUpdateData,
  OrganizationMember,
  InviteMemberData,
  UpdateMemberData,
} from '../types/organization.types';
import { PaginationParams, PaginatedResponse } from '@features/repository';

const BASE_PATH = '/api/v1/user-management-service';

const organizationApi = {
  // Organizations
  getAllOrganizations: async (params?: PaginationParams): Promise<PaginatedResponse<Organization>> => {
    const response = await apiClient.get<PaginatedResponse<Organization>>(
      `${BASE_PATH}/organizations`,
      { params }
    );
    return response.data.data!;
  },

  getOrganizationById: async (id: string): Promise<Organization> => {
    const response = await apiClient.get<Organization>(`${BASE_PATH}/organizations/${id}`);
    return response.data.data!;
  },

  getMyOrganizations: async (params?: PaginationParams): Promise<PaginatedResponse<Organization>> => {
    const response = await apiClient.get<PaginatedResponse<Organization>>(
      `${BASE_PATH}/organizations/my`,
      { params }
    );
    return response.data.data!;
  },

  createOrganization: async (data: OrganizationCreateData): Promise<Organization> => {
    const response = await apiClient.post<Organization>(`${BASE_PATH}/organizations`, data);
    return response.data.data!;
  },

  updateOrganization: async (id: string, data: OrganizationUpdateData): Promise<Organization> => {
    const response = await apiClient.put<Organization>(`${BASE_PATH}/organizations/${id}`, data);
    return response.data.data!;
  },

  deleteOrganization: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`${BASE_PATH}/organizations/${id}`);
  },

  // Members
  getOrganizationMembers: async (orgId: string, params?: PaginationParams): Promise<PaginatedResponse<OrganizationMember>> => {
    const response = await apiClient.get<PaginatedResponse<OrganizationMember>>(
      `${BASE_PATH}/organizations/${orgId}/members`,
      { params }
    );
    return response.data.data!;
  },

  inviteMember: async (orgId: string, data: InviteMemberData): Promise<OrganizationMember> => {
    const response = await apiClient.post<OrganizationMember>(
      `${BASE_PATH}/organizations/${orgId}/members/invite`,
      data
    );
    return response.data.data!;
  },

  updateMember: async (orgId: string, memberId: string, data: UpdateMemberData): Promise<OrganizationMember> => {
    const response = await apiClient.put<OrganizationMember>(
      `${BASE_PATH}/organizations/${orgId}/members/${memberId}`,
      data
    );
    return response.data.data!;
  },

  removeMember: async (orgId: string, memberId: string): Promise<void> => {
    await apiClient.delete<void>(`${BASE_PATH}/organizations/${orgId}/members/${memberId}`);
  },

  leaveOrganization: async (orgId: string): Promise<void> => {
    await apiClient.post<void>(`${BASE_PATH}/organizations/${orgId}/leave`);
  },
};

// React Query hooks
export const useOrganizations = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['organizations', params],
    queryFn: () => organizationApi.getAllOrganizations(params),
  });
};

export const useMyOrganizations = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['my-organizations', params],
    queryFn: () => organizationApi.getMyOrganizations(params),
  });
};

export const useOrganization = (id: string) => {
  return useQuery({
    queryKey: ['organization', id],
    queryFn: () => organizationApi.getOrganizationById(id),
    enabled: !!id,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: organizationApi.createOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['my-organizations'] });
    },
  });
};

export const useUpdateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrganizationUpdateData }) =>
      organizationApi.updateOrganization(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: organizationApi.deleteOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
};

// Members
export const useOrganizationMembers = (orgId: string, params?: PaginationParams) => {
  return useQuery({
    queryKey: ['organization-members', orgId, params],
    queryFn: () => organizationApi.getOrganizationMembers(orgId, params),
    enabled: !!orgId,
  });
};

export const useInviteMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: InviteMemberData }) =>
      organizationApi.inviteMember(orgId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId] });
    },
  });
};

export const useUpdateMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId, data }: { orgId: string; memberId: string; data: UpdateMemberData }) =>
      organizationApi.updateMember(orgId, memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', variables.orgId] });
    },
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orgId, memberId }: { orgId: string; memberId: string }) =>
      organizationApi.removeMember(orgId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organization-members', variables.orgId] });
      queryClient.invalidateQueries({ queryKey: ['organization', variables.orgId] });
    },
  });
};

export const useLeaveOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: organizationApi.leaveOrganization,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['my-organizations'] });
    },
  });
};

export default organizationApi;
