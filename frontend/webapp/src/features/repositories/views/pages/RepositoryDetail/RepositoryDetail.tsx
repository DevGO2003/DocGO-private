import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button, RefreshButton, Card } from '@shared/components';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { useRepository, useRepositoryMembers } from '@features/repositories/models/api/repositoryApi';
import { NOT_FOUND_PATH } from '@constants';
import { InviteRepositoryMemberModal } from '../../components/InviteRepositoryMemberModal';
import { RepositoryDetailTabs } from '../../components/RepositoryDetailTabs';

export const RepositoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { t } = useTranslation();

  const { data: repository, isLoading, error } = useRepository(id || '');
  const { data: membersData, isLoading: membersLoading } = useRepositoryMembers(id || '');

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

  const handleUpdatePermission = async (memberId: string, permissionType: 'canUpload' | 'canView' | 'canDelete', value: boolean) => {
    try {
      console.log(`[RepositoryDetail] Updating permission: ${permissionType} = ${value} for member ${memberId}`);
      
      // Call API to update permissions
      const response = await fetch(
        `/api/v1/repositories/${id}/members/${memberId}/permissions`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
          },
          body: JSON.stringify({
            [permissionType]: value
          })
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update permission: ${response.statusText}`);
      }

      // Refetch members data
      await queryClient.invalidateQueries({ queryKey: ['repository-members', id] });
      await queryClient.refetchQueries({ queryKey: ['repository-members', id] });

      console.log('[RepositoryDetail] Permission updated successfully');
    } catch (error) {
      console.error('[RepositoryDetail] Failed to update permission:', error);
      alert(t('repositories.detail.members.permissions.error'));
    }
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
      description={repository ? repository.description : undefined}
      breadcrumbs={[
        { label: t('nav.repositories'), href: '/repositories' },
        repository ? { label: repository.name, current: true } : { label: t('app.loading'), current: true },
      ]}
      loading={isLoading}
      loadingText={t('repositories.detail.loading')}
      onRefresh={handleRefresh}
      headerRight={
        <>
          <Button variant="outline" onClick={goToUploadWithRepo} className="flex items-center gap-2">
            <CommonIcon name="upload" size={16} />
            {t('repositories.detail.actions.upload')}
          </Button>
          <Button variant="outline" onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
            <CommonIcon name="user-plus" size={16} />
            {t('repositories.detail.actions.invite')}
          </Button>
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
        </>
      }
    >
      {(!repository && !error) ? null : (
        <div>
            {/* Optional error banner */}
            {error && (
              <Card className="mb-4 p-4 border-l-4" style={{ borderLeftColor: '#dc2626', backgroundColor: '#fef2f2' }}>
                <p style={{ color: '#b91c1c' }}>{t('repositories.detail.error')}</p>
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
                  {activeTab === 'overview' && (
                    <Card className="p-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{t('repositories.detail.info.name')}</h4>
                            <p className="text-base font-medium" style={{ color: '#111827' }}>
                              {repository?.name}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{t('repositories.detail.type.label')}</h4>
                            <p className="text-base" style={{ color: '#111827' }}>
                              {repository?.type === 'PERSONAL' ? t('repositories.detail.type.personal') : t('repositories.detail.type.organization')}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{t('repositories.detail.info.status')}</h4>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
                              backgroundColor: repository?.isPublic ? '#dcfce7' : '#f3f4f6',
                              color: repository?.isPublic ? '#166534' : '#374151'
                            }}>
                              {repository?.isPublic ? t('repositories.detail.type.public') : t('repositories.detail.type.private')}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-2" style={{ color: '#6b7280' }}>{t('repositories.detail.info.description')}</h4>
                          <p style={{ color: '#374151' }}>
                            {repository?.description || t('repositories.detail.info.noDescription')}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-medium mb-2" style={{ color: '#6b7280' }}>{t('repositories.detail.info.owner')}</h4>
                            <p style={{ color: '#111827' }}>
                              {repository?.ownerName || t('repositories.detail.info.noInfo')}
                            </p>
                          </div>
                          {repository?.organizationId && (
                            <div>
                              <h4 className="text-sm font-medium mb-2" style={{ color: '#6b7280' }}>{t('repositories.detail.info.organization')}</h4>
                              <p style={{ color: '#111827' }}>
                                {repository?.organizationName || t('repositories.detail.info.none')}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{t('repositories.detail.stats.files')}</h4>
                            <p className="text-2xl font-semibold" style={{ color: '#111827' }}>
                              {repository?.fileCount || 0}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{t('repositories.detail.stats.members')}</h4>
                            <p className="text-2xl font-semibold" style={{ color: '#111827' }}>
                              {repository?.memberCount || 0}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{t('repositories.detail.stats.storage')}</h4>
                            <p className="text-2xl font-semibold" style={{ color: '#111827' }}>
                              {formatFileSize(repository?.totalSize)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{t('repositories.detail.info.createdAt')}</h4>
                            <p style={{ color: '#111827' }}>
                              {repository?.createdAt ? new Date(repository.createdAt).toLocaleString('vi-VN') : '-'}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1" style={{ color: '#6b7280' }}>{t('repositories.detail.info.updatedAt')}</h4>
                            <p style={{ color: '#111827' }}>
                              {repository?.updatedAt ? new Date(repository.updatedAt).toLocaleString('vi-VN') : '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )}

                  {activeTab === 'files' && (
                    <Card className="p-6">
                        {repository.files && repository.files.length > 0 ? (
                          <div>
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
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
                                  className="flex items-center justify-between p-4 border rounded-lg transition-colors cursor-pointer" style={{ borderColor: '#e5e7eb' }}
                                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  onClick={() => navigate(`/repositories/${repository.id}/files/${file.id}`)}
                                >
                                  <div className="flex items-center gap-3">
                                    <CommonIcon name="file-text" className="w-5 h-5 text-blue-500" />
                                    <div>
                                      <h4 className="font-medium" style={{ color: '#111827' }}>{file.name}</h4>
                                      <p className="text-sm" style={{ color: '#6b7280' }}>
                                        {t('repositories.detail.files.uploaded')}: {new Date(file.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-sm" style={{ color: '#6b7280' }}>
                                    {file.size ? formatFileSize(file.size) : '-'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CommonIcon name="file-text" className="w-12 h-12 mx-auto mb-4" color="#9ca3af" />
                            <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                              {t('repositories.detail.empty.files.title')}
                            </h3>
                            <p className="mb-4" style={{ color: '#4b5563' }}>
                              {t('repositories.detail.empty.files.desc')}
                            </p>
                            <Button onClick={goToUploadWithRepo}>{t('repositories.detail.empty.files.upload')}</Button>
                          </div>
                        )}
                    </Card>
                  )}

                  {activeTab === 'members' && (
                    <Card className="p-6">
                        {membersLoading ? (
                          <div className="text-center py-8">{t('app.loading')}</div>
                        ) : membersData?.content && membersData.content.length > 0 ? (
                          <div className="space-y-4">
                          <div className="flex justify-between items-center">
                          <h3 className="text-lg font-medium" style={{ color: '#111827' }}>{t('repositories.detail.tabs.members')}</h3>
                             <Button onClick={() => setShowInviteModal(true)}>
                          {t('repositories.detail.empty.members.invite')}
                          </Button>
                            </div>
                          {membersData.content.map((member: any) => (
                        <div key={member.id} className="p-4 rounded-lg border" style={{ backgroundColor: '#f9fafb', borderColor: '#e5e7eb' }}>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium" style={{ color: '#111827' }}>{member.username}</p>
                              <p className="text-sm" style={{ color: '#4b5563' }}>{member.email}</p>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                              {member.role}
                            </span>
                          </div>
                          
                          {/* Permissions Section */}
                          <div className="space-y-3 border-t pt-4" style={{ borderColor: '#e5e7eb' }}>
                            <p className="text-sm font-medium" style={{ color: '#374151' }}>{t('repositories.detail.members.permissions')}</p>
                            
                            <div className="flex items-center justify-between">
                              <label className="text-sm" style={{ color: '#4b5563' }}>{t('repositories.detail.members.permissions.upload')}</label>
                              <input 
                                type="checkbox" 
                                checked={member.permissions?.canUpload || false}
                                onChange={(e) => handleUpdatePermission(member.id, 'canUpload', e.target.checked)}
                                className="w-4 h-4 rounded"
                                disabled={member.role === 'OWNER'}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label className="text-sm" style={{ color: '#4b5563' }}>{t('repositories.detail.members.permissions.view')}</label>
                              <input 
                                type="checkbox" 
                                checked={member.permissions?.canView || false}
                                onChange={(e) => handleUpdatePermission(member.id, 'canView', e.target.checked)}
                                className="w-4 h-4 rounded"
                                disabled={member.role === 'OWNER'}
                              />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <label className="text-sm" style={{ color: '#4b5563' }}>{t('repositories.detail.members.permissions.delete')}</label>
                              <input 
                                type="checkbox" 
                                checked={member.permissions?.canDelete || false}
                                onChange={(e) => handleUpdatePermission(member.id, 'canDelete', e.target.checked)}
                                className="w-4 h-4 rounded"
                                disabled={member.role === 'OWNER'}
                              />
                            </div>
                          </div>
                        </div>
                  ))}
                  </div>
                  ) : (
                  <div className="text-center py-8">
                  <CommonIcon name="users" className="w-12 h-12 mx-auto mb-4" color="#9ca3af" />
                  <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                  {t('repositories.detail.empty.members.title')}
                  </h3>
                  <p className="mb-4" style={{ color: '#4b5563' }}>
                  {t('repositories.detail.empty.members.desc')}
                  </p>
                  <Button onClick={() => setShowInviteModal(true)}>
                  {t('repositories.detail.empty.members.invite')}
                  </Button>
                  </div>
                  )}
                    </Card>
                  )}

                  {activeTab === 'activity' && (
                    <Card className="p-6">
                        <div className="text-center py-8">
                          <CommonIcon name="clock" className="w-12 h-12 mx-auto mb-4" color="#9ca3af" />
                          <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>
                            {t('repositories.detail.empty.activity.title')}
                          </h3>
                          <p style={{ color: '#4b5563' }}>
                            {t('repositories.detail.empty.activity.desc')}
                          </p>
                        </div>
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
