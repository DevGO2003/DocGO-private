import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/lib/api';
import { UserProfile, UserCreateData, UserUpdateData, UserFilterParams } from '../types/user.types';
import { PaginatedResponse } from '@features/repository';

const BASE_PATH = '/api/v1/user-management-service';

const userApi = {
  // User management (Admin)
  getAllUsers: async (params?: UserFilterParams): Promise<PaginatedResponse<UserProfile>> => {
    const response = await apiClient.get<PaginatedResponse<UserProfile>>(
      `${BASE_PATH}/users`,
      { params }
    );
    return response.data.data!;
  },

  getUserById: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>(`${BASE_PATH}/users/${id}`);
    return response.data.data!;
  },

  createUser: async (data: UserCreateData): Promise<UserProfile> => {
    const response = await apiClient.post<UserProfile>(`${BASE_PATH}/users`, data);
    return response.data.data!;
  },

  updateUser: async (id: string, data: UserUpdateData): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>(`${BASE_PATH}/users/${id}`, data);
    return response.data.data!;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete<void>(`${BASE_PATH}/users/${id}`);
  },

  restoreUser: async (id: string): Promise<UserProfile> => {
    const response = await apiClient.put<UserProfile>(`${BASE_PATH}/users/${id}/restore`);
    return response.data.data!;
  },

  // Bulk operations
  bulkDeleteUsers: async (userIds: string[]): Promise<void> => {
    await apiClient.post<void>(`${BASE_PATH}/users/bulk-delete`, { userIds });
  },

  bulkUpdateStatus: async (userIds: string[], status: string): Promise<void> => {
    await apiClient.post<void>(`${BASE_PATH}/users/bulk-update-status`, { userIds, status });
  },
};

// React Query hooks
export const useUsers = (params?: UserFilterParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userApi.getAllUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userApi.getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdateData }) =>
      userApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useRestoreUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.restoreUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBulkDeleteUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: userApi.bulkDeleteUsers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useBulkUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userIds, status }: { userIds: string[]; status: string }) =>
      userApi.bulkUpdateStatus(userIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export default userApi;
