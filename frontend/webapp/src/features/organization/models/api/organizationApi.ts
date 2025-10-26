import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/lib/api';
import {
  Organization,
  OrganizationCreateData,
  OrganizationUpdateData,
  OrganizationMember,
  InviteMemberData,
  UpdateMemberData,
  Invitation,
  AcceptInvitationData,
  AcceptInvitationResponse,
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
    console.log('🔍 [API] getOrganizationById full response:', response.data.data);
    console.log('🔍 [API] userRole:', response.data.data?.userRole);
    console.log('🔍 [API] ownerUserId:', response.data.data?.ownerUserId);
    console.log('🔍 [API] owner (legacy):', response.data.data?.owner);
    return response.data.data!;
  },

  getMyOrganizations: async (params?: PaginationParams): Promise<PaginatedResponse<Organization>> => {
    const response = await apiClient.get<PaginatedResponse<Organization>>(
      `${BASE_PATH}/users/me/organizations`,
      { params }
    );
    console.log('📋 [API] getMyOrganizations response:', response.data.data);
    console.log('📋 [API] Total organizations:', response.data.data?.totalElements);
    console.log('📋 [API] Organizations list:', response.data.data?.content?.map(org => ({
      id: org.id,
      name: org.name,
      userRole: org.userRole
    })));
    return response.data.data!;
  },

  createOrganization: async (data: OrganizationCreateData): Promise<Organization> => {
    console.log('📤 [API] Creating organization with data:', data);
    const response = await apiClient.post<Organization>(`${BASE_PATH}/organizations`, data);
    console.log('✅ [API] Create organization response:', response.data.data);
    console.log('🔍 [API] Created org name:', response.data.data?.name);
    console.log('🔍 [API] Created org ID:', response.data.data?.id);
    console.log('🔍 [API] Created org ownerUserId:', response.data.data?.ownerUserId);
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

  // Invitations
  getInvitationByToken: async (token: string): Promise<Invitation> => {
    const response = await apiClient.get<Invitation>(`${BASE_PATH}/invitations/${token}`);
    return response.data.data!;
  },

  getMyPendingInvitations: async (): Promise<Invitation[]> => {
    const response = await apiClient.get<Invitation[]>(`${BASE_PATH}/organizations/invitations/me/pending`);
    return response.data.data!;
  },

  acceptInvitation: async (data: AcceptInvitationData): Promise<any> => {
    console.log('📤 [API] Accepting invitation with token:', data.token);
    const response = await apiClient.post<any>(
      `${BASE_PATH}/organizations/invitations/${data.token}/accept`
    );
    console.log('✅ [API] Accept invitation response:', response.data.data);
    // Backend returns OrganizationMembershipResponse, map to expected format
    const membership = response.data.data;
    return {
      organizationId: membership.organizationId,
      userId: membership.userId,
      role: membership.roleIds?.[0] || 'MEMBER',
    };
  },

  declineInvitation: async (data: AcceptInvitationData): Promise<void> => {
    console.log('📤 [API] Declining invitation with token:', data.token);
    await apiClient.post<void>(`${BASE_PATH}/organizations/invitations/${data.token}/reject`);
    console.log('✅ [API] Declined invitation successfully');
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

// Invitations
export const useGetInvitationByToken = (token: string) => {
  return useQuery({
    queryKey: ['invitation', token],
    queryFn: () => organizationApi.getInvitationByToken(token),
    enabled: !!token,
  });
};

export const useMyPendingInvitations = () => {
  return useQuery({
    queryKey: ['my-pending-invitations'],
    queryFn: () => organizationApi.getMyPendingInvitations(),
    refetchInterval: 15000, // Refresh every 15 seconds (faster!)
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    retry: 1, // Retry once if failed
  });
};

export const useAcceptInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: organizationApi.acceptInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['my-organizations'] });
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
    },
  });
};

export const useDeclineInvitation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: organizationApi.declineInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-pending-invitations'] });
    },
  });
};

export default organizationApi;
