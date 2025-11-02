import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  RefreshButton,
  Tabs,
  TabList,
  CommonTab,
} from '@shared/components';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { 
  Info,
  Users, 
  FileText, 
  Activity
} from 'lucide-react';
import { useRepository } from '@features/repositories/models/api/repositoryApi';
import { RepositoryType } from '@features/repositories/models/types';
import { NOT_FOUND_PATH } from '@constants';
import { InviteRepositoryMemberModal } from '../../components/InviteRepositoryMemberModal';

export const RepositoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { t } = useTranslation();

  const { data: repository, isLoading, error } = useRepository(id || '');

  // Redirect sang 404 nếu repository ID không hợp lệ hoặc không tồn tại
  useEffect(() => {
    if (!isLoading && !id) {
      navigate(NOT_FOUND_PATH, { replace: true });
    }
    if (!isLoading && error) {
      navigate(NOT_FOUND_PATH, { replace: true });
    }
  }, [isLoading, id, error, navigate]);

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const goToUploadWithRepo = () => {
    if (!repository) return;
    const repoName = encodeURIComponent(repository.name || '');
    navigate(`/upload?repositoryId=${repository.id}&repositoryName=${repoName}`);
  };

  const handleRefresh = async () => {
    console.log('[RepositoryDetail] Refreshing data...');
    setIsRefreshing(true);
    try {
      // Invalidate repository detail query
      await queryClient.invalidateQueries({ queryKey: ['repository', id] });
      await queryClient.refetchQueries({ queryKey: ['repository', id] });

      console.log('[RepositoryDetail] Refresh completed');
    } catch (error) {
      console.error('[RepositoryDetail] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <RepositoryLayout
      title={repository ? repository.name : t('repositories.files.breadcrumbs.repository')}
      subtitle={repository ? undefined : t('repositories.detail.loading')}
      breadcrumbs={[
        { label: t('nav.repositories'), href: '/repositories' },
        repository ? { label: repository.name, current: true } : { label: t('app.loading'), current: true },
      ]}
      loading={isLoading}
      loadingText={t('repositories.detail.loading')}
      onRefresh={handleRefresh}
      headerRight={
        <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
      }
    >
      {(!repository && !error) ? null : (
        <div>
            {/* Optional error banner */}
            {error && (
              <Card className="border-red-200 bg-red-50 mb-4">
                <CardContent className="p-4">
                  <p className="text-red-700">{t('repositories.detail.error')}</p>
                </CardContent>
              </Card>
            )}

            {/* Content Section */}
            {repository && (
              <div>
                  {/* Tabs Navigation */}
                  <Tabs className="border-b border-gray-200 mb-6">
                    <TabList className="flex gap-4">
                      <CommonTab
                        value="info"
                        activeValue={activeTab}
                        onSelect={() => setActiveTab('info')}
                        className="pb-3 px-4"
                      >
                        <div className="flex items-center gap-2">
                          <Info className="w-4 h-4" />
                          Thông tin
                        </div>
                      </CommonTab>
                      <CommonTab
                        value="files"
                        activeValue={activeTab}
                        onSelect={() => setActiveTab('files')}
                        className="pb-3 px-4"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          {t('repositories.detail.tabs.files')}
                        </div>
                      </CommonTab>
                      <CommonTab
                        value="members"
                        activeValue={activeTab}
                        onSelect={() => setActiveTab('members')}
                        className="pb-3 px-4"
                      >
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {t('repositories.detail.tabs.members')}
                        </div>
                      </CommonTab>
                      <CommonTab
                        value="activity"
                        activeValue={activeTab}
                        onSelect={() => {}}
                        className="pb-3 px-4 opacity-50 cursor-not-allowed"
                        disabled
                      >
                        <div className="flex items-center gap-2" title="Tạm thời chưa có, tương lai các phiên bản kế tiếp sẽ có">
                          <Activity className="w-4 h-4" />
                          {t('repositories.detail.tabs.activity')}
                        </div>
                      </CommonTab>
                    </TabList>
                  </Tabs>

                  {/* Tab Content */}
                  {activeTab === 'info' && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="space-y-6">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Mô tả</h4>
                            <p className="text-gray-600">
                              {repository?.description || 'Không có mô tả'}
                            </p>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Chủ sở hữu</h4>
                              <p className="text-gray-600">
                                {repository?.ownerName || 'Chưa có thông tin'}
                              </p>
                            </div>
                            {repository?.organizationId && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">Tổ chức</h4>
                                <p className="text-gray-600">
                                  {repository?.organizationName || 'Không có'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'files' && (
                    <Card>
                      <CardContent className="p-6">
                        {repository.files && repository.files.length > 0 ? (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {t('repositories.detail.files.list')} ({repository.files.length})
                              </h3>
                              <Button onClick={goToUploadWithRepo}>
                                {t('repositories.detail.empty.files.upload')}
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {repository.files.map((file) => (
                                <div
                                  key={file.id}
                                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                                  onClick={() => navigate(`/repositories/${repository.id}/files/${file.id}`)}
                                >
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-500" />
                                    <div>
                                      <h4 className="font-medium text-gray-900">{file.name}</h4>
                                      <p className="text-sm text-gray-500">
                                        {t('repositories.detail.files.uploaded')}: {new Date(file.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {file.size ? formatFileSize(file.size) : '-'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              {t('repositories.detail.empty.files.title')}
                            </h3>
                            <p className="text-gray-600 mb-4">
                              {t('repositories.detail.empty.files.desc')}
                            </p>
                            <Button onClick={goToUploadWithRepo}>{t('repositories.detail.empty.files.upload')}</Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'members' && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center py-8">
                          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('repositories.detail.empty.members.title')}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {t('repositories.detail.empty.members.desc')}
                          </p>
                          <Button onClick={() => setShowInviteModal(true)}>
                            {t('repositories.detail.empty.members.invite')}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {activeTab === 'activity' && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('repositories.detail.empty.activity.title')}
                          </h3>
                          <p className="text-gray-600">
                            {t('repositories.detail.empty.activity.desc')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            )}
        </div>
      )}

      {/* Invite Member Modal */}
      {repository && (
        <InviteRepositoryMemberModal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          repositoryId={repository.id}
          repositoryType={repository.type}
          repositoryName={repository.name}
        />
      )}
    </RepositoryLayout>
  );
};
