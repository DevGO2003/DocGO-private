import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@shared/lib/api/apiClient';

const BASE_PATH = '/api/v1/user-management-service';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
  role: string;
  roleIds?: string[];
  permissionIds?: string[];
  organizationId?: string;
  organizationIds?: string[];
  activeOrganizationId?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  avatarUrl?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  status?: string;
}

export interface UpdateUserStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface UpdateUserRolesRequest {
  roleIds: string[];
}

export interface UpdateUserPermissionsRequest {
  permissionIds: string[];
}

const usersApi = {
  // Get all users with filters
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
    search?: string;
  }): Promise<UsersResponse> => {
    // Convert 1-indexed page to 0-indexed for Spring Boot
    const apiParams = {
      ...params,
      page: params?.page ? params.page - 1 : 0,
    };
    
    const response = await apiClient.get<any>(`${BASE_PATH}/users`, { params: apiParams });
    // Backend returns Spring Page: { data: { content: [], totalElements: N, number: 0, size: 10 } }
    const pageData = response.data?.data || response.data;
    
    if (pageData?.content) {
      // Spring Page format
      return {
        users: pageData.content,
        total: pageData.totalElements || 0,
        page: (pageData.number || 0) + 1, // Convert back to 1-indexed
        limit: pageData.size || 10,
      };
    }
    
    // Fallback
    return { users: [], total: 0, page: 1, limit: 10 };
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiClient.get<any>(`${BASE_PATH}/users/${id}`);
    return response.data?.data || response.data;
  },

  // Create new user
  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post<any>(`${BASE_PATH}/users`, data);
    return response.data?.data || response.data;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.put<any>(`${BASE_PATH}/users/${id}`, data);
    return response.data?.data || response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_PATH}/users/${id}`);
  },

  // Update user status
  updateUserStatus: async (id: string, status: string): Promise<User> => {
    const response = await apiClient.put<any>(
      `${BASE_PATH}/users/${id}/status`,
      { status }
    );
    return response.data?.data || response.data;
  },

  // Update user roles
  updateUserRoles: async (id: string, roleIds: string[]): Promise<User> => {
    const response = await apiClient.put<any>(
      `${BASE_PATH}/users/${id}/roles`,
      { roleIds }
    );
    return response.data?.data || response.data;
  },

  // Update user permissions
  updateUserPermissions: async (id: string, permissionIds: string[]): Promise<User> => {
    const response = await apiClient.put<any>(
      `${BASE_PATH}/users/${id}/permissions`,
      { permissionIds }
    );
    return response.data?.data || response.data;
  },

  // Search users
  searchUsers: async (query: string): Promise<User[]> => {
    const response = await apiClient.get<any>(
      `${BASE_PATH}/users/search`,
      { params: { query } }
    );
    return response.data?.data || response.data || [];
  },

  // Get users count
  getUsersCount: async (): Promise<number> => {
    const response = await apiClient.get<any>(`${BASE_PATH}/users/count`);
    return response.data?.data?.count || response.data?.count || 0;
  },
};

// React Query hooks
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  role?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getUsers(params),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => usersApi.getUserById(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      usersApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useUpdateUserRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, roleIds }: { id: string; roleIds: string[] }) =>
      usersApi.updateUserRoles(id, roleIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useSearchUsers = (query: string) => {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: () => usersApi.searchUsers(query),
    enabled: query.length > 0,
  });
};

export const useUsersCount = () => {
  return useQuery({
    queryKey: ['users', 'count'],
    queryFn: usersApi.getUsersCount,
  });
};

export default usersApi;
