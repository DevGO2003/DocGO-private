import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@shared/components';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { 
  ArrowLeft, 
  Settings, 
  Users, 
  FileText, 
  Activity,
  Building,
  User,
  Lock,
  Globe,
  Calendar,
  HardDrive
} from 'lucide-react';
import { useRepository } from '@features/repositories/models/api/repositoryApi';
import { RepositoryType } from '@features/repositories/models/types';
import { NOT_FOUND_PATH } from '@constants';

export const RepositoryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('files');
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

  const handleBack = () => {
    navigate('/repositories');
  };

  const handleSettings = () => {
    // TODO: Open settings modal or navigate to settings page
    console.log('Open repository settings');
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getRepositoryTypeLabel = (type: RepositoryType) => {
    return type === 'ORGANIZATION'
      ? t('repositories.detail.type.organization')
      : t('repositories.detail.type.personal');
  };

  const goToUploadWithRepo = () => {
    if (!repository) return;
    const repoName = encodeURIComponent(repository.name || '');
    navigate(`/upload?repositoryId=${repository.id}&repositoryName=${repoName}`);
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

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {t('repositories.detail.back')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleSettings}
                  className="inline-flex items-center gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {t('repositories.detail.settings')}
                </Button>
              </div>

              {repository && (
                <div className="flex items-center gap-3 mb-2">
                  {repository.type === 'ORGANIZATION' ? (
                    <Building className="w-8 h-8 text-purple-500" />
                  ) : (
                    <User className="w-8 h-8 text-blue-500" />
                  )}
                  <h1 className="text-3xl font-bold text-gray-900">{repository.name}</h1>
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-600">
                {repository && <span>{getRepositoryTypeLabel(repository.type)}</span>}
                <span className="flex items-center gap-1">
                  {repository && (repository.isPublic ? (
                    <Globe className="w-4 h-4 text-green-500" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  ))}
                  {repository && (repository.isPublic ? t('repositories.detail.type.public') : t('repositories.detail.type.private'))}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {repository && repository.updatedAt && (
                    <>{t('repositories.detail.updated', { date: new Date(repository.updatedAt).toLocaleDateString() })}</>
                  )}
                </span>
              </div>
            </div>

            {/* Primary Content */}
            {repository && (
              <div>
                {/* Repository Info */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
                  {/* Main Info */}
                  <div className="lg:col-span-3">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('repositories.detail.info.title')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">{t('repositories.detail.info.description')}</h4>
                            <p className="text-gray-600">
                              {repository?.description || t('repositories.detail.info.noDescription')}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">{t('repositories.detail.info.owner')}</h4>
                              <p className="text-gray-600">
                                {repository?.ownerName || repository?.ownerUserId || 'Không có'}
                              </p>
                            </div>

                            {repository?.organizationId && (
                              <div>
                                <h4 className="font-medium text-gray-900 mb-2">{t('repositories.detail.info.organization')}</h4>
                                <p className="text-gray-600">
                                  {repository?.organizationName || repository?.organizationId || 'Không có'}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Stats Sidebar */}
                  <div className="lg:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('repositories.detail.stats.title')}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{t('repositories.detail.stats.files')}</span>
                            </div>
                            <span className="font-medium">{repository?.fileCount ?? 0}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{t('repositories.detail.stats.members')}</span>
                            </div>
                            <span className="font-medium">{repository?.memberCount ?? 0}</span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <HardDrive className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{t('repositories.detail.stats.storage')}</span>
                            </div>
                            <span className="font-medium">{repository ? formatFileSize(repository.totalSize) : '-'}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Content Section */}
                <div className="mt-8">
                  {/* Tabs Navigation */}
                  <div className="flex gap-4 border-b border-gray-200 mb-6">
                    <button
                      onClick={() => setActiveTab('files')}
                      className={`pb-3 px-4 border-b-2 transition-colors ${
                        activeTab === 'files'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {t('repositories.detail.tabs.files')}
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('members')}
                      className={`pb-3 px-4 border-b-2 transition-colors ${
                        activeTab === 'members'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {t('repositories.detail.tabs.members')}
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className={`pb-3 px-4 border-b-2 transition-colors ${
                        activeTab === 'activity'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        {t('repositories.detail.tabs.activity')}
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className={`pb-3 px-4 border-b-2 transition-colors ${
                        activeTab === 'settings'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        {t('repositories.detail.tabs.settings')}
                      </div>
                    </button>
                  </div>

                  {/* Tab Content */}
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
                          <Button>{t('repositories.detail.empty.members.invite')}</Button>
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

                  {activeTab === 'settings' && (
                    <Card>
                      <CardContent className="p-6">
                        <div className="text-center py-8">
                          <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {t('repositories.detail.empty.settings.title')}
                          </h3>
                          <p className="text-gray-600">
                            {t('repositories.detail.empty.settings.desc')}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
        </div>
      )}
    </RepositoryLayout>
  );
};
