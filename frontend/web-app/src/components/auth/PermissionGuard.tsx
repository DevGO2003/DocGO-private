/**
 * Permission Guard Components
 * Components để hiển thị/ẩn UI dựa trên permissions
 */

import { ReactNode } from 'react'
import { usePermissions, useCurrentUser } from '@/hooks/usePermissions'

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  permissions?: string[]
  requireAll?: boolean
  role?: string
  roles?: string[]
  fallback?: ReactNode
}

/**
 * PermissionGuard - Hiển thị children nếu user có permission
 */
export function PermissionGuard({
  children,
  permission,
  permissions = [],
  requireAll = false,
  role,
  roles = [],
  fallback = null
}: PermissionGuardProps) {
  const currentUser = useCurrentUser()
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasRole, hasAnyRole } = usePermissions({
    userRoles: currentUser.roles,
    userPermissions: currentUser.permissions
  })

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>
  }

  // Check multiple permissions
  if (permissions.length > 0) {
    const hasPerms = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions)
    
    if (!hasPerms) {
      return <>{fallback}</>
    }
  }

  // Check single role
  if (role && !hasRole(role)) {
    return <>{fallback}</>
  }

  // Check multiple roles
  if (roles.length > 0 && !hasAnyRole(roles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

/**
 * RoleBasedContent - Hiển thị content khác nhau dựa trên role
 */
interface RoleBasedContentProps {
  roleContent: Record<string, ReactNode>
  defaultContent?: ReactNode
}

export function RoleBasedContent({ roleContent, defaultContent = null }: RoleBasedContentProps) {
  const currentUser = useCurrentUser()
  
  // Find first matching role
  for (const role of currentUser.roles) {
    if (roleContent[role]) {
      return <>{roleContent[role]}</>
    }
  }
  
  return <>{defaultContent}</>
}

/**
 * DisabledIfNoPermission - Disable button/input nếu không có permission
 */
interface DisabledIfNoPermissionProps {
  children: ReactNode
  permission: string
  disabledMessage?: string
}

export function DisabledIfNoPermission({
  children,
  permission,
  disabledMessage = 'Bạn không có quyền thực hiện hành động này'
}: DisabledIfNoPermissionProps) {
  const currentUser = useCurrentUser()
  const { hasPermission } = usePermissions({
    userRoles: currentUser.roles,
    userPermissions: currentUser.permissions
  })

  const hasAccess = hasPermission(permission)

  if (!hasAccess) {
    return (
      <div className="relative group">
        <div className="opacity-50 pointer-events-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-black text-white text-xs px-2 py-1 rounded">
            {disabledMessage}
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
