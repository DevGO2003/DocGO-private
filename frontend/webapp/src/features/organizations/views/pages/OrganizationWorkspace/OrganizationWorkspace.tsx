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
  Tabs,
  TabList,
  CommonTab,
} from '@shared/components';
import { useOrganization } from '@/features/organizations';
import { useOrganizationMembers } from '@features/organizations/models/api/organizationApi';
import { useOrganizationContracts, useOrganizationRepositories } from '@features/repositories/models/api/repositoryApi';
// import { UploadContractDialog } from '@features/contract'; // Temporarily disabled
import { ORGANIZATIONS_PATH } from '@constants';
import OrganizationLayout from '../../../layouts/OrganizationLayout';

type WorkspaceTab = 'reports' | 'contracts' | 'repositories' | 'members' | 'settings';

export const OrganizationWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('reports');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllContracts, setShowAllContracts] = useState(false);
  const [showAllRepositories, setShowAllRepositories] = useState(false);
  // const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false); // Temporarily disabled

  const { data: organization, isLoading } = useOrganization(id!);
  const { t } = useTranslation();
  const { 
    data: contractsData, 
    isLoading: contractsLoading, 
    isFetching: contractsFetching,
    // refetch: refetchContracts  // Temporarily disabled
  } = useOrganizationContracts(id!, {
    page: 0,
    size: 20,
  });

  // Fetch organization members
  const { 
    data: membersData, 
    isLoading: membersLoading 
  } = useOrganizationMembers(id!, {
    page: 0,
    size: 50,
  });

  // Fetch organization repositories
  const { 
    data: repositoriesData, 
    isLoading: repositoriesLoading 
  } = useOrganizationRepositories({
    organizationId: id,
    page: 0,
    size: 20,
  });

  // Debug logging
  console.log('[OrganizationWorkspace] Members Data:', membersData);
  console.log('[OrganizationWorkspace] Members Content:', membersData?.content);
  console.log('[OrganizationWorkspace] Members Loading:', membersLoading);
  console.log('[OrganizationWorkspace] Repositories Data:', repositoriesData);

  // Calculate stats from real data
  const contracts = contractsData?.content || [];
  const stats = {
    totalContracts: contracts.length,
    pendingApprovals: contracts.filter(c => c.status === 'PENDING_APPROVAL').length,
    approved: contracts.filter(c => c.status === 'APPROVED').length,
    rejected: contracts.filter(c => c.status === 'REJECTED').length,
    totalFiles: contractsData?.totalElements || 0, // Use contracts count as proxy for files
    totalRepositories: repositoriesData?.totalElements || 0,
  };

  const tabs = [
    { id: 'reports' as WorkspaceTab, label: t('organizations.workspace.tabs.reports'), icon: <CommonIcon name="chart" /> },
    { id: 'contracts' as WorkspaceTab, label: t('organizations.workspace.tabs.contracts'), icon: <CommonIcon name="file-text" /> },
    { id: 'repositories' as WorkspaceTab, label: t('organizations.workspace.tabs.repositories'), icon: <CommonIcon name="folder" /> },
    { id: 'members' as WorkspaceTab, label: t('organizations.workspace.tabs.members'), icon: <CommonIcon name="users" /> },
    { id: 'settings' as WorkspaceTab, label: t('organizations.workspace.tabs.settings'), icon: <CommonIcon name="settings" /> },
  ];

  const handleRefresh = async () => {
    console.log('[OrganizationWorkspace] Refreshing data...');
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['organization', id] });
      await queryClient.invalidateQueries({ queryKey: ['organization-contracts', id] });
      await queryClient.invalidateQueries({ queryKey: ['organization-members', id] });
      await queryClient.refetchQueries({ queryKey: ['organization', id] });
      await queryClient.refetchQueries({ queryKey: ['organization-contracts', id] });
      await queryClient.refetchQueries({ queryKey: ['organization-members', id] });

      console.log('[OrganizationWorkspace] Refresh completed');
    } catch (error) {
      console.error('[OrganizationWorkspace] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text={t('organizations.workspace.loading')} fullScreen />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <CommonIcon name="alert-circle" className="w-16 h-16 mx-auto mb-4" style={{ color: '#ef4444' }} />
            <p className="mb-4" style={{ color: '#374151' }}>{t('organizations.workspace.notFound')}</p>
            <Button
              variant="outline"
              onClick={() => navigate(ORGANIZATIONS_PATH)}
            >
              {t('organizations.workspace.backToList')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <OrganizationLayout
      title={organization?.name || ''}
      subtitle={organization?.createdAt ? `${t('organizations.workspace.subtitle')} • Ngày tạo: ${new Date(organization.createdAt).toLocaleDateString('vi-VN')}` : t('organizations.workspace.subtitle')}
      breadcrumbs={[
        { label: t('organizations.list.title'), href: ORGANIZATIONS_PATH },
        { label: organization?.name || '', current: true },
      ]}
      onRefresh={handleRefresh}
      headerRight={(
        <div className="flex items-center gap-2">
            <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
            {/* Temporarily disabled - Upload Contract feature */}
            {/* <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Upload className="w-4 h-4" />
              Upload Contract
            </Button> */}
        </div>
      )}
    >
      {/* Temporarily disabled - Upload Contract Dialog */}
      {/* <UploadContractDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        organizationId={id!}
        onSuccess={() => {
          console.log('✅ [Workspace] Contract uploaded successfully!');
          console.log('🔄 [Workspace] Manually triggering refetch...');

          // Force refetch contracts
          refetchContracts().then(() => {
            console.log('✅ [Workspace] Refetch completed!');
          });

          // Switch to contracts tab if not already there
          setActiveTab('contracts');
        }}
      /> */}

      <div className="space-y-6">

          {/* Stats Cards - Moved to Reports Tab */}
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-lg p-4 border" style={{ borderColor: '#bfdbfe', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#1d4ed8' }} >{t('organizations.workspace.stats.totalContracts')}</p>
                  <p className="text-3xl font-bold" style={{ color: '#1e3a8a' }} >{stats.totalContracts}</p>
                </div>
                <CommonIcon name="file-text" className="h-10" style={{ color: '#3b82f6' }} />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-lg p-4 border" style={{ borderColor: '#fef08a', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#b45309' }} >{t('organizations.workspace.stats.pending')}</p>
                  <p className="text-3xl font-bold" style={{ color: '#713f12' }} >{stats.pendingApprovals}</p>
                </div>
                <CommonIcon name="clock" className="w-10 h-10" style={{ color: '#eab308' }} />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-lg p-4 border" style={{ borderColor: '#bbf7d0', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#15803d' }} >{t('organizations.workspace.stats.approved')}</p>
                  <p className="text-3xl font-bold" style={{ color: '#14532d' }} >{stats.approved}</p>
                </div>
                <CommonIcon name="check" className="w-10 h-10" style={{ color: '#22c55e' }} />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="rounded-lg p-4 border" style={{ borderColor: '#fecaca', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: '#b91c1c' }} >{t('organizations.workspace.stats.rejected')}</p>
                  <p className="text-3xl font-bold" style={{ color: '#7f1d1d' }} >{stats.rejected}</p>
                </div>
                <CommonIcon name="x" className="w-10 h-10" style={{ color: '#ef4444' }} />
              </div>
            </motion.div>
          </div> */}

          {/* Tabs */}
          <Tabs style={{ borderBottom: '1px solid #e5e7eb' }}>
            <TabList className="flex gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <CommonTab
                    key={tab.id}
                    value={tab.id}
                    activeValue={activeTab}
                    onSelect={() => setActiveTab(tab.id)}
                    className="flex items-center gap-2 px-4 py-3"
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </CommonTab>
                );
              })}
            </TabList>
          </Tabs>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Tổng số hợp đồng */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg p-4 border" style={{ borderColor: '#bfdbfe', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#1d4ed8' }} >{t('organizations.workspace.stats.totalContracts')}</p>
                      <p className="text-3xl font-bold" style={{ color: '#1e3a8a' }} >{stats.totalContracts}</p>
                    </div>
                    <CommonIcon name="file-text" className="h-10" style={{ color: '#3b82f6' }} />
                  </div>
                </motion.div>

                {/* Đang chờ */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg p-4 border" style={{ borderColor: '#fef08a', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#b45309' }} >{t('organizations.workspace.stats.pending')}</p>
                      <p className="text-3xl font-bold" style={{ color: '#713f12' }} >{stats.pendingApprovals}</p>
                    </div>
                    <CommonIcon name="clock" className="w-10 h-10" style={{ color: '#eab308' }} />
                  </div>
                </motion.div>

                {/* Đã duyệt */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg p-4 border" style={{ borderColor: '#bbf7d0', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#15803d' }} >{t('organizations.workspace.stats.approved')}</p>
                      <p className="text-3xl font-bold" style={{ color: '#14532d' }} >{stats.approved}</p>
                    </div>
                    <CommonIcon name="check" className="w-10 h-10" style={{ color: '#22c55e' }} />
                  </div>
                </motion.div>

                {/* Đã từ chối */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg p-4 border" style={{ borderColor: '#fecaca', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#b91c1c' }} >{t('organizations.workspace.stats.rejected')}</p>
                      <p className="text-3xl font-bold" style={{ color: '#7f1d1d' }} >{stats.rejected}</p>
                    </div>
                    <CommonIcon name="x" className="w-10 h-10" style={{ color: '#ef4444' }} />
                  </div>
                </motion.div>

                {/* Tổng số file - MỚI */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg p-4 border" style={{ borderColor: '#e9d5ff', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#7e22ce' }} >Tổng số file</p>
                      <p className="text-3xl font-bold" style={{ color: '#4c1d95' }} >{stats.totalFiles}</p>
                    </div>
                    <CommonIcon name="file" className="w-10 h-10" style={{ color: '#a855f7' }} />
                  </div>
                </motion.div>

                {/* Tổng số repository - MỚI */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="rounded-lg p-4 border border-indigo-200" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: '#4338ca' }} >Tổng số repository</p>
                      <p className="text-3xl font-bold" style={{ color: '#312e81' }} >{stats.totalRepositories}</p>
                    </div>
                    <CommonIcon name="folder" className="w-10 h-10" style={{ color: '#6366f1' }} />
                  </div>
                </motion.div>
              </div>
            </div>
          )}

          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">

              {/* Contracts List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('organizations.workspace.allContracts')}</CardTitle>
                    <div className="flex items-center gap-2">
                      {contractsFetching && !contractsLoading && (
                        <span className="text-sm flex items-center gap-2" style={{ color: '#2563eb' }} >
                          <span className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2563eb' }} ></span>
                          {t('organizations.workspace.updating')}
                        </span>
                      )}
                      <Button 
                        variant="outline"
                        onClick={() => navigate(`/organizations/${id}/contracts/full-list`)}
                        className="flex items-center gap-2"
                      >
                        <CommonIcon name="folder" className="w-4 h-4" />
                        Mở danh sách kho
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {contractsLoading ? (
                    <div className="text-center py-12">
                      <LoadingSpinner text={t('organizations.workspace.loadingContracts')} />
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="text-center py-12">
                      <CommonIcon name="file-text" className="h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                      <p className="mb-4" style={{ color: '#4b5563' }} >{t('organizations.workspace.noContracts')}</p>
                      <p className="text-sm" style={{ color: '#6b7280' }} >{t('organizations.workspace.contractsAppear')}</p>
                    </div>
                  ) : (
                  <div className="space-y-3">
                  {/* Hiển thị TẤT CẢ chờ phê duyệt trước - KHÔNG GIỚI HẠN */}
                  {contracts
                  .filter(c => c.status === 'PENDING_APPROVAL')
                  .map((contract) => (
                  <div
                  key={contract.id}
                  className="p-4 border-2 rounded-lg hover:bg-yellow-100 transition-colors" style={{ borderColor: '#fef08a', backgroundColor: '#fefce8' }} >
                  <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                  <CommonIcon name="alert-circle" className="mt-1" style={{ color: '#ca8a04' }} />
                  <div className="flex-1">
                    <h4 className="font-medium" style={{ color: '#111827' }} >{contract.title}</h4>
                    {contract.content && (
                    <p className="text-sm mt-1" style={{ color: '#4b5563' }} >
                      {contract.content.length > 160 ? `${contract.content.slice(0, 160)}...` : contract.content}
                      </p>
                      )}
                        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#6b7280' }} >
                          <span>{contract.type}</span>
                        <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#fef3c7', color: '#b45309' }} >
                  {contract.status}
                  </span>
                  </div>
                  </div>
                  ))}

                  {/* Hiển thị các hợp đồng khác - GIỚI HẠN 10 */}
                  {contracts
                  .filter(c => c.status !== 'PENDING_APPROVAL')
                      .slice(0, showAllContracts ? undefined : 10)
                        .map((contract) => (
                          <div
                            key={contract.id}
                            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#e5e7eb' }} >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <CommonIcon name="file" className="mt-1" style={{ color: '#2563eb' }} />
                                <div className="flex-1">
                                  <h4 className="font-medium" style={{ color: '#111827' }} >{contract.title}</h4>
                                  {contract.content && (
                                    <p className="text-sm mt-1" style={{ color: '#4b5563' }} >
                                      {contract.content.length > 160 ? `${contract.content.slice(0, 160)}...` : contract.content}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: '#6b7280' }} >
                                    <span>{contract.type}</span>
                                    <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  contract.status === 'APPROVED'
                                    ? 'bg-green-100 text-green-700'
                                    : contract.status === 'PENDING_APPROVAL'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : contract.status === 'REJECTED'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {contract.status}
                              </span>
                            </div>
                          </div>
                        ))}

                      {/* Show More Button - chỉ cho contracts không phải PENDING */}
                      {!showAllContracts && contracts.filter(c => c.status !== 'PENDING_APPROVAL').length > 10 && (
                        <div className="flex justify-center mt-6">
                          <Button
                            variant="outline"
                            onClick={() => setShowAllContracts(true)}
                            className="flex items-center gap-2"
                          >
                            <CommonIcon name="folder" className="w-4 h-4" />
                            Mở danh sách kho ({contracts.length} hợp đồng)
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Repositories Tab */}
          {activeTab === 'repositories' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CommonIcon name="folder" size={20} />
                    {t('organizations.workspace.repositoriesTitle')}
                  </CardTitle>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/organizations/${id}/repositories/full-list`)}
                    className="flex items-center gap-2"
                  >
                    <CommonIcon name="folder" className="w-4 h-4" />
                    Mở danh sách kho
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {repositoriesLoading ? (
                  <div className="text-center py-12">
                    <LoadingSpinner text="Đang tải danh sách kho tài liệu..." />
                  </div>
                ) : repositoriesData?.content && repositoriesData.content.length > 0 ? (
                <div className="space-y-4">
                {(showAllRepositories ? repositoriesData.content : repositoriesData.content.slice(0, 10)).map((repo) => (
                      <motion.div
                        key={repo.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer" style={{ borderColor: '#e5e7eb' } style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }
                        onClick={() => navigate(`/repositories/${repo.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                            <CommonIcon name="folder" style={{ color: '#ffffff' }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate" style={{ color: '#111827' }} >{repo.name}</h4>
                            {repo.description && (
                              <p className="text-sm mt-1 line-clamp-2" style={{ color: '#4b5563' }} >
                                {repo.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                repo.type === 'ORGANIZATION' 
                                  ? 'bg-blue-100 text-blue-700'
                                  : repo.type === 'PERSONAL'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}>
                                {repo.type}
                              </span>
                              {repo.isPublic && (
                                <span className="text-xs flex items-center gap-1" style={{ color: '#6b7280' }} >
                                  <Eye className="w-3 h-3" />
                                  Công khai
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}

                    {/* Show More Button for Repositories */}
                    {!showAllRepositories && repositoriesData.content.length > 10 && (
                    <div className="flex justify-center mt-6">
                    <Button
                    variant="outline"
                    onClick={() => setShowAllRepositories(true)}
                    className="flex items-center gap-2"
                    >
                    <CommonIcon name="folder" className="w-4 h-4" />
                    Mở danh sách kho ({repositoriesData.content.length} repository)
                    </Button>
                    </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CommonIcon name="folder" className="h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                    <p className="mb-2" style={{ color: '#4b5563' }} >{t('organizations.workspace.noRepositories')}</p>
                    <p className="text-sm" style={{ color: '#6b7280' }} >{t('organizations.workspace.repositoriesDesc')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CommonIcon name="users" className="w-5 h-5" />
                    {t('organizations.workspace.membersCard.title')}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/organizations/${id}/members`)}
                  >
                    <CommonIcon name="settings" className="w-4 h-4" />
                    {t('organizations.workspace.membersCard.manage')}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {membersLoading ? (
                  <div className="text-center py-12">
                    <LoadingSpinner text="Đang tải danh sách thành viên..." />
                  </div>
                ) : membersData?.content && membersData.content.length > 0 ? (
                  <div className="space-y-3">
                    {membersData.content.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors" style={{ borderColor: '#e5e7eb' }} >
                        <div className="flex items-center gap-3">
                          <div className="h-10 rounded-full flex items-center justify-center" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                            <span className="font-semibold" style={{ color: '#ffffff' }} >
                              {member.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: '#111827' }} >{member.username}</p>
                            <p className="text-sm" style={{ color: '#4b5563' }} >{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }} >
                            {member.role || 'Member'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CommonIcon name="users" className="h-16 mx-auto mb-4" style={{ color: '#9ca3af' }} />
                    <p className="mb-4" style={{ color: '#4b5563' }} >
                      Chưa có thành viên nào trong tổ chức
                    </p>
                    <Button 
                      variant="outline" 
                      className="inline-flex items-center gap-2"
                      onClick={() => navigate(`/organizations/${id}/members`)}
                    >
                      <CommonIcon name="users" className="w-4 h-4" />
                      Quản lý thành viên
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings Tab - Now displays full organization information */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CommonIcon name="info" className="w-5 h-5" />
                  {t('organizations.workspace.settings.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: '#111827' }} >
                      <CommonIcon name="settings" className="w-5 h-5" />
                      {t('organizations.workspace.settings.general')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Organization Name */}
                      <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: '#bfdbfe', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                        <CommonIcon name="file-text" className="mt-1" style={{ color: '#2563eb' }} />
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.workspace.settings.orgName')}</p>
                          <p className="text-sm mt-1" style={{ color: '#374151' }} >{organization.name}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex items-start gap-3 p-4 rounded-lg border md:col-span-2" style={{ borderColor: '#bbf7d0', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                        <CommonIcon name="file-text" className="mt-1" style={{ color: '#16a34a' }} />
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.workspace.settings.description')}</p>
                          <p className="text-sm mt-1" style={{ color: '#374151' }} >
                            {organization.description || t('organizations.workspace.settings.noDescription')}
                          </p>
                        </div>
                      </div>

                      {/* Owner */}
                      {organization.owner && (
                        <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ borderColor: '#fef08a', backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                          <CommonIcon name="crown" className="mt-1" style={{ color: '#ca8a04' }} />
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.workspace.settings.owner')}</p>
                            <p className="text-sm mt-1" style={{ color: '#374151' }} >{organization.owner.username || organization.owner.email}</p>
                          </div>
                        </div>
                      )}

                      {/* Member Count */}
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-indigo-200" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                        <CommonIcon name="users" className="w-5 h-5 mt-1" style={{ color: '#4f46e5' }} />
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.workspace.settings.memberCount')}</p>
                          <p className="text-sm mt-1" style={{ color: '#374151' }} >{membersData?.totalElements || 0} thành viên</p>
                        </div>
                      </div>

                      {/* Visibility */}
                      <div className="flex items-start gap-3 p-4 rounded-lg border border-pink-200" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                        {organization.isPublic ? (
                          <Eye className="w-5 h-5 text-pink-600 mt-1" />
                        ) : (
                          <CommonIcon name="eye-off" className="w-5 h-5 text-pink-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.workspace.settings.visibility')}</p>
                          <p className="text-sm mt-1" style={{ color: '#374151' }} >
                            {organization.isPublic 
                              ? t('organizations.workspace.settings.public')
                              : t('organizations.workspace.settings.private')}
                          </p>
                        </div>
                      </div>

                      {/* Created At */}
                      {organization.createdAt && (
                        <div className="flex items-start gap-3 p-4 rounded-lg border border-teal-200" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                          <CommonIcon name="calendar" className="w-5 h-5 text-teal-600 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.workspace.settings.createdAt')}</p>
                            <p className="text-sm mt-1" style={{ color: '#374151' }} >
                              {new Date(organization.createdAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Updated At */}
                      {organization.updatedAt && (
                        <div className="flex items-start gap-3 p-4 rounded-lg border border-orange-200" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                          <CommonIcon name="calendar" className="w-5 h-5 text-orange-600 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium" style={{ color: '#111827' }} >{t('organizations.workspace.settings.updatedAt')}</p>
                            <p className="text-sm mt-1" style={{ color: '#374151' }} >
                              {new Date(organization.updatedAt).toLocaleDateString('vi-VN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </OrganizationLayout>
  );
};
