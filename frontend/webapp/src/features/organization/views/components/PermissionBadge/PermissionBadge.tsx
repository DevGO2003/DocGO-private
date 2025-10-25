import { Scale, DollarSign, Briefcase, UserPlus, Settings } from 'lucide-react';
import { ManagerPermission } from '@features/organization';

interface PermissionBadgeProps {
  permission: ManagerPermission;
  size?: 'sm' | 'md';
}

export const PermissionBadge = ({ permission, size = 'sm' }: PermissionBadgeProps) => {
  const getPermissionConfig = () => {
    switch (permission) {
      case 'approve:legal':
        return {
          label: 'Legal Approval',
          icon: Scale,
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
        };
      case 'approve:finance':
        return {
          label: 'Finance Approval',
          icon: DollarSign,
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
        };
      case 'approve:executive':
        return {
          label: 'Executive Approval',
          icon: Briefcase,
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
        };
      case 'member:invite':
        return {
          label: 'Invite Members',
          icon: UserPlus,
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
        };
      case 'org:settings':
        return {
          label: 'Manage Settings',
          icon: Settings,
          bgColor: 'bg-purple-50',
          textColor: 'text-purple-700',
        };
      default:
        return {
          label: permission,
          icon: Settings,
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
        };
    }
  };

  const config = getPermissionConfig();
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium ${config.bgColor} ${config.textColor} ${sizeClasses}`}
    >
      <Icon className={iconSize} />
      {config.label}
    </span>
  );
};
