import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check, UserPlus, Shield } from 'lucide-react';
import { Button, Modal, Input, Select, Checkbox, LoadingSpinner } from '@shared/components';
import { RepositoryType } from '@features/repositories/models/types';
import { useOrganizationMembers } from '@features/organizations/models/api/organizationApi';

interface InviteRepositoryMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  repositoryId: string;
  repositoryType: RepositoryType;
  repositoryName: string;
  organizationId?: string; // Add organizationId prop
}

interface Permission {
  upload: boolean;
  view: boolean;
  delete: boolean;
}

export const InviteRepositoryMemberModal: React.FC<InviteRepositoryMemberModalProps> = ({
  isOpen,
  onClose,
  repositoryId,
  repositoryType,
  repositoryName,
  organizationId,
}) => {
  const { t } = useTranslation();
  const [inviteMethod, setInviteMethod] = useState<'link' | 'member'>('link');
  const [shareLink] = useState(`${window.location.origin}/repositories/${repositoryId}/join`);
  const [copied, setCopied] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Permission>({
    upload: true,
    view: true,
    delete: false,
  });
  const [linkExpiry, setLinkExpiry] = useState('7'); // days

  const isPersonal = repositoryType === 'PERSONAL';
  const isOrganization = repositoryType === 'ORGANIZATION';

  // Fetch organization members if this is an organization repository
  const shouldFetchMembers = isOpen && isOrganization && !!organizationId;
  const { data: membersData, isLoading: membersLoading } = useOrganizationMembers(
    shouldFetchMembers ? (organizationId || '') : '',
    shouldFetchMembers ? { page: 0, size: 100 } : undefined
  );

  const organizationMembers = membersData?.content?.map(member => ({
    id: member.userId,
    name: member.username || member.email,
    email: member.email,
  })) || [];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInvite = () => {
    if (inviteMethod === 'link') {
      // TODO: API call to generate invite link
      console.log('Generate link with expiry:', linkExpiry, 'days', 'permissions:', permissions);
    } else {
      // TODO: API call to invite members
      console.log('Invite members:', selectedMembers, 'with permissions:', permissions);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {t('repositories.detail.invite.title')}
              </h2>
              <p className="text-sm text-gray-500">{repositoryName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Invite Method Tabs */}
        {isOrganization && (
          <div className="flex gap-2 mb-6">
            <Button
              variant={inviteMethod === 'link' ? 'default' : 'outline'}
              onClick={() => setInviteMethod('link')}
              className="flex-1"
            >
              Chia sẻ link
            </Button>
            <Button
              variant={inviteMethod === 'member' ? 'default' : 'outline'}
              onClick={() => setInviteMethod('member')}
              className="flex-1"
            >
              Chọn thành viên
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* Link Sharing */}
          {(isPersonal || inviteMethod === 'link') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link mời
                </label>
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="px-3"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 mr-2 text-green-600" />
                        Đã sao
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 mr-2" />
                        Sao chép
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link hết hạn sau
                </label>
                <Select
                  value={linkExpiry}
                  onChange={(e) => setLinkExpiry(e.target.value)}
                  options={[
                    { value: '1', label: '1 ngày' },
                    { value: '7', label: '7 ngày' },
                    { value: '30', label: '30 ngày' },
                    { value: 'never', label: 'Không giới hạn' },
                  ]}
                />
              </div>

              {/* Permissions for Personal Repository */}
              {isPersonal && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Quyền hạn cho người được mời
                  </label>
                  <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Xem file</p>
                        <p className="text-sm text-gray-500">Được xem và tải file</p>
                      </div>
                      <Checkbox
                        checked={permissions.view}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, view: !!checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Upload file</p>
                        <p className="text-sm text-gray-500">Được upload file mới</p>
                      </div>
                      <Checkbox
                        checked={permissions.upload}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, upload: !!checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Xóa file</p>
                        <p className="text-sm text-gray-500">Được xóa file khỏi repository</p>
                      </div>
                      <Checkbox
                        checked={permissions.delete}
                        onCheckedChange={(checked) =>
                          setPermissions({ ...permissions, delete: !!checked })
                        }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    💡 Mặc định: người upload file sẽ có quyền xem và xóa file đó
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Member Selection (Organization only) */}
          {isOrganization && inviteMethod === 'member' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chọn thành viên
                </label>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner text="Đang tải danh sách thành viên..." />
                    </div>
                  ) : organizationMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Không có thành viên nào trong tổ chức
                    </div>
                  ) : (
                    organizationMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={(checked) => {
                            setSelectedMembers(
                              checked
                                ? [...selectedMembers, member.id]
                                : selectedMembers.filter((id) => id !== member.id)
                            );
                          }}
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.email}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Quyền hạn
                </label>
                <div className="space-y-3 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Xem file</p>
                      <p className="text-sm text-gray-500">Được xem và tải file</p>
                    </div>
                    <Checkbox
                      checked={permissions.view}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, view: !!checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Upload file</p>
                      <p className="text-sm text-gray-500">Được upload file mới</p>
                    </div>
                    <Checkbox
                      checked={permissions.upload}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, upload: !!checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Xóa file</p>
                      <p className="text-sm text-gray-500">Được xóa file khỏi repository</p>
                    </div>
                    <Checkbox
                      checked={permissions.delete}
                      onCheckedChange={(checked) =>
                        setPermissions({ ...permissions, delete: !!checked })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={handleInvite}
            disabled={isOrganization && inviteMethod === 'member' && selectedMembers.length === 0}
          >
            {inviteMethod === 'link' ? 'Tạo link' : 'Mời thành viên'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
