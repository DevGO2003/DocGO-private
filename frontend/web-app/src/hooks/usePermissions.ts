/**
 * usePermissions Hook
 * Hook để check permissions của user hiện tại
 */

import { useMemo } from 'react'
import { ROLE_PERMISSIONS } from '@/lib/constants/roles-permissions'

interface UsePermissionsProps {
  userRoles?: string[]
  userPermissions?: string[]
}

export function usePermissions({ userRoles = [], userPermissions = [] }: UsePermissionsProps = {}) {
  
  // Tổng hợp permissions từ roles
  const allPermissions = useMemo(() => {
    const rolePerms = userRoles.flatMap(role => ROLE_PERMISSIONS[role] || [])
    return [...new Set([...rolePerms, ...userPermissions])]
  }, [userRoles, userPermissions])

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    return allPermissions.includes(permission)
  }

  /**
   * Check if user has ANY of the permissions
   */
  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => allPermissions.includes(permission))
  }

  /**
   * Check if user has ALL of the permissions
   */
  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => allPermissions.includes(permission))
  }

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    return userRoles.includes(role)
  }

  /**
   * Check if user has ANY of the roles
   */
  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.includes(role))
  }

  return {
    permissions: allPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole
  }
}

/**
 * useCurrentUser Hook
 * Mock current user data (sẽ thay bằng real auth sau)
 */
export function useCurrentUser() {
  // Get current role from localStorage (for demo/testing)
  let currentRole = 'Nhân viên kiểm tra'
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mock_user_role')
    if (stored) currentRole = stored
  }
  
  // TODO: Replace with real auth context
  return {
    id: 'user-1',
    name: 'Demo User',
    email: 'demo@docgo.com',
    roles: [currentRole, 'member'], // Current role + member
    permissions: [],
    currentRole // Add current role for easy access
  }
}
