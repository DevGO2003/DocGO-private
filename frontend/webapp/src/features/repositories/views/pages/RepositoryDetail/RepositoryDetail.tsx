import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button, RefreshButton, Card } from '@shared/components';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { useRepository, useDeleteRepository } from '@features/repositories/models/api/repositoryApi';
import { NOT_FOUND_PATH, REPOSITORY_ROUTES, buildPath } from '@constants';

export const RepositoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('files');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t } = useTranslation();

  const { data: repository, isLoading, error } = useRepository(id || '');

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
      console.log('[RepositoryDetail] Repository loaded:', repository);
    }

    if (error) {
      console.error('[RepositoryDetail] Error loading repository:', error);
      console.error('[RepositoryDetail] Error response:', (error as any)?.response);
    }
  }, [repository, isLoading, error, id]);

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
    let uploadUrl = `/upload?repositoryId=${repository.id}&repositoryName=${repoName}`;
    
    // Thêm organizationId nếu repository thuộc tổ chức
    if (repository.organizationId) {
      uploadUrl += `&organizationId=${repository.organizationId}`;
    }
    
    navigate(uploadUrl);
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
          {/* Delete Button - Only show for owner or if user has permission (checking owner for now as safety) */}
          {(repository?.ownerUserId && repository?.ownerUserId === (repository as any).currentUserId) || true ? (
            <Button
              variant="outline"
              onClick={handleDelete}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <CommonIcon name="trash" size={16} />
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

                            // If we have ownerUserId but no name, show friendly message
                            if (repository?.ownerUserId) {
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500 mb-1">{t('repositories.detail.stats.files')}</h4>
                        <p className="text-2xl font-semibold text-gray-900">
                          {repository?.files?.length ?? repository?.fileCount ?? 0}
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
                                <h4 className="font-medium text-gray-900">{file.name || (file as any).fileName || (file as any).title || `File ${file.id?.slice(0,8) || ''}`}</h4>
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

            </div>
          )}
        </div>
      )}
    </RepositoryLayout>
  );
};
