import { ReactNode } from 'react';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Card, CardContent } from '@shared/components';
import { ManagerPermission, MemberRole } from '@/features/organizations/models/types';

interface PermissionGuardProps {
  children: ReactNode;
  requiredRole?: MemberRole;
  requiredPermission?: ManagerPermission;
  currentRole?: MemberRole;
  currentPermissions?: ManagerPermission[];
  fallback?: ReactNode;
}

export const PermissionGuard = ({
  children,
  requiredRole,
  requiredPermission,
  currentRole,
  currentPermissions = [],
  fallback,
}: PermissionGuardProps) => {
  // Check role-based access
  if (requiredRole) {
    const roleHierarchy = {
      [MemberRole.OWNER]: 3,
      [MemberRole.MANAGER]: 2,
      [MemberRole.MEMBER]: 1,
    };

    const userLevel = currentRole ? roleHierarchy[currentRole] : 0;
    const requiredLevel = roleHierarchy[requiredRole];

    if (userLevel < requiredLevel) {
      return fallback || <AccessDenied />;
    }
  }

  // Check permission-based access
  if (requiredPermission) {
    // Owner always has all permissions
    if (currentRole === MemberRole.OWNER) {
      return <>{children}</>;
    }

    // Check if user has the specific permission
    if (!currentPermissions.includes(requiredPermission)) {
      return fallback || <AccessDenied />;
    }
  }

  return <>{children}</>;
};

const AccessDenied = () => (
  <Card style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }} >
    <CardContent className="p-8 text-center">
      <CommonIcon name="alert-circle" size={64} color="#ef4444" className="mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2" style={{ color: '#7f1d1d' }} >Access Denied</h3>
      <p style={{ color: '#b91c1c' }} >
        You don't have permission to access this feature.
      </p>
    </CardContent>
  </Card>
);
