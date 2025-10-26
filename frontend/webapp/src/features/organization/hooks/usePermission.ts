import { useMemo } from 'react';
import { ManagerPermission, MemberRole, Organization } from '../models/types';

interface UsePermissionProps {
  organization?: Organization | null;
  requiredPermission?: ManagerPermission;
  requiredRole?: MemberRole;
}

export const usePermission = ({
  organization,
  requiredPermission,
  requiredRole,
}: UsePermissionProps) => {
  const hasPermission = useMemo(() => {
    if (!organization) return false;

    // Owner always has all permissions
    if (organization.userRole === MemberRole.OWNER) {
      return true;
    }

    // Check role-based access
    if (requiredRole) {
      const roleHierarchy = {
        [MemberRole.OWNER]: 3,
        [MemberRole.MANAGER]: 2,
        [MemberRole.MEMBER]: 1,
      };

      const userLevel = organization.userRole ? roleHierarchy[organization.userRole] : 0;
      const requiredLevel = roleHierarchy[requiredRole];

      if (userLevel < requiredLevel) {
        return false;
      }
    }

    // Check permission-based access
    if (requiredPermission) {
      const userPermissions = organization.userPermissions || [];
      return userPermissions.includes(requiredPermission);
    }

    return true;
  }, [organization, requiredPermission, requiredRole]);

  return {
    hasPermission,
    userRole: organization?.userRole,
    userPermissions: organization?.userPermissions || [],
  };
};

// Hook to check if user has specific role
export const useHasRole = (organization?: Organization | null, role?: MemberRole) => {
  return useMemo(() => {
    if (!organization || !role) return false;
    return organization.userRole === role;
  }, [organization, role]);
};

// Hook to check if user is owner
export const useIsOwner = (organization?: Organization | null) => {
  return useHasRole(organization, MemberRole.OWNER);
};

// Hook to check if user is manager
export const useIsManager = (organization?: Organization | null) => {
  return useHasRole(organization, MemberRole.MANAGER);
};

// Hook to check if user can approve (has any approve permission)
export const useCanApprove = (organization?: Organization | null) => {
  return useMemo(() => {
    if (!organization) return false;
    
    if (organization.userRole === MemberRole.OWNER) return true;
    
    const approvePermissions: ManagerPermission[] = [
      'approve:legal',
      'approve:finance',
      'approve:executive',
    ];
    
    const userPermissions = organization.userPermissions || [];
    return approvePermissions.some((perm) => userPermissions.includes(perm));
  }, [organization]);
};

// Hook to check if user can manage members
export const useCanManageMembers = (organization?: Organization | null) => {
  return usePermission({
    organization,
    requiredPermission: 'member:invite',
  }).hasPermission;
};

// Hook to check if user can manage settings
export const useCanManageSettings = (organization?: Organization | null) => {
  return usePermission({
    organization,
    requiredPermission: 'org:settings',
  }).hasPermission;
};
