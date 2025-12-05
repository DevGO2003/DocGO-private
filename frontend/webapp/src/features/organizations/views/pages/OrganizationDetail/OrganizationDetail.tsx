import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  LoadingSpinner,
  RefreshButton,
  Checkbox,
} from '@shared/components';
import {
  useOrganization,
  useOrganizationMembers,
  useRemoveMember,
  useDeleteOrganization,
} from '@/features/organizations';
import { ORGANIZATIONS_PATH } from '@constants';
import OrganizationLayout from '../../../layouts/OrganizationLayout';
import { MemberManagementModal } from '../../components/MemberManagementModal';

type TabType = 'info' | 'overview' | 'contracts' | 'repositories' | 'members' | 'settings';

export const OrganizationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { t } = useTranslation();

  const { data: organization, isLoading: orgLoading } = useOrganization(id!);
  const { data: members, isLoading: membersLoading } = useOrganizationMembers(id!);
  const removeMemberMutation = useRemoveMember();

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'info', label: t('organizations.detail.tabs.info'), icon: 'info' },
    { id: 'overview', label: t('organizations.detail.tabs.overview'), icon: 'folder-open' },
    { id: 'contracts', label: t('organizations.detail.tabs.contracts'), icon: 'file-text' },
    { id: 'repositories', label: t('organizations.detail.tabs.repositories'), icon: 'folder' },
    { id: 'members', label: t('organizations.detail.tabs.members'), icon: 'users' },
    { id: 'settings', label: t('organizations.detail.tabs.settings'), icon: 'settings' },
  ];

  const handleRemoveMember = async (memberId: string) => {
    if (!window.confirm(t('organizations.detail.members.removeConfirm'))) return;

    try {
      await removeMemberMutation.mutateAsync({
        orgId: id!,
        memberId,
      });
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const deleteOrganizationMutation = useDeleteOrganization();

  const handleDeleteOrganization = async () => {
    if (!window.confirm(t('organizations.detail.settings.danger.confirmDelete') || 'Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteOrganizationMutation.mutateAsync(id!);
      navigate(ORGANIZATIONS_PATH);
    } catch (error) {
      console.error('Failed to delete organization:', error);
      alert(t('organizations.detail.settings.danger.deleteFailed') || 'Failed to delete organization');
    }
  };

  const handleManageMember = (member: any) => {
    setSelectedMember(member);
    setIsManageModalOpen(true);
  };

  const handleUpdateMember = async (memberId: string, data: { role: string; permissions: string[] }) => {
    console.log('Updating member:', memberId, data);
    // TODO: Call API to update member role and permissions
    await queryClient.invalidateQueries({ queryKey: ['organization-members', id] });
    alert(`Updated member ${memberId}!\nRole: ${data.role}\nPermissions: ${data.permissions.join(', ')}`);
  };

  const isCurrentUserOwner = true; // TODO: Check if current user is owner from auth context

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return { backgroundColor: '#f3e8ff', color: '#6b21a8' };
      case 'ADMIN':
        return { backgroundColor: '#dbeafe', color: '#1e40af' };
      case 'MEMBER':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'PENDING':
        return { backgroundColor: '#fef3c7', color: '#92400e' };
      case 'SUSPENDED':
        return { backgroundColor: '#fee2e2', color: '#991b1b' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const handleRefresh = async () => {
    console.log('[OrganizationDetail] Refreshing data...');
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['organization', id] });
      await queryClient.invalidateQueries({ queryKey: ['organization-members', id] });
      await queryClient.refetchQueries({ queryKey: ['organization', id] });
      await queryClient.refetchQueries({ queryKey: ['organization-members', id] });

      console.log('[OrganizationDetail] Refresh completed');
    } catch (error) {
      console.error('[OrganizationDetail] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (orgLoading) {
    return <LoadingSpinner text={t('organizations.detail.loading')} fullScreen />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p style={{ color: '#374151' }} >{t('organizations.detail.notFound')}</p>
            <Button
              variant="outline"
              onClick={() => navigate(ORGANIZATIONS_PATH)}
              className="mt-4"
            >
              {t('organizations.detail.backToList')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <OrganizationLayout
      title={organization.name}
      subtitle={organization.description || 'No description'}
      breadcrumbs={[
        { label: t('organizations.list.title'), href: ORGANIZATIONS_PATH },
        { label: organization.name, current: true },
      ]}
      onRefresh={handleRefresh}
      headerRight={(
        <div className="flex gap-2 items-center">
          <div className="relative">
            <CommonIcon name="search" size={16} className="absolute left-3 top-1/2" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder={t('organizations.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" style={{ borderColor: '#d1d5db' }} />
          </div>
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
          <Button
            variant="outline"
            className="flex items-center gap-2"
          >
            <CommonIcon name="more-vertical" size={20} />
            {t('organizations.detail.actions')}
          </Button>
        </div>
      )}
      tabsConfig={{
        mainTabs: tabs,
        activeMainTab: activeTab,
        onMainTabChange: setActiveTab,
        loading: orgLoading,
      }}
    >
      <div className="space-y-6">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                  <CommonIcon name="users" size={24} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.detail.stats.members')}</p>
                  <p className="text-2xl font-bold" style={{ color: '#111827' }} >
                    {organization.memberCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3e8ff' }}>
                  <CommonIcon name="folder" size={24} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.detail.stats.repositories')}</p>
                  <p className="text-2xl font-bold" style={{ color: '#111827' }} >0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#dcfce7' }}>
                  <CommonIcon name="shield" size={24} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.detail.stats.status')}</p>
                  <p className="text-lg font-semibold" style={{ color: '#111827' }} >{t('organizations.detail.stats.active')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <CommonIcon name="calendar" size={16} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.detail.stats.created')}</p>
                  <p className="text-sm font-semibold" style={{ color: '#111827' }} >
                    {organization.createdAt ? new Date(organization.createdAt).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Chưa có thông tin'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Tab Content */}
        <div key={activeTab} className="animate-fade-in">
          {/* Info Tab */}
          {activeTab === 'info' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('organizations.detail.overview.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.overview.name')}</label>
                    <p className="mt-1" style={{ color: '#111827' }} >{organization.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.overview.description')}</label>
                    <p className="mt-1" style={{ color: '#111827' }} >
                      {organization.description || t('organizations.detail.overview.noDescription')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.overview.owner')}</label>
                    <p className="mt-1 flex items-center gap-2" style={{ color: '#111827' }} >
                      <CommonIcon name="crown" size={16} color="#eab308" />
                      {organization.ownerName || 'Unknown'}
                    </p>
                  </div>
                  {organization.createdAt && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.stats.created')}</label>
                      <p className="mt-1" style={{ color: '#111827' }} >
                        {new Date(organization.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.overview.settings')}</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {organization.settings?.isPublic && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>
                          {t('organizations.detail.overview.flags.public')}
                        </span>
                      )}
                      {organization.settings?.allowInvitations && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                          {t('organizations.detail.overview.flags.openInvitations')}
                        </span>
                      )}
                      {organization.settings?.requireApproval && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: '#fed7aa', color: '#92400e' }}>
                          {t('organizations.detail.overview.flags.requiresApproval')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('organizations.detail.overview.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.overview.name')}</label>
                    <p className="mt-1" style={{ color: '#111827' }} >{organization.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.overview.description')}</label>
                    <p className="mt-1" style={{ color: '#111827' }} >
                      {organization.description || t('organizations.detail.overview.noDescription')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.overview.owner')}</label>
                    <p className="mt-1 flex items-center gap-2" style={{ color: '#111827' }} >
                      <CommonIcon name="crown" size={16} color="#eab308" />
                      {organization.ownerName || 'Unknown'}
                    </p>
                  </div>
                  {organization.createdAt && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.stats.created')}</label>
                      <p className="mt-1" style={{ color: '#111827' }} >
                        {new Date(organization.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium" style={{ color: '#374151' }} >{t('organizations.detail.overview.settings')}</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {organization.settings?.isPublic && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: '#dcfce7' }} >
                          {t('organizations.detail.overview.flags.public')}
                        </span>
                      )}
                      {organization.settings?.allowInvitations && (
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: '#dbeafe' }} >
                          {t('organizations.detail.overview.flags.openInvitations')}
                        </span>
                      )}
                      {organization.settings?.requireApproval && (
                        <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                          {t('organizations.detail.overview.flags.requiresApproval')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('organizations.detail.members.title')}</CardTitle>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CommonIcon name="users" size={16} />
                    {t('organizations.detail.members.invite')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="py-8">
                    <LoadingSpinner text={t('organizations.detail.members.loading')} />
                  </div>
                ) : members && (members as any).content && (members as any).content.length > 0 ? (
                  <div className="space-y-3">
                    {(members as any).content.map((member: any) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#d1d5db' }} >
                        <div className="flex items-center gap-4">
                          <div className="h-12 rounded-full flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                            <span className="font-bold text-lg" style={{ color: '#ffffff' }} >
                              {member.userName?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold" style={{ color: '#111827' }} >
                              {member.userName || 'Unknown User'}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(
                                  member.role
                                )}`}
                              >
                                {member.role}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusBadgeColor(
                                  member.status
                                )}`}
                              >
                                {member.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm" style={{ color: '#6b7280' }} >
                            {t('organizations.detail.members.joined', { date: new Date(member.joinedAt).toLocaleDateString() })}
                          </p>
                          {isCurrentUserOwner && (
                            <>
                              <Button
                                variant="outline"
                                onClick={() => handleManageMember(member)}
                                className="hover: text-sm flex items-center gap-1" style={{ color: '#2563eb' }} >
                                <CommonIcon name="shield" size={12} />
                                Quản lý
                              </Button>
                              {member.role !== 'OWNER' && (
                                <Button
                                  variant="outline"
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="hover: text-sm" style={{ color: '#dc2626' }} >
                                  {t('organizations.detail.members.remove')}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CommonIcon name="users" size={64} color="#9ca3af" className="mx-auto mb-4" />
                    <p className="mb-4" style={{ color: '#4b5563' }} >{t('organizations.detail.members.none')}</p>
                    <Button variant="outline" className="inline-flex items-center gap-2">
                      <CommonIcon name="users" size={16} />
                      {t('organizations.detail.members.invite')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('organizations.detail.tabs.contracts')}</CardTitle>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CommonIcon name="file-text" size={16} />
                    {t('organizations.openContractList')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CommonIcon name="file-text" size={64} color="#9ca3af" className="mx-auto mb-4" />
                  <p style={{ color: '#4b5563' }} >{t('organizations.noContracts')}</p>
                  <p className="text-sm mt-2" style={{ color: '#6b7280' }} >{t('organizations.noContractsDesc')}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Repositories Tab */}
          {activeTab === 'repositories' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('organizations.detail.repositories.title')}</CardTitle>
                  <Button variant="outline" className="flex items-center gap-2">
                    <CommonIcon name="folder" size={16} />
                    {t('organizations.openRepositoryList')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <CommonIcon name="folder" size={64} color="#9ca3af" className="mx-auto mb-4" />
                  <p style={{ color: '#4b5563' }} >{t('organizations.noRepositories')}</p>
                  <p className="text-sm mt-2" style={{ color: '#6b7280' }} >{t('organizations.noRepositoriesDesc')}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('organizations.detail.settings.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }} >{t('organizations.detail.settings.general')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }} >
                        <div>
                          <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.detail.settings.public.label')}</p>
                          <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.detail.settings.public.desc')}</p>
                        </div>
                        <Checkbox
                          checked={organization.settings?.isPublic}
                          disabled
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }} >
                        <div>
                          <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.detail.settings.allowInvitations.label')}</p>
                          <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.detail.settings.allowInvitations.desc')}</p>
                        </div>
                        <Checkbox
                          checked={organization.settings?.allowInvitations}
                          disabled
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: '#f9fafb' }} >
                        <div>
                          <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.detail.settings.requireApproval.label')}</p>
                          <p className="text-sm" style={{ color: '#4b5563' }} >{t('organizations.detail.settings.requireApproval.desc')}</p>
                        </div>
                        <Checkbox
                          checked={organization.settings?.requireApproval}
                          disabled
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t" style={{ borderColor: '#e5e7eb' }} >
                    <h3 className="text-lg font-semibold mb-4" style={{ color: '#dc2626' }} >{t('organizations.detail.settings.danger.title')}</h3>
                    <div className="p-4 border-2 rounded-lg" style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }} >
                      <p className="font-medium mb-2" style={{ color: '#7f1d1d' }} >{t('organizations.detail.settings.danger.delete')}</p>
                      <p className="text-sm mb-4" style={{ color: '#b91c1c' }} >{t('organizations.detail.settings.danger.desc')}</p>
                      <Button
                        variant="outline"
                        className="hover:"
                        style={{ color: '#dc2626' }}
                        onClick={handleDeleteOrganization}
                        disabled={deleteOrganizationMutation.isPending}
                      >
                        {deleteOrganizationMutation.isPending ? 'Deleting...' : t('organizations.detail.settings.danger.cta')}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
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
          member={selectedMember}
          onUpdateMember={handleUpdateMember}
          isCurrentUserOwner={isCurrentUserOwner}
        />
      )}
    </OrganizationLayout>
  );
};
