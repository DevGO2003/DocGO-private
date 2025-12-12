import React, { useState } from 'react';
import {
  Button,
  Checkbox,
} from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    userName: string;
    role: string;
    permissions?: string[];
  };
  onUpdateMember: (memberId: string, data: { role: string; permissions: string[] }) => Promise<void>;
  isCurrentUserOwner: boolean;
}

const AVAILABLE_ROLES = [
  { value: 'MANAGER', label: 'Quản lý', description: 'Có thể quản lý thành viên và phê duyệt tài liệu' },
  { value: 'MEMBER', label: 'Thành viên', description: 'Quyền truy cập cơ bản vào kho lưu trữ' },
];

const AVAILABLE_PERMISSIONS = [
  { id: 'approve:legal', label: 'Phê duyệt Pháp lý', description: 'Phê duyệt tài liệu về pháp lý' },
  { id: 'approve:finance', label: 'Phê duyệt Tài chính', description: 'Phê duyệt tài liệu về tài chính' },
  { id: 'approve:executive', label: 'Phê duyệt cuối cùng', description: 'Phê duyệt cấp điều hành' },
  { id: 'member:invite', label: 'Mời thành viên', description: 'Mời thành viên mới vào tổ chức' },
  { id: 'org:settings', label: 'Quản lý cài đặt', description: 'Thay đổi cài đặt tổ chức' },
];

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  member,
  onUpdateMember,
  isCurrentUserOwner,
}) => {
  const [selectedRole, setSelectedRole] = useState(member.role);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(member.permissions || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleChange = (newRole: string) => {
    setSelectedRole(newRole);
    // Clear permissions when changing from MANAGER to other roles
    if (newRole !== 'MANAGER') {
      setSelectedPermissions([]);
    }
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((p) => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onUpdateMember(member.id, {
        role: selectedRole,
        permissions: selectedPermissions,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update member:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCurrentUserOwner || !isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative rounded-lg max-w-2xl w-full max-h-[90vh]" style={{ backgroundColor: '#ffffff' }} >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#e5e7eb' }} >
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#111827' }} >
              <CommonIcon name="shield" size={20} color="#2563eb" />
              Quản lý thành viên: {member.userName}
            </h2>
            <p className="text-sm mt-1" style={{ color: '#4b5563' }} >Set role và cấp quyền persistent cho thành viên</p>
          </div>
          <button
            onClick={onClose}
            className="hover:text-gray-400 transition-colors"
            style={{ color: '#9ca3af' }}
          >
            <CommonIcon name="x" size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Role Selection */}
          <div className="space-y-3">
            <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#111827' }} >
              <CommonIcon name="shield" size={16} />
              Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: '#d1d5db' }}
              disabled={member.role === 'OWNER'}
            >
              {AVAILABLE_ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label} - {role.description}
                </option>
              ))}
            </select>
            {member.role === 'OWNER' && (
              <p className="text-xs text-amber-600 flex items-center gap-1">
                <CommonIcon name="lock" size={16} />
                Không thể thay đổi role của Owner
              </p>
            )}
          </div>

          {/* Permissions - Only for MANAGER role */}
          {selectedRole === 'MANAGER' && (
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#111827' }} >
                <CommonIcon name="lock" size={16} color="#16a34a" />
                Quyền của Quản lý
              </label>
              <div className="space-y-3 max-h-64 border rounded-lg p-4" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }} >
                {AVAILABLE_PERMISSIONS.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-start gap-3 p-3 border rounded-lg hover:border-blue-300 transition-colors"
                    style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }}
                  >
                    <Checkbox
                      checked={selectedPermissions.includes(permission.id)}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-sm" style={{ color: '#111827' }} >{permission.label}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#4b5563' }} >{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs" style={{ color: '#6b7280' }} >
                * Select at least one permission for Manager role
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 p-6 border-t" style={{ borderColor: '#e5e7eb', backgroundColor: '#f9fafb' }} >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || member.role === 'OWNER'}
            className="flex-1"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </div>
      </div>
    </div>
  );
};
