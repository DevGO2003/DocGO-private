import React, { useState } from 'react';
import { Button, Card } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import {
  useRepositoryPermissions,
  useUpdatePermission,
  useRemovePermission,
} from '../../../models/api/repositoryApi';
import { PERMISSION_OPTIONS } from '../../../models/types/repository.types';
import type { RepositoryPermissionDTO } from '../../../models/types/repository.types';

interface RepositoryPermissionsManagerProps {
  repositoryId: string;
  repositoryType: 'PERSONAL' | 'ORGANIZATION' | 'PUBLIC';
  isOwner: boolean;
  onAddMember?: () => void;
}

export const RepositoryPermissionsManager: React.FC<RepositoryPermissionsManagerProps> = ({
  repositoryId,
  repositoryType,
  isOwner,
  onAddMember,
}) => {
  const { data: permissions, isLoading } = useRepositoryPermissions(repositoryId);
  const updatePermission = useUpdatePermission();
  const removePermission = useRemovePermission();

  const handleTogglePermission = async (
    userId: string,
    permission: string,
    currentPermissions: string[]
  ) => {
    const newPermissions = currentPermissions.includes(permission)
      ? currentPermissions.filter(p => p !== permission)
      : [...currentPermissions, permission];

    await updatePermission.mutateAsync({ repositoryId, userId, permissions: newPermissions });
  };

  const handleRemoveUser = async (userId: string) => {
    if (confirm('Bạn có chắc muốn xóa quyền truy cập của người dùng này?')) {
      await removePermission.mutateAsync({ repositoryId, userId });
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: '#111827' }} >
          <CommonIcon name="shield" className="w-5 h-5" />
          Quản lý quyền truy cập
        </h3>
        {isOwner && onAddMember && (
          <Button onClick={onAddMember}>
            <CommonIcon name="plus" className="w-4 h-4 mr-2" />
            Thêm thành viên
          </Button>
        )}
      </div>

      {permissions && permissions.length > 0 ? (
        <div className="space-y-2">
          {permissions.map((perm: RepositoryPermissionDTO) => (
            <Card key={perm.userId} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <CommonIcon name="users" style={{ color: '#9ca3af' }} />
                    <div>
                      <p className="font-medium" style={{ color: '#111827' }} >
                        {perm.userName || perm.userId}
                      </p>
                      <p className="text-sm" style={{ color: '#6b7280' }} >
                        Vai trò: {perm.role}
                      </p>
                    </div>
                  </div>

                  {isOwner ? (
                    <div className="mt-3 flex gap-2">
                      {PERMISSION_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 text-sm cursor-pointer"
                          title={option.description}
                        >
                          <input
                            type="checkbox"
                            checked={perm.permissions.includes(option.value)}
                            onChange={() =>
                              handleTogglePermission(perm.userId, option.value, perm.permissions)
                            }
                            className="rounded" style={{ borderColor: '#d1d5db' }} />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      {perm.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-1 text-xs rounded" style={{ backgroundColor: '#dbeafe' }} >
                          {PERMISSION_OPTIONS.find(opt => opt.value === p)?.label || p}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {isOwner && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveUser(perm.userId)}
                  >
                    <CommonIcon name="trash" className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <CommonIcon name="users" className="h-12 mx-auto mb-2" style={{ color: '#9ca3af' }} />
          <p style={{ color: '#4b5563' }} >Chưa có thành viên nào</p>
          {isOwner && onAddMember && (
            <Button className="mt-4" onClick={onAddMember}>
              <CommonIcon name="plus" className="w-4 h-4 mr-2" />
              Thêm thành viên đầu tiên
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};
