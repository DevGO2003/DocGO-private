import { MemberRole } from '@/features/organizations';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { IconName } from '@shared/components/UIComponents/Icon/Icon.types';

interface RoleBadgeProps {
  role: MemberRole;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RoleBadge = ({ role, size = 'md', showIcon = true }: RoleBadgeProps) => {
  const getRoleConfig = () => {
    switch (role) {
      case MemberRole.OWNER:
        return {
          label: 'Owner',
          icon: 'shield' as IconName,
          bgColor: 'bg-purple-100',
          textColor: 'text-purple-700',
          borderColor: 'border-purple-300',
        };
      case MemberRole.MANAGER:
        return {
          label: 'Manager',
          icon: 'users' as IconName,
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-300',
        };
      case MemberRole.MEMBER:
      default:
        return {
          label: 'Member',
          icon: 'user' as IconName,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-300',
        };
    }
  };

  const config = getRoleConfig();

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  };

  const iconSizes = {
    sm: 12,
    md: 16,
    lg: 20,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bgColor} ${config.textColor} ${config.borderColor} ${sizeClasses[size]}`}
    >
      {showIcon && <CommonIcon name={config.icon} size={iconSizes[size]} />}
      {config.label}
    </span>
  );
};
