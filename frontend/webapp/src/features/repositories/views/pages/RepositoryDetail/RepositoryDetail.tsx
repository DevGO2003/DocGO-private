import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import {
  Button,
  Card,
  CardContent,
  RefreshButton,
} from '@shared/components';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { 
  Info,
  Users, 
  FileText, 
  Activity
} from 'lucide-react';
import { useRepository, useRepositoryMembers, useRepositoryActivity } from '@features/repositories/models/api/repositoryApi';
import { RepositoryType } from '@features/repositories/models/types';
import { NOT_FOUND_PATH } from '@constants';
import { InviteRepositoryMemberModal } from '../../components/InviteRepositoryMemberModal';
import { RepositoryDetailTabs } from '../../components/RepositoryDetailTabs';

export const RepositoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('info');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { t } = useTranslation();

  const { data: repository, isLoading, error } = useRepository(id || '');
  const { data: membersData, isLoading: membersLoading } = useRepositoryMembers(id || '');
  const { data: activityData, isLoading: activityLoading } = useRepositoryActivity(id || '');

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
                  <RepositoryDetailTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />

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
                        {membersLoading ? (
                          <div className="text-center py-8">Loading members...</div>
                        ) : membersData?.content && membersData.content.length > 0 ? (
                          <div className="space-y-4">
                          <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium text-gray-900">Members</h3>
                             <Button onClick={() => setShowInviteModal(true)}>
                          {t('repositories.detail.empty.members.invite')}
                          </Button>
                            </div>
                          {membersData.content.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                    <p className="font-medium text-gray-900">{member.username}</p>
                  <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  {member.role}
                  </span>
                  </div>
                  ))}
                  </div>
                  ) : (
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
                  )}
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
          organizationId={repository.organizationId}
        />
      )}
    </RepositoryLayout>
  );
};
