import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Button, Card, CardHeader, CardTitle, CardContent, LoadingSpinner, RefreshButton, Dialog } from '@shared/components';
import {
  MemberTable,
  InviteMemberModal,
  useOrganization,
  useOrganizationMembers,
  useDeleteOrganization,
  useUpdateMember,
  MemberRole,
} from '@/features/organizations';
import { useSelector } from 'react-redux';
import type { RootState } from '@store';
import { ORGANIZATIONS_PATH } from '@constants';
import OrganizationLayout from '../../../layouts/OrganizationLayout';
import { MemberManagementModal } from '../../components/MemberManagementModal';

export const OrganizationMembers = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: organization, isLoading: orgLoading } = useOrganization(id!);
  const {
    data: membersData,
    isLoading: membersLoading,
    refetch: refetchMembers,
  } = useOrganizationMembers(id!, { page: 0, size: 50 });
  const { mutate: deleteOrganization, isPending: isDeleting } = useDeleteOrganization();
  const { mutate: updateMember, isPending: isUpdating } = useUpdateMember();

  const members = membersData?.content || [];
  const isLoading = orgLoading || membersLoading;

  // Get current user's role in this organization
  const currentUserRole = organization?.userRole || MemberRole.MEMBER;
  const canInviteMembers = currentUserRole === MemberRole.OWNER || currentUserRole === MemberRole.MANAGER;
  const isCurrentUserOwner = currentUserRole === MemberRole.OWNER;

  // Debug logs
  console.log('🔍 [Members Page] Organization:', organization?.name);
  console.log('🔍 [Members Page] Your role:', currentUserRole);
  console.log('🔍 [Members Page] Can invite members?', canInviteMembers);
  console.log('🔍 [Members Page] Members count:', members.length);

  const handleRefresh = async () => {
    console.log('[OrganizationMembers] Refreshing data...');
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['organization', id] });
      await queryClient.invalidateQueries({ queryKey: ['organization-members', id] });
      await queryClient.refetchQueries({ queryKey: ['organization', id] });
      await queryClient.refetchQueries({ queryKey: ['organization-members', id] });

      console.log('[OrganizationMembers] Refresh completed');
    } catch (error) {
      console.error('[OrganizationMembers] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleManageMember = (member: any) => {
    setSelectedMember(member);
    setIsManageModalOpen(true);
  };

  const handleUpdateMember = async (memberId: string, data: { role: string; permissions: string[] }) => {
    if (!id) return;
    
    console.log('Updating member:', memberId, 'Data:', data);
    
    updateMember(
      {
        orgId: id,
        memberId: memberId,
        data: {
          role: data.role as any,
          permissions: data.permissions as any,
        },
      },
      {
        onSuccess: () => {
          console.log('✅ Member updated successfully');
          setIsManageModalOpen(false);
          setSelectedMember(null);
          refetchMembers();
        },
        onError: (error: any) => {
          console.error('❌ Failed to update member:', error);
          alert('Failed to update member. Please try again.');
        },
      }
    );
  };

  const handleDeleteOrganization = () => {
    if (!id) return;
    
    deleteOrganization(id, {
      onSuccess: () => {
        console.log('✅ Organization deleted successfully');
        navigate(ORGANIZATIONS_PATH);
      },
      onError: (error: any) => {
        console.error('❌ Failed to delete organization:', error);
        alert('Failed to delete organization. Please try again.');
      },
    });
  };

  if (isLoading) {
    return <LoadingSpinner text={t('organizations.members.loading')} fullScreen />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4" style={{ color: '#374151' }} >{t('organizations.members.notFound')}</p>
            <Button
              variant="outline"
              onClick={() => navigate(ORGANIZATIONS_PATH)}
            >
              {t('organizations.members.backToOrganizations')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <OrganizationLayout
      title={organization?.name || ''}
      subtitle={t('organizations.members.subtitle')}
      breadcrumbs={[
        { label: t('organizations.list.title'), href: ORGANIZATIONS_PATH },
        { label: organization?.name || '', href: `/organizations/${id}` },
        { label: t('organizations.members.title'), current: true },
      ]}
      onRefresh={handleRefresh}
      headerRight={(
        <div className="flex gap-2">
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
          {canInviteMembers && (
            <Button
              onClick={() => setIsInviteModalOpen(true)}
              className="flex items-center gap-2"
            >
              <CommonIcon name="user-plus" size={20} />
              {t('organizations.members.inviteMember')}
            </Button>
          )}
          {isCurrentUserOwner && (
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="outline"
              className="flex items-center gap-2 hover: hover:bg-red-50" style={{ color: '#dc2626', borderColor: '#fca5a5' }} >
              <CommonIcon name="arrow-left" size={20} />
              Xóa tổ chức
            </Button>
          )}
        </div>
      )}
    >
      {/* Invite Member Modal */}
      <InviteMemberModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        organizationId={id!}
        onSuccess={() => {
          refetchMembers();
        }}
      />

      <div className="space-y-6">

          {/* Members Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CommonIcon name="users" size={20} />
                  {t('organizations.members.teamMembers', { count: members.length })}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <MemberTable
                members={members}
                organizationId={id!}
                currentUserId={currentUser?.id || ''}
                currentUserRole={currentUserRole as MemberRole}
                isLoading={membersLoading}
                onEditMember={handleManageMember}
                onRefresh={() => refetchMembers()}
              />
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="mt-6 p-6 border rounded-lg" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} >
            <h3 className="font-semibold mb-2" style={{ color: '#1e3a8a' }} >{t('organizations.members.aboutRolesTitle')}</h3>
            <ul className="space-y-2 text-sm" style={{ color: '#1e40af' }} >
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>{t('organizations.members.roles.owner')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>{t('organizations.members.roles.manager')}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold mt-0.5">•</span>
                <span>{t('organizations.members.roles.member')}</span>
              </li>
            </ul>
          </div>
      </div>

      {/* Member Management Modal */}
      {selectedMember && (
        <MemberManagementModal
          isOpen={isManageModalOpen}
          onClose={() => {
            setIsManageModalOpen(false);
            setSelectedMember(null);
          }}
          member={{
            id: selectedMember.userId,
            userName: selectedMember.username || `${selectedMember.firstName} ${selectedMember.lastName}`,
            role: selectedMember.role,
            permissions: selectedMember.permissions || [],
          }}
          onUpdateMember={handleUpdateMember}
          isCurrentUserOwner={isCurrentUserOwner}
        />
      )}

      {/* Delete Organization Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Xác nhận xóa tổ chức"
      >
        <div className="space-y-4">
          <p style={{ color: '#374151' }} >
            Bạn có chắc chắn muốn xóa tổ chức <strong>{organization?.name}</strong>?
          </p>
          <p className="text-sm" style={{ color: '#dc2626' }} >
            ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến tổ chức sẽ bị xóa vĩnh viễn.
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
            >
              Hủy
            </Button>
            <Button
              onClick={handleDeleteOrganization}
              disabled={isDeleting}
              className="hover:bg-red-700" style={{ backgroundColor: '#dc2626', color: '#ffffff' }} >
              {isDeleting ? 'Đang xóa...' : 'Xóa tổ chức'}
            </Button>
          </div>
        </div>
      </Dialog>
    </OrganizationLayout>
  );
};
