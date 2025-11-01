import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Users,
  Settings,
  BarChart3,
  AlertCircle,
  TrendingUp,
  Search,
  File as FileIcon,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  LoadingSpinner,
  RefreshButton,
  Tabs,
  TabList,
  CommonTab,
} from '@shared/components';
import { useOrganization } from '@/features/organizations';
import { useOrganizationMembers } from '@features/organizations/models/api/organizationApi';
import { useOrganizationContracts } from '@features/repositories/models/api/repositoryApi';
// import { UploadContractDialog } from '@features/contract'; // Temporarily disabled
import { ORGANIZATIONS_PATH } from '@constants';
import OrganizationLayout from '../../../layouts/OrganizationLayout';

type WorkspaceTab = 'contracts' | 'pending-approvals' | 'reports' | 'members' | 'settings';

export const OrganizationWorkspace = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('contracts');
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
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

  // Debug logging
  console.log('[OrganizationWorkspace] Members Data:', membersData);
  console.log('[OrganizationWorkspace] Members Content:', membersData?.content);
  console.log('[OrganizationWorkspace] Members Loading:', membersLoading);

  // Calculate stats from real data
  const contracts = contractsData?.content || [];
  const stats = {
    totalContracts: contracts.length,
    pendingApprovals: contracts.filter(c => c.status === 'PENDING_APPROVAL').length,
    approved: contracts.filter(c => c.status === 'APPROVED').length,
    rejected: contracts.filter(c => c.status === 'REJECTED').length,
  };

  const tabs = [
    { id: 'contracts' as WorkspaceTab, label: t('organizations.workspace.tabs.contracts'), icon: FileText },
    { id: 'pending-approvals' as WorkspaceTab, label: t('organizations.workspace.tabs.pendingApprovals'), icon: Clock },
    { id: 'reports' as WorkspaceTab, label: t('organizations.workspace.tabs.reports'), icon: BarChart3 },
    { id: 'members' as WorkspaceTab, label: t('organizations.workspace.tabs.members'), icon: Users },
    { id: 'settings' as WorkspaceTab, label: t('organizations.workspace.tabs.settings'), icon: Settings },
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
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
      subtitle={t('organizations.workspace.subtitle')}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">{t('organizations.workspace.stats.totalContracts')}</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalContracts}</p>
                </div>
                <FileText className="w-10 h-10 text-blue-500" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">{t('organizations.workspace.stats.pending')}</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.pendingApprovals}</p>
                </div>
                <Clock className="w-10 h-10 text-yellow-500" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">{t('organizations.workspace.stats.approved')}</p>
                  <p className="text-3xl font-bold text-green-900">{stats.approved}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700 font-medium">{t('organizations.workspace.stats.rejected')}</p>
                  <p className="text-3xl font-bold text-red-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
            </motion.div>
          </div>

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
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Contracts Tab */}
          {activeTab === 'contracts' && (
            <div className="space-y-6">
              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder={t('organizations.workspace.searchContracts')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button variant="outline">
                      {t('organizations.workspace.filter')}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Contracts List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{t('organizations.workspace.allContracts')}</CardTitle>
                    {contractsFetching && !contractsLoading && (
                      <span className="text-sm text-blue-600 flex items-center gap-2">
                        <span className="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
                        {t('organizations.workspace.updating')}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {contractsLoading ? (
                    <div className="text-center py-12">
                      <LoadingSpinner text={t('organizations.workspace.loadingContracts')} />
                    </div>
                  ) : contracts.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">{t('organizations.workspace.noContracts')}</p>
                      <p className="text-sm text-gray-500">{t('organizations.workspace.contractsAppear')}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {contracts.map((contract) => (
                        <div
                          key={contract.id}
                          className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <FileIcon className="w-5 h-5 text-blue-600 mt-1" />
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
              {/* Pending Approvals Tab */}
              {activeTab === 'pending-approvals' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      {t('organizations.workspace.pendingApprovalsTitle')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">{t('organizations.workspace.noPending')}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('organizations.workspace.membersCard.title')}
                  </CardTitle>
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2"
                    onClick={() => navigate(`/organizations/${id}/members`)}
                  >
                    <Settings className="w-4 h-4" />
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
                          {member.createdAt && (
                            <span className="text-xs text-gray-500">
                              {new Date(member.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">
                      Chưa có thành viên nào trong tổ chức
                    </p>
                    <Button 
                      variant="outline" 
                      className="inline-flex items-center gap-2"
                      onClick={() => navigate(`/organizations/${id}/members`)}
                    >
                      <Users className="w-4 h-4" />
                      Quản lý thành viên
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <Card>
              <CardHeader>
                <CardTitle>{t('organizations.workspace.settings.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('organizations.workspace.settings.general')}</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{t('organizations.workspace.settings.orgName')}</p>
                          <p className="text-sm text-gray-600">{organization.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{t('organizations.workspace.settings.description')}</p>
                          <p className="text-sm text-gray-600">
                            {organization.description || t('organizations.workspace.settings.noDescription')}
                          </p>
                        </div>
                      </div>
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
