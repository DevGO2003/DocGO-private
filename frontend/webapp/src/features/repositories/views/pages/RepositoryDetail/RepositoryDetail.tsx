import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button, RefreshButton, Card, CommonSwitch } from '@shared/components';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { useRepository, useRepositoryMembers, useUpdateMemberPermissions, useDeleteRepository } from '@features/repositories/models/api/repositoryApi';
import { NOT_FOUND_PATH, REPOSITORY_ROUTES, buildPath } from '@constants';
import { InviteRepositoryMemberModal } from '../../components/InviteRepositoryMemberModal';

export const RepositoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('files');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const { t } = useTranslation();
  const updatePermissionsMutation = useUpdateMemberPermissions();

  const { data: repository, isLoading, error } = useRepository(id || '');
  const { data: membersData, isLoading: membersLoading } = useRepositoryMembers(id || '');

  // Debug logging
  useEffect(() => {
    console.log('[RepositoryDetail] State:', {
      isLoading,
      hasRepository: !!repository,
      hasError: !!error,
      errorStatus: (error as any)?.response?.status,
      repositoryId: id
    });

    if (repository) {
      console.log('[RepositoryDetail] ✅ Repository loaded:', repository);
      console.log('[RepositoryDetail] Owner info:', {
        ownerName: repository.ownerName,
        ownerUserId: repository.ownerUserId,
      });
    }

    if (error) {
      console.error('[RepositoryDetail] ❌ Error loading repository:', error);
      console.error('[RepositoryDetail] Error response:', (error as any)?.response);
    }
  }, [repository, isLoading, error, id]);

  useEffect(() => {
    if (membersData) {
      console.log('[RepositoryDetail] ✅ Members loaded:', membersData);
      console.log('[RepositoryDetail] Members count:', membersData.content?.length);
    }
  }, [membersData]);

  // Redirect sang 404 nếu repository ID không hợp lệ hoặc không tồn tại
  useEffect(() => {
    if (!isLoading && !id) {
      navigate(NOT_FOUND_PATH, { replace: true });
      return;
    }
    if (!isLoading && error) {
      // Chỉ redirect nếu lỗi là 404 Not Found
      const err = error as any;
      if (err.response?.status === 404) {
        navigate(NOT_FOUND_PATH, { replace: true });
      }
      // Các lỗi khác sẽ được hiển thị trên UI (error banner)
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

  const handleUpdatePermission = (memberId: string, permissionType: 'canUpload' | 'canView' | 'canDelete', value: boolean) => {
    if (!id) return;

    updatePermissionsMutation.mutate(
      {
        repositoryId: id,
        memberId,
        permissions: { [permissionType]: value },
      },
      {
        onError: (error) => {
          console.error('[RepositoryDetail] Failed to update permission:', error);
          alert(t('repositories.detail.members.permissions.error'));
        },
      }
    );
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

  // Show error UI if repository fails to load (except 404 which redirects)
  if (!isLoading && error && (error as any)?.response?.status !== 404) {
    return (
      <RepositoryLayout
        title={t('repositories.detail.error.title', { defaultValue: 'Lỗi tải repository' })}
        breadcrumbs={[
          { label: t('nav.repositories'), href: '/repositories' },
          { label: t('repositories.detail.error.title'), current: true },
        ]}
      >
        <div className="flex flex-col items-center justify-center py-16">
          <CommonIcon name="alert-circle" className="w-16 h-16 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('repositories.detail.error.title', { defaultValue: 'Không thể tải repository' })}
          </h2>
          <p className="text-gray-600 mb-4 text-center max-w-md">
            {(error as any)?.response?.data?.message ||
              (error as any)?.message ||
              t('repositories.detail.error.description', { defaultValue: 'Đã xảy ra lỗi khi tải thông tin repository. Vui lòng thử lại.' })}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/repositories')}>
              <CommonIcon name="arrow-left" className="mr-2" size={16} />
              {t('repositories.detail.error.backToList', { defaultValue: 'Quay lại danh sách' })}
            </Button>
            <Button onClick={handleRefresh}>
              <CommonIcon name="rotate-cw" className="mr-2" size={16} />
              {t('repositories.detail.error.retry', { defaultValue: 'Thử lại' })}
            </Button>
          </div>
        </div>
      </RepositoryLayout>
    );
  }

  const deleteRepositoryMutation = useDeleteRepository();

  const handleDelete = async () => {
    if (!repository) return;

    if (window.confirm(t('repositories.detail.actions.deleteConfirm', { defaultValue: 'Bạn có chắc chắn muốn xóa repository này không? Hành động này không thể hoàn tác.' }))) {
      try {
        await deleteRepositoryMutation.mutateAsync(id || '');
        navigate('/repositories');
      } catch (error) {
        console.error('[RepositoryDetail] Failed to delete repository:', error);
        alert(t('repositories.detail.actions.deleteError', { defaultValue: 'Có lỗi xảy ra khi xóa repository.' }));
      }
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
          <Button
            variant="outline"
            onClick={() => navigate(buildPath(REPOSITORY_ROUTES.FILES_LIST, { id: id || '' }))}
            className="flex items-center gap-2"
          >
            <CommonIcon name="folder-open" size={16} />
            {t('repositories.detail.actions.viewFiles', { defaultValue: 'Danh sách tệp' })}
          </Button>
          <Button variant="outline" onClick={goToUploadWithRepo} className="flex items-center gap-2">
            <CommonIcon name="upload" size={16} />
            {t('repositories.detail.actions.upload')}
          </Button>
          <Button variant="outline" onClick={() => setShowInviteModal(true)} className="flex items-center gap-2">
            <CommonIcon name="user-plus" size={16} />
            {t('repositories.detail.actions.invite')}
          </Button>
          {/* Delete Button - Only show for owner or if user has permission (checking owner for now as safety) */}
          {(repository?.ownerUserId && repository?.ownerUserId === (repository as any).currentUserId) || true ? (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <CommonIcon name="trash-2" size={16} />
              {t('repositories.detail.actions.delete', { defaultValue: 'Xóa' })}
            </Button>
          ) : null}
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
        </>
      }
      tabsConfig={{
        mainTabs: [
          {
            id: 'files',
            label: t('repositories.detail.tabs.files'),
            icon: 'file-text',
            disabled: false,
          },
          {
            id: 'members',
            label: t('repositories.detail.tabs.members'),
            icon: 'users',
            disabled: false,
          },
          {
            id: 'overview',
            label: t('repositories.detail.tabs.overview', { defaultValue: 'Tổng quan' }),
            icon: 'info',
            disabled: false,
          },
        ],
        activeMainTab: activeTab,
        onMainTabChange: setActiveTab,
        loading: isLoading,
      }}
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

              {/* Tab Content */}
              {activeTab === 'overview' && (
                <Card className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.info.name')}</h4>
                        <p className="text-base text-gray-900 font-medium">
                          {repository?.name}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.type.label')}</h4>
                        <p className="text-base text-gray-900">
                          {repository?.type === 'PERSONAL' ? t('repositories.detail.type.personal') : t('repositories.detail.type.organization')}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.info.status')}</h4>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{
                          backgroundColor: repository?.isPublic ? '#dcfce7' : '#f3f4f6',
                          color: repository?.isPublic ? '#166534' : '#374151'
                        }}>
                          {repository?.isPublic ? t('repositories.detail.type.public') : t('repositories.detail.type.private')}
                        </span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">{t('repositories.detail.info.description')}</h4>
                      <p className="text-gray-700">
                        {repository?.description || t('repositories.detail.info.noDescription')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-2">{t('repositories.detail.info.owner')}</h4>
                        <p className="text-gray-900">
                          {(() => {
                            // Priority 1: Use ownerName from repository if available
                            if (repository?.ownerName) {
                              return repository.ownerName;
                            }

                            // Priority 2: If we have members data, search for owner in members list
                            if (membersData?.content && membersData.content.length > 0) {
                              const ownerMember = membersData.content.find((m: any) => m.userId === repository?.ownerUserId);
                              if (ownerMember) {
                                const memberName = ownerMember.username || ownerMember.name || ownerMember.email;
                                if (memberName) {
                                  return memberName;
                                }
                              }
                            }

                            // Priority 3: If members still loading, show loading state
                            if (membersLoading && !membersData) {
                              return 'Đang tải...';
                            }

                            // Priority 4: If we have ownerUserId but no name, show friendly message
                            if (repository?.ownerUserId) {
                              // If members returned empty (403 or no permission), show "Chủ sở hữu"
                              if (membersData?.content?.length === 0) {
                                return 'Chủ sở hữu repository';
                              }
                              // Otherwise show partial ID
                              return `User ID: ${repository.ownerUserId.substring(0, 8)}...`;
                            }

                            return t('repositories.detail.info.noInfo');
                          })()}
                        </p>
                      </div>
                      {repository?.type === 'ORGANIZATION' && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-500 mb-2">{t('repositories.detail.info.organization')}</h4>
                          <p className="text-gray-900">
                            {repository?.organizationName || repository?.organizationId || t('repositories.detail.info.none')}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.stats.files')}</h4>
                        <p className="text-2xl font-semibold text-gray-900">
                          {repository?.files?.length ?? repository?.fileCount ?? 0}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.stats.members')}</h4>
                        <p className="text-2xl font-semibold text-gray-900">
                          {Math.max(membersData?.totalElements ?? repository?.memberCount ?? 0, 1)}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.stats.storage')}</h4>
                        <p className="text-2xl font-semibold text-gray-900">
                          {repository?.totalSize != null ? formatFileSize(repository.totalSize) :
                            (repository?.files?.length ?? 0) > 0 ? t('repositories.detail.stats.calculating') : t('repositories.detail.stats.emptyStorage')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.info.createdAt')}</h4>
                        <p className="text-gray-900">
                          {repository?.createdAt ? new Date(repository.createdAt).toLocaleString('vi-VN') : t('common.noData')}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.info.updatedAt')}</h4>
                        <p className="text-gray-900">
                          {repository?.updatedAt ? new Date(repository.updatedAt).toLocaleString('vi-VN') : t('common.noData')}
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
                              <CommonIcon name="file-text" className="w-5 h-5 text-blue-500" />
                              <div>
                                <h4 className="font-medium text-gray-900">{file.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {t('repositories.detail.files.uploaded')}: {new Date(file.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {file.size ? formatFileSize(file.size) : t('common.noData')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CommonIcon name="file-text" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {t('repositories.detail.empty.files.title')}
                      </h3>
                      <p className="text-gray-600 mb-4">
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
                        <h3 className="text-lg font-medium text-gray-900">{t('repositories.detail.tabs.members')}</h3>
                        <Button onClick={() => setShowInviteModal(true)}>
                          {t('repositories.detail.empty.members.invite')}
                        </Button>
                      </div>
                      {membersData.content.map((member: any) => (
                        <div key={member.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="font-medium text-gray-900">{member.username}</p>
                              <p className="text-sm text-gray-600">{member.email}</p>
                            </div>
                            <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: '#dbeafe', color: '#1e40af' }}>
                              {member.role}
                            </span>
                          </div>

                          {/* Permissions Section */}
                          <div className="space-y-3 border-t border-gray-200 pt-4">
                            <p className="text-sm font-medium text-gray-700">{t('repositories.detail.members.permissions.title')}</p>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-600">{t('repositories.detail.members.permissions.upload')}</label>
                              <CommonSwitch
                                checked={member.permissions?.canUpload || false}
                                onChange={(e) => handleUpdatePermission(member.id, 'canUpload', e.target.checked)}
                                disabled={member.role === 'OWNER'}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-600">{t('repositories.detail.members.permissions.view')}</label>
                              <CommonSwitch
                                checked={member.permissions?.canView || false}
                                onChange={(e) => handleUpdatePermission(member.id, 'canView', e.target.checked)}
                                disabled={member.role === 'OWNER'}
                              />
                            </div>

                            <div className="flex items-center justify-between">
                              <label className="text-sm text-gray-600">{t('repositories.detail.members.permissions.delete')}</label>
                              <CommonSwitch
                                checked={member.permissions?.canDelete || false}
                                onChange={(e) => handleUpdatePermission(member.id, 'canDelete', e.target.checked)}
                                disabled={member.role === 'OWNER'}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CommonIcon name="users" className="w-12 h-12 text-gray-400 mx-auto mb-4" />
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
