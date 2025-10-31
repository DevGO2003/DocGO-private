// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  VIEWER = 'VIEWER',
  EMPLOYEE = 'EMPLOYEE'
}

// User status
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED'
}

// User model matching backend
export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  phone?: string;
  department?: string;
  position?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Login credentials
export interface LoginCredentials {
  username: string;
  password: string;
  rememberMe?: boolean;
}

// Register data
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmPassword?: string;
  role?: UserRole;
}

// Auth response from backend
export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
  expiresIn: number;
  tokenType: string;
}

// Token data
export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  tokenType: string;
}

// RestResponse wrapper from backend
export interface RestResponse<T> {
  apiVersion: string;
  statusCode: number;
  shortMessage: string;
  description: string;
  data: T | null;
  timestamp: string;
  requestId: string;
  path: string;
}

// Auth state for Redux
export interface AuthState {
  user: User | null;
  token: string | null;
  tokenData: TokenData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Profile update request
export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  department?: string;
  position?: string;
  avatar?: string;
}

// Password change request
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// Forgot password request
export interface ForgotPasswordRequest {
  email: string;
}

// Reset password request
export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}
