// User management types
import { UserRole, UserStatus } from '@features/auth';

export interface UserProfile {
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

export interface UserCreateData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
  department?: string;
  position?: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  status?: UserStatus;
  phone?: string;
  department?: string;
  position?: string;
  avatar?: string;
}

export interface UserFilterParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
  role?: UserRole;
  status?: UserStatus;
  includeDeleted?: boolean;
}

// User state
export interface UserState {
  users: UserProfile[];
  currentUser: UserProfile | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}
