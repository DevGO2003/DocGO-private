import { ManagerPermission } from '@/features/organizations';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { IconName } from '@shared/components/UIComponents/Icon/Icon.types';

interface PermissionBadgeProps {
  permission: ManagerPermission;
  size?: 'sm' | 'md';
}

export const PermissionBadge = ({ permission, size = 'sm' }: PermissionBadgeProps) => {
  const getConfig = () => {
    switch (permission) {
      case ManagerPermission.LEGAL:
        return {
          label: 'Legal',
          icon: 'scale' as IconName,
          color: 'text-purple-700',
          bg: 'bg-purple-100',
        };
      case ManagerPermission.FINANCE:
        return {
          label: 'Finance',
          icon: 'dollar-sign' as IconName,
          color: 'text-green-700',
          bg: 'bg-green-100',
        };
      case ManagerPermission.HR:
        return {
          label: 'HR',
          icon: 'briefcase' as IconName,
          color: 'text-blue-700',
          bg: 'bg-blue-100',
        };
      case ManagerPermission.INVITE_MEMBERS:
        return {
          label: 'Invite Members',
          icon: 'user-plus' as IconName,
          color: 'text-indigo-700',
          bg: 'bg-indigo-100',
        };
      case ManagerPermission.MANAGE_SETTINGS:
      default:
        return {
          label: 'Settings',
          icon: 'settings' as IconName,
          color: 'text-gray-700',
          bg: 'bg-gray-100',
        };
    }
  };

  const config = getConfig();

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 12 : 16;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${config.bg} ${config.color} ${sizeClasses}`}
    >
      <CommonIcon name={config.icon} size={iconSize} />
      {config.label}
    </span>
  );
};
