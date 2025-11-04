import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@shared/lib/api';
import { LoginRequest, RegisterRequest } from './authApi.types';
import { AuthResponse, User } from '../types/auth.types';

const BASE_PATH = '/api/v1/user-management-service';

const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    console.log('[AuthAPI] Login request:', {
      username: credentials.username,
      password: '***',
      rememberMe: credentials.rememberMe
    });
    
    const response = await apiClient.post<AuthResponse>(
      `${BASE_PATH}/auth/login`,
      credentials
    );
    
    console.log('[AuthAPI] Login response:', {
      statusCode: response.data.statusCode,
      hasData: !!response.data.data,
      fullResponse: response.data
    });
    
    if (!response.data.data) {
      console.error('[AuthAPI] No data in response:', response.data);
      throw new Error(response.data.description || 'Đăng nhập thất bại');
    }
    
    console.log('[AuthAPI] Login data:', {
      hasAccessToken: !!response.data.data.accessToken,
      hasUser: !!response.data.data.user,
      hasToken: !!(response.data.data as any).token,
      data: response.data.data
    });
    
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    console.log('[AuthAPI] Register request:', {
      username: data.username,
      email: data.email,
      password: '***'
    });
    
    // Backend chỉ cần username, email, password
    const payload = {
      username: data.username,
      email: data.email,
      password: data.password
    };
    
    const response = await apiClient.post<AuthResponse>(
      `${BASE_PATH}/auth/register`,
      payload
    );
    
    if (!response.data.data) {
      throw new Error(response.data.description || 'Đăng ký thất bại');
    }
    
    return response.data.data;
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>(
      `${BASE_PATH}/auth/me`
    );
    
    if (!response.data.data) {
      throw new Error(response.data.description || 'Lỗi lấy thông tin người dùng');
    }
    
    return response.data.data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    await apiClient.post<void>(
      `${BASE_PATH}/auth/logout`,
      refreshToken ? { refreshToken } : {}
    );
  },

  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      `${BASE_PATH}/auth/refresh`,
      { refreshToken }
    );
    
    if (!response.data.data) {
      throw new Error(response.data.description || 'Refresh token thất bại');
    }
    
    return response.data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post<void>(
      `${BASE_PATH}/auth/forgot-password`,
      { email }
    );
  },

  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post<void>(
      `${BASE_PATH}/auth/reset-password`,
      { token, newPassword }
    );
  },

  changePassword: async (userId: string, newPassword: string): Promise<void> => {
    await apiClient.put<void>(
      `${BASE_PATH}/users/${userId}/password`,
      { newPassword }
    );
  },

  updateProfile: async (data: Partial<User> & { userId: string }): Promise<User> => {
    console.log('[AuthAPI] updateProfile request payload:', data);
    const { userId, ...updateData } = data;
    
    const response = await apiClient.put<User>(
      `${BASE_PATH}/users/${userId}`,
      updateData
    );
    console.log('[AuthAPI] updateProfile response:', response.data);
    
    if (!response.data.data) {
      throw new Error(response.data.description || 'Cập nhật profile thất bại');
    }
    
    return response.data.data;
  },
};

export const useLogin = () => {
  return useMutation({
    mutationFn: authApi.login,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authApi.register,
  });
};

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: (refreshToken?: string) => authApi.logout(refreshToken),
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: authApi.forgotPassword,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: ({ token, newPassword }: { token: string; newPassword: string }) =>
      authApi.resetPassword(token, newPassword),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ userId, newPassword }: { userId: string; newPassword: string }) =>
      authApi.changePassword(userId, newPassword),
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: authApi.updateProfile,
  });
};

export default authApi;
