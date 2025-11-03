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

type WorkspaceTab = 'info' | 'reports' | 'contracts' | 'repositories' | 'members' | 'settings';

export const OrganizationWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('info');
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
    size: 5,
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
    size: 5,
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
    { id: 'info' as WorkspaceTab, label: t('organizations.workspace.tabs.info', { defaultValue: 'Thông tin' }), icon: <CommonIcon name="info" /> },
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
            <CommonIcon name="alert-circle" className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-gray-700 mb-4">{t('organizations.workspace.notFound')}</p>
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
            <div
              className="rounded-lg p-4 border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">{t('organizations.workspace.stats.totalContracts')}</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalContracts}</p>
                </div>
                <CommonIcon name="file-text" className="w-10 h-10 text-blue-500" />
              </div>
            </div>

            <div
              className="rounded-lg p-4 border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">{t('organizations.workspace.stats.pending')}</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingApprovals}</p>
                </div>
                <CommonIcon name="clock" className="w-10 h-10 text-yellow-500" />
              </div>
            </div>

            <div
              className="rounded-lg p-4 border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">{t('organizations.workspace.stats.approved')}</p>
                  <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <CommonIcon name="check" className="w-10 h-10 text-green-500" />
              </div>
            </div>

            <div
              className="rounded-lg p-4 border"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">{t('organizations.workspace.stats.rejected')}</p>
                  <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                </div>
                <CommonIcon name="x" className="w-10 h-10 text-red-500" />
              </div>
            </div>
          </div> */}

          {/* Tabs */}
          <Tabs className="border-b border-gray-200">
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
        <div
          key={activeTab}
        >
          {/* Info Tab */}
          {activeTab === 'info' && organization && (
            <Card className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{t('organizations.workspace.settings.orgName')}</h4>
                    <p className="text-lg font-semibold text-gray-900">{organization.name}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{t('organizations.workspace.settings.visibility')}</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {organization.isPublic ? t('organizations.workspace.settings.public') : t('organizations.workspace.settings.private')}
                    </p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">{t('organizations.workspace.settings.description')}</h4>
                  <p className="text-gray-700">{organization.description || t('organizations.workspace.settings.noDescription')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t('organizations.workspace.stats.totalContracts')}</h4>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalContracts}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t('organizations.workspace.stats.totalRepositories', { defaultValue: 'Kho lưu trữ' })}</h4>
                    <p className="text-2xl font-semibold text-gray-900">{stats.totalRepositories}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">{t('organizations.workspace.tabs.members')}</h4>
                    <p className="text-2xl font-semibold text-gray-900">{membersData?.totalElements || 0}</p>
                  </div>
                </div>

                {organization.createdAt && (
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-500 mb-2">{t('organizations.workspace.settings.createdAt')}</h4>
                    <p className="text-gray-700">{new Date(organization.createdAt).toLocaleDateString('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Tổng số hợp đồng */}
                <div
                  className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">{t('organizations.workspace.stats.totalContracts')}</p>
                      <p className="text-3xl font-bold text-blue-900">{stats.totalContracts}</p>
                    </div>
                    <CommonIcon name="file-text" className="w-10 h-10 text-blue-500" />
                  </div>
                </div>

                {/* Đang chờ */}
                <div
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-700 font-medium">{t('organizations.workspace.stats.pending')}</p>
                      <p className="text-3xl font-bold text-yellow-900">{stats.pendingApprovals}</p>
                    </div>
                    <CommonIcon name="clock" className="w-10 h-10 text-yellow-500" />
                  </div>
                </div>

                {/* Đã duyệt */}
                <div
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">{t('organizations.workspace.stats.approved')}</p>
                      <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                    </div>
                    <CommonIcon name="check" className="w-10 h-10 text-green-500" />
                  </div>
                </div>

                {/* Đã từ chối */}
                <div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-700 font-medium">{t('organizations.workspace.stats.rejected')}</p>
                      <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                    </div>
                    <CommonIcon name="x" className="w-10 h-10 text-red-500" />
                  </div>
                </div>

                {/* Tổng số file - MỚI */}
                <div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Tổng số file</p>
                      <p className="text-3xl font-bold text-purple-900">{stats.totalFiles}</p>
                    </div>
                    <CommonIcon name="file" className="w-10 h-10 text-purple-500" />
                  </div>
                </div>

                {/* Tổng số repository - MỚI */}
                <div
                  whileHover={{ scale: 1.02 }}
                  className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg p-4 border border-indigo-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-indigo-700 font-medium">Tổng số repository</p>
                      <p className="text-3xl font-bold text-indigo-900">{stats.totalRepositories}</p>
                    </div>
                    <CommonIcon name="folder" className="w-10 h-10 text-indigo-500" />
                  </div>
                </div>
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
                        <span className="text-sm text-blue-600 flex items-center gap-2">
                          <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
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
                      <CommonIcon name="file-text" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">{t('organizations.workspace.noContracts')}</p>
                      <p className="text-sm text-gray-500">{t('organizations.workspace.contractsAppear')}</p>
                    </div>
                  ) : (
                  <div className="space-y-3">
                  {/* Hiển thị TẤT CẢ chờ phê duyệt trước - KHÔNG GIỚI HẠN */}
                  {contracts
                  .filter(c => c.status === 'PENDING_APPROVAL')
                  .map((contract) => (
                  <div
                  key={contract.id}
                  className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                  <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                  <CommonIcon name="alert-circle" className="w-5 h-5 text-yellow-600 mt-1" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{contract.title}</h4>
                    {contract.content && (
                    <p className="text-sm text-gray-600 mt-1">
                      {contract.content.length > 160 ? `${contract.content.slice(0, 160)}...` : contract.content}
                      </p>
                      )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>{contract.type}</span>
                        <span>{new Date(contract.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
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
                            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3 flex-1">
                                <CommonIcon name="file" className="w-5 h-5 text-blue-600 mt-1" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{contract.title}</h4>
                                  {contract.content && (
                                    <p className="text-sm text-gray-600 mt-1">
                                      {contract.content.length > 160 ? `${contract.content.slice(0, 160)}...` : contract.content}
                                    </p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
                      <div
                        key={repo.id}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer bg-gradient-to-br from-gray-50 to-white"
                        onClick={() => navigate(`/repositories/${repo.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                            <CommonIcon name="folder" className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate">{repo.name}</h4>
                            {repo.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
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
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  Công khai
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
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
                    <CommonIcon name="folder" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">{t('organizations.workspace.noRepositories')}</p>
                    <p className="text-sm text-gray-500">{t('organizations.workspace.repositoriesDesc')}</p>
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
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {member.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.username}</p>
                            <p className="text-sm text-gray-600">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {member.role || 'Member'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CommonIcon name="users" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CommonIcon name="settings" className="w-5 h-5" />
                      {t('organizations.workspace.settings.general')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Organization Name */}
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <CommonIcon name="file-text" className="w-5 h-5 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{t('organizations.workspace.settings.orgName')}</p>
                          <p className="text-sm text-gray-700 mt-1">{organization.name}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 md:col-span-2">
                        <CommonIcon name="file-text" className="w-5 h-5 text-green-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{t('organizations.workspace.settings.description')}</p>
                          <p className="text-sm text-gray-700 mt-1">
                            {organization.description || t('organizations.workspace.settings.noDescription')}
                          </p>
                        </div>
                      </div>

                      {/* Owner */}
                      {organization.owner && (
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                          <CommonIcon name="crown" className="w-5 h-5 text-yellow-600 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{t('organizations.workspace.settings.owner')}</p>
                            <p className="text-sm text-gray-700 mt-1">{organization.owner.username || organization.owner.email}</p>
                          </div>
                        </div>
                      )}

                      {/* Member Count */}
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                        <CommonIcon name="users" className="w-5 h-5 text-indigo-600 mt-1" />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{t('organizations.workspace.settings.memberCount')}</p>
                          <p className="text-sm text-gray-700 mt-1">{membersData?.totalElements || 0} thành viên</p>
                        </div>
                      </div>

                      {/* Visibility */}
                      <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                        {organization.isPublic ? (
                          <Eye className="w-5 h-5 text-pink-600 mt-1" />
                        ) : (
                          <CommonIcon name="eye-off" className="w-5 h-5 text-pink-600 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{t('organizations.workspace.settings.visibility')}</p>
                          <p className="text-sm text-gray-700 mt-1">
                            {organization.isPublic 
                              ? t('organizations.workspace.settings.public')
                              : t('organizations.workspace.settings.private')}
                          </p>
                        </div>
                      </div>

                      {/* Created At */}
                      {organization.createdAt && (
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
                          <CommonIcon name="calendar" className="w-5 h-5 text-teal-600 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{t('organizations.workspace.settings.createdAt')}</p>
                            <p className="text-sm text-gray-700 mt-1">
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
                        <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                          <CommonIcon name="calendar" className="w-5 h-5 text-orange-600 mt-1" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{t('organizations.workspace.settings.updatedAt')}</p>
                            <p className="text-sm text-gray-700 mt-1">
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
        </div>
      </div>
    </OrganizationLayout>
  );
};
