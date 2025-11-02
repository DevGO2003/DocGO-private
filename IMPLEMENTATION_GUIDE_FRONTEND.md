# 🎨 Frontend Implementation Guide - Permission & Invite System

## 📊 PHẦN 2: FRONTEND

### 2.1. API Client (Cần thêm vào repositoryApi.ts)

**File**: `features/repositories/models/api/repositoryApi.ts`

```typescript
// Permission APIs
const permissionApi = {
  getPermissions: async (repositoryId: string): Promise<RepositoryPermission[]> => {
    const response = await apiClient.get(`/api/v1/repository-management-service/repositories/${repositoryId}/permissions`);
    return response.data.data;
  },

  addPermission: async (repositoryId: string, userId: string, permissions: string[]): Promise<RepositoryPermission> => {
    const response = await apiClient.post(`/api/v1/repository-management-service/repositories/${repositoryId}/permissions`, {
      userId,
      permissions
    });
    return response.data.data;
  },

  updatePermission: async (repositoryId: string, userId: string, permissions: string[]): Promise<RepositoryPermission> => {
    const response = await apiClient.put(`/api/v1/repository-management-service/repositories/${repositoryId}/permissions/${userId}`, {
      permissions
    });
    return response.data.data;
  },

  removePermission: async (repositoryId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/repository-management-service/repositories/${repositoryId}/permissions/${userId}`);
  },
};

// Invite APIs
const inviteApi = {
  createInvite: async (repositoryId: string, expiresInDays: number = 7): Promise<RepositoryInvite> => {
    const response = await apiClient.post(`/api/v1/repository-management-service/repositories/${repositoryId}/invites`, {
      expiresInDays
    });
    return response.data.data;
  },

  getRepositoryInvites: async (repositoryId: string): Promise<RepositoryInvite[]> => {
    const response = await apiClient.get(`/api/v1/repository-management-service/repositories/${repositoryId}/invites`);
    return response.data.data;
  },

  getInviteByToken: async (token: string): Promise<RepositoryInvite> => {
    const response = await apiClient.get(`/api/v1/repository-management-service/invites/${token}`);
    return response.data.data;
  },

  acceptInvite: async (token: string): Promise<void> => {
    await apiClient.post(`/api/v1/repository-management-service/invites/${token}/accept`);
  },

  revokeInvite: async (inviteId: string): Promise<void> => {
    await apiClient.delete(`/api/v1/repository-management-service/invites/${inviteId}`);
  },
};

// Export trong repositoryApi object
export const repositoryApi = {
  // ... existing methods
  ...permissionApi,
  ...inviteApi,
};

// React Query Hooks
export const useRepositoryPermissions = (repositoryId: string) => {
  return useQuery({
    queryKey: ['repository-permissions', repositoryId],
    queryFn: () => repositoryApi.getPermissions(repositoryId),
    enabled: !!repositoryId,
  });
};

export const useAddPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repositoryId, userId, permissions }: { repositoryId: string; userId: string; permissions: string[] }) =>
      repositoryApi.addPermission(repositoryId, userId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repository-permissions', variables.repositoryId] });
    },
  });
};

export const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repositoryId, userId, permissions }: { repositoryId: string; userId: string; permissions: string[] }) =>
      repositoryApi.updatePermission(repositoryId, userId, permissions),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repository-permissions', variables.repositoryId] });
    },
  });
};

export const useRemovePermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repositoryId, userId }: { repositoryId: string; userId: string }) =>
      repositoryApi.removePermission(repositoryId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repository-permissions', variables.repositoryId] });
    },
  });
};

export const useRepositoryInvites = (repositoryId: string) => {
  return useQuery({
    queryKey: ['repository-invites', repositoryId],
    queryFn: () => repositoryApi.getRepositoryInvites(repositoryId),
    enabled: !!repositoryId,
  });
};

export const useCreateInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ repositoryId, expiresInDays }: { repositoryId: string; expiresInDays?: number }) =>
      repositoryApi.createInvite(repositoryId, expiresInDays),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repository-invites', variables.repositoryId] });
    },
  });
};

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (token: string) => repositoryApi.acceptInvite(token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories'] });
      queryClient.invalidateQueries({ queryKey: ['my-repositories'] });
    },
  });
};

export const useRevokeInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ inviteId, repositoryId }: { inviteId: string; repositoryId: string }) =>
      repositoryApi.revokeInvite(inviteId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['repository-invites', variables.repositoryId] });
    },
  });
};
```

---

### 2.2. TypeScript Interfaces

**File**: `features/repositories/models/types/repository.types.ts` (thêm vào)

```typescript
export interface RepositoryPermission {
  userId: string;
  userName?: string;
  role: 'OWNER' | 'ADMIN' | 'EDITOR' | 'CONTRIBUTOR' | 'VIEWER' | 'CUSTOM';
  permissions: string[]; // ['UPLOAD', 'VIEW', 'DELETE']
  grantedBy: string;
  grantedByName?: string;
  grantedAt: string;
}

export interface RepositoryInvite {
  id: string;
  token: string;
  inviteLink: string;
  repositoryId: string;
  repositoryName: string;
  invitedBy: string;
  inviterName?: string;
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  isUsed: boolean;
  usedBy?: string;
  usedAt?: string;
}

export interface PermissionOption {
  value: string;
  label: string;
  description: string;
}

