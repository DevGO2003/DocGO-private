import React, { useState } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateInvite,
  useAddPermission,
  useCreatePersonalInvite,
} from '@features/repositories/models/api/repositoryApi';
import { Button, Modal, Input, Select, Checkbox } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
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
  const queryClient = useQueryClient();
  const [inviteMethod, setInviteMethod] = useState<'link' | 'member'>('link');
  const [shareLink, setShareLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [permissions, setPermissions] = useState<Permission>({
    upload: true,
    view: true,
    delete: false,
  });
  const [linkExpiry, setLinkExpiry] = useState('7'); // days
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addPermissionMutation = useAddPermission();
  const createInviteMutation = useCreateInvite();
  const createPersonalInviteMutation = useCreatePersonalInvite();

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

  const handleInvite = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    console.log('[InviteModal] Starting invite process...', { inviteMethod, selectedMembers, permissions });

    try {
      if (inviteMethod === 'link') {
        // Generate invite link
        console.log('[InviteModal] Creating invite link with expiry:', linkExpiry);
        const result = await createInviteMutation.mutateAsync({
          repositoryId,
          expiresInDays: linkExpiry === 'never' ? 36500 : (parseInt(linkExpiry) || 7),
        });
        console.log('[InviteModal] Invite link created:', result);

        // Set the invite link from API response
        const inviteUrl = result.inviteLink || `${window.location.origin}/repositories/invites/${result.token}/accept?repositoryId=${repositoryId}`;
        setShareLink(inviteUrl);

        alert(`Đã tạo link mời thành công!\n\nLink: ${inviteUrl}\n\nBạn có thể copy link từ ô bên dưới.`);
      } else {
        // Invite selected members
        if (selectedMembers.length === 0) {
          alert('Vui lòng chọn ít nhất một thành viên');
          setIsSubmitting(false);
          return;
        }

        // Convert permissions to API format
        const permissionList: string[] = [];
        if (permissions.view) permissionList.push('VIEW');
        if (permissions.upload) permissionList.push('UPLOAD');
        if (permissions.delete) permissionList.push('DELETE');

        console.log('[InviteModal] Inviting members with permissions:', { selectedMembers, permissionList });

        // Try to create personal invites (with notifications) first
        let successCount = 0;
        let useDirectAdd = false;

        for (const memberId of selectedMembers) {
          try {
            console.log('[InviteModal] Creating personal invite for member:', memberId);
            const result = await createPersonalInviteMutation.mutateAsync({
              repositoryId,
              userId: memberId,
              permissions: permissionList,
              expiresInDays: 30, // Personal invites expire in 30 days
            });
            console.log('[InviteModal] Personal invite created successfully:', result);
            successCount++;
          } catch (error: any) {
            // If personal invite API not available (404, 500, 501), fallback to direct add
            const status = error?.response?.status;
            if (status === 404 || status === 500 || status === 501) {
              console.warn('[InviteModal] Personal invite API not available (status:', status, '), falling back to direct add');
              useDirectAdd = true;
              break;
            }
            throw error;
          }
        }

        // Fallback: If personal invite API doesn't exist, use direct add (no notifications)
        if (useDirectAdd) {
          console.log('[InviteModal] Using direct add fallback...');
          for (const memberId of selectedMembers) {
            console.log('[InviteModal] Adding member directly:', memberId);
            await addPermissionMutation.mutateAsync({
              repositoryId,
              userId: memberId,
              permissions: permissionList,
            });
            successCount++;
          }
        }

        console.log('[InviteModal] Invalidating queries...');
        // Invalidate queries to refresh lists
        await queryClient.invalidateQueries({ queryKey: ['repository-members', repositoryId] });
        await queryClient.invalidateQueries({ queryKey: ['repository-permissions', repositoryId] });
        await queryClient.invalidateQueries({ queryKey: ['repository', repositoryId] });
        await queryClient.invalidateQueries({ queryKey: ['my-repository-invites'] });

        console.log('[InviteModal] All members invited successfully');

        if (useDirectAdd) {
          alert(`✅ Đã thêm ${successCount} thành viên thành công!\n\n⚠️ Lưu ý: Thành viên được thêm trực tiếp (không qua thông báo) do API chưa hỗ trợ.`);
        } else {
          alert(`✅ Đã gửi lời mời đến ${successCount} thành viên!\n\n📬 Họ sẽ nhận được thông báo trong vòng 30 giây và cần chấp nhận lời mời.`);
        }

        // Close modal after adding members
        onClose();
      }

      // Don't close modal after creating link - let user copy it first
    } catch (error: any) {
      console.error('[InviteModal] Failed to invite:', error);
      console.error('[InviteModal] Error details:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      let message = error?.response?.data?.message || error?.message || 'Mời thành viên thất bại. Vui lòng thử lại.';

      if (error?.response?.status === 500) {
        message = 'Có lỗi xảy ra từ hệ thống. Có thể thành viên đã tồn tại trong kho lưu trữ hoặc có lỗi kết nối.';
      }

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#e0e7ff' }}>
              <CommonIcon name="user-plus" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold" style={{ color: '#111827' }}>
                {t('repositories.detail.invite.title')}
              </h2>
              <p className="text-sm" style={{ color: '#6b7280' }}>{repositoryName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <CommonIcon name="x" className="w-5 h-5" />
          </Button>
        </div>

        {/* Invite Method Tabs */}
        {isOrganization && (
          <div className="flex gap-2 mb-6">
            <Button
              variant={inviteMethod === 'link' ? 'default' : 'outline'}
              onClick={() => setInviteMethod('link')}
              className="flex-1"
            >
              {t('repositories.detail.invite.shareLink')}
            </Button>
            <Button
              variant={inviteMethod === 'member' ? 'default' : 'outline'}
              onClick={() => setInviteMethod('member')}
              className="flex-1"
            >
              {t('repositories.detail.invite.selectMember')}
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="space-y-6">
          {/* Link Sharing */}
          {(isPersonal || inviteMethod === 'link') && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t('repositories.detail.invite.inviteLink')}
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
                        <CommonIcon name="check" className="mr-2" />
                        {t('repositories.detail.invite.copied')}
                      </>
                    ) : (
                      <>
                        <CommonIcon name="copy" className="w-4 h-4 mr-2" />
                        {t('repositories.detail.invite.copy')}
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t('repositories.detail.invite.linkExpiresAfter')}
                </label>
                <Select
                  value={linkExpiry}
                  onChange={(e) => setLinkExpiry(e.target.value)}
                  options={[
                    { value: '1', label: t('repositories.detail.invite.expiryOptions.1day') },
                    { value: '7', label: t('repositories.detail.invite.expiryOptions.7days') },
                    { value: '30', label: t('repositories.detail.invite.expiryOptions.30days') },
                    { value: 'never', label: t('repositories.detail.invite.expiryOptions.never') },
                  ]}
                />
              </div>

              {/* Permissions for Personal Repository */}
              {isPersonal && (
                <div className="border rounded-lg p-4" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }}>
                  <p className="text-sm" style={{ color: '#1e40af' }}>
                    <Trans i18nKey="repositories.detail.invite.personalRepoInfo">
                      💡 <strong>Repository cá nhân:</strong> Người được mời sẽ có quyền xem và tải file.
                      Chỉ bạn mời có quyền upload và xóa.
                    </Trans>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Member Selection (Organization only) */}
          {isOrganization && inviteMethod === 'member' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t('repositories.detail.invite.selectMemberLabel')}
                </label>
                <div className="border rounded-lg max-h-48 overflow-y-auto" style={{ borderColor: '#d1d5db' }}>
                  {membersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      {t('repositories.detail.invite.loadingMembers')}
                    </div>
                  ) : organizationMembers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      {t('repositories.detail.invite.noMembers')}
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
                <label className="block text-sm font-medium mb-3" style={{ color: '#374151' }}>
                  <CommonIcon name="shield" className="w-4 h-4 inline mr-2" />
                  {t('repositories.detail.invite.permissions.title')}
                </label>
                <div className="space-y-3 rounded-lg p-4" style={{ backgroundColor: '#f9fafb' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium" style={{ color: '#111827' }}>{t('repositories.detail.invite.permissions.view.label')}</p>
                      <p className="text-sm" style={{ color: '#6b7280' }}>{t('repositories.detail.invite.permissions.view.description')}</p>
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
                      <p className="font-medium" style={{ color: '#111827' }}>{t('repositories.detail.invite.permissions.upload.label')}</p>
                      <p className="text-sm" style={{ color: '#6b7280' }}>{t('repositories.detail.invite.permissions.upload.description')}</p>
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
                      <p className="font-medium" style={{ color: '#111827' }}>{t('repositories.detail.invite.permissions.delete.label')}</p>
                      <p className="text-sm" style={{ color: '#6b7280' }}>{t('repositories.detail.invite.permissions.delete.description')}</p>
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
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button
            variant="default"
            onClick={handleInvite}
            disabled={isSubmitting || (isOrganization && inviteMethod === 'member' && selectedMembers.length === 0)}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Đang xử lý...
              </>
            ) : (
              inviteMethod === 'link' ? 'Tạo Link' : 'Mời thành viên'
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