export const PERMISSION_OPTIONS: PermissionOption[] = [
  { value: 'VIEW', label: 'Xem', description: 'Có thể xem files trong repository' },
  { value: 'UPLOAD', label: 'Tải lên', description: 'Có thể upload files mới' },
  { value: 'DELETE', label: 'Xóa', description: 'Có thể xóa files' },
];
```

---

### 2.3. RepositoryPermissionsManager Component

**File**: `features/repositories/views/components/RepositoryPermissionsManager.tsx`

```tsx
import React, { useState } from 'react';
import { Button, Card } from '@shared/components';
import { Users, Shield, Trash2, Plus } from 'lucide-react';
import {
  useRepositoryPermissions,
  useAddPermission,
  useUpdatePermission,
  useRemovePermission,
} from '../../models/api/repositoryApi';
import { RepositoryPermission, PERMISSION_OPTIONS } from '../../models/types/repository.types';
import { AddPermissionModal } from './AddPermissionModal';

interface RepositoryPermissionsManagerProps {
  repositoryId: string;
  repositoryType: 'PERSONAL' | 'ORGANIZATION';
  isOwner: boolean;
}

export const RepositoryPermissionsManager: React.FC<RepositoryPermissionsManagerProps> = ({
  repositoryId,
  repositoryType,
  isOwner,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const { data: permissions, isLoading } = useRepositoryPermissions(repositoryId);
  const addPermission = useAddPermission();
  const updatePermission = useUpdatePermission();
  const removePermission = useRemovePermission();

  const handleTogglePermission = async (userId: string, permission: string, currentPermissions: string[]) => {
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
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Quản lý quyền truy cập
        </h3>
        {isOwner && (
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm thành viên
          </Button>
        )}
      </div>

      {permissions && permissions.length > 0 ? (
        <div className="space-y-2">
          {permissions.map((perm) => (
            <Card key={perm.userId} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {perm.userName || perm.userId}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vai trò: {perm.role}
                      </p>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="mt-3 flex gap-2">
                      {PERMISSION_OPTIONS.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 text-sm"
                          title={option.description}
                        >
                          <input
                            type="checkbox"
                            checked={perm.permissions.includes(option.value)}
                            onChange={() =>
                              handleTogglePermission(perm.userId, option.value, perm.permissions)
                            }
                            className="rounded border-gray-300"
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  {!isOwner && (
                    <div className="mt-2 flex gap-2">
                      {perm.permissions.map((p) => (
                        <span
                          key={p}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                        >
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
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-6 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Chưa có thành viên nào</p>
        </Card>
      )}

      {showAddModal && (
        <AddPermissionModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          repositoryId={repositoryId}
          repositoryType={repositoryType}
        />
      )}
    </div>
  );
};
```

---

### 2.4. InviteRepositoryMemberModal (Updated)

**File**: `features/repositories/views/components/InviteRepositoryMemberModal.tsx`

```tsx
import React, { useState } from 'react';
import { Dialog, Button, Input } from '@shared/components';
import { Copy, Check, Link as LinkIcon, Calendar } from 'lucide-react';
import { useCreateInvite, useRepositoryInvites, useRevokeInvite } from '../../models/api/repositoryApi';

interface InviteRepositoryMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositoryId: string;
  repositoryType: 'PERSONAL' | 'ORGANIZATION';
  repositoryName: string;
}

export const InviteRepositoryMemberModal: React.FC<InviteRepositoryMemberModalProps> = ({
  isOpen,
  onClose,
  repositoryId,
  repositoryType,
  repositoryName,
}) => {
  const [copied, setCopied] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState(7);
  
  const { data: invites } = useRepositoryInvites(repositoryId);
  const createInvite = useCreateInvite();
  const revokeInvite = useRevokeInvite();

  const handleCreateInvite = async () => {
    await createInvite.mutateAsync({ repositoryId, expiresInDays });
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (confirm('Bạn có chắc muốn thu hồi link mời này?')) {
      await revokeInvite.mutateAsync({ inviteId, repositoryId });
    }
  };

  // Personal Repository - Invite Link
  if (repositoryType === 'PERSONAL') {
    const activeInvites = invites?.filter(inv => !inv.isUsed && !inv.isExpired) || [];

    return (
      <Dialog isOpen={isOpen} onClose={onClose} title={`Mời thành viên - ${repositoryName}`}>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Tạo link mời để chia sẻ với người khác. Họ sẽ có quyền xem repository sau khi chấp nhận.
          </p>

          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời hạn (ngày)
              </label>
              <Input
                type="number"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(Number(e.target.value))}
                min={1}
                max={30}
              />
            </div>
            <Button onClick={handleCreateInvite} disabled={createInvite.isPending}>
              <LinkIcon className="w-4 h-4 mr-2" />
              Tạo link mời
            </Button>
          </div>

          {activeInvites.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Link mời hiện tại</h4>
              {activeInvites.map((invite) => (
                <div key={invite.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      readOnly
                      value={invite.inviteLink}
                      className="flex-1 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleCopyLink(invite.inviteLink)}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Hết hạn: {new Date(invite.expiresAt).toLocaleDateString('vi-VN')}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevokeInvite(invite.id)}
                    >
                      Thu hồi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Dialog>
    );
  }

  // Organization Repository - Select Members
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Thêm thành viên - ${repositoryName}`}>
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Chọn thành viên từ tổ chức để thêm vào repository.
        </p>
        
        {/* TODO: Add organization members selector */}
        <div className="text-center py-8 text-gray-500">
          Tính năng này đang được phát triển
        </div>
      </div>
    </Dialog>
  );
};
```

---

**Continue to Part 2...**
