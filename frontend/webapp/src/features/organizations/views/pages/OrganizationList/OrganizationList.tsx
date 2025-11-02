import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '@shared/utils/dateFormatter';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  LoadingSpinner,
  OrganizationHeaderLayout,
  RefreshButton,
} from '@shared/components';
import { useMyOrganizations, CreateOrganizationDialog } from '@/features/organizations';
import { ORGANIZATION_WORKSPACE_PATH } from '@constants';
import OrganizationLayout from '../../../layouts/OrganizationLayout';

export const OrganizationList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const size = 12;

  const { data, isLoading, error } = useMyOrganizations({
    page,
    size,
    searchTerm: searchTerm || undefined,
  });

  // Debug: Log response structure
  console.log('🔍 Organizations API Response:', { data, isLoading, error });

  const handleCreateOrganization = () => {
    setIsCreateDialogOpen(true);
  };

  const handleOrganizationClick = (orgId: string) => {
    navigate(ORGANIZATION_WORKSPACE_PATH.replace(':id', orgId));
  };

  const getRoleBadge = (role?: string) => {
    if (!role) return null;

    switch (role.toUpperCase()) {
      case 'OWNER':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
            <CommonIcon name="crown" size={16} />
            {t('organizations.list.badges.owner')}
          </div>
        );
      case 'MANAGER':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            <CommonIcon name="user-cog" size={20} />
            {t('organizations.list.badges.manager')}
          </div>
        );
      case 'MEMBER':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <CommonIcon name="shield" size={20} />
            {t('organizations.list.badges.member')}
          </div>
        );
      default:
        return null;
    }
  };

  const handleRefresh = async () => {
    console.log('[OrganizationList] Refreshing data...');
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['my-organizations'] });
      await queryClient.refetchQueries({ queryKey: ['my-organizations'] });

      console.log('[OrganizationList] Refresh completed');
    } catch (error) {
      console.error('[OrganizationList] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <OrganizationLayout
      title={t('organizations.list.title')}
      subtitle={t('organizations.list.subtitle')}
      breadcrumbs={[
        { label: t('organizations.list.title'), current: true },
      ]}
      onRefresh={handleRefresh}
      headerRight={(
        <div className="flex gap-2">
          <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
          <Button variant="outline" onClick={handleCreateOrganization} className="flex items-center gap-2">
            <CommonIcon name="plus" size={20} />
            {t('organizations.list.new')}
          </Button>
        </div>
      )}
    >
      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <div className="space-y-6">
        {/* Search Filter */}
        <div className="relative w-full max-w-md">
          <CommonIcon name="search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder={t('organizations.list.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Loading */}
        {isLoading && <LoadingSpinner text={t('organizations.list.loading')} />}

        {/* Error */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-700">
                {t('organizations.list.error')}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Data structure error */}
        {!isLoading && !error && data && !data.content && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <p className="text-yellow-700">
                {t('organizations.list.invalidResponse')}
              </p>
              <pre className="mt-2 text-xs">{JSON.stringify(data, null, 2)}</pre>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && data && data.content && data.content.length === 0 && (
          <div className="text-center py-16 animate-fade-in"
          >
            <Card>
              <CardContent className="p-12">
                <CommonIcon name="building" size={64} className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {t('organizations.list.empty.title')}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('organizations.list.empty.desc')}
                </p>
                <Button
                  variant="outline"
                  onClick={handleCreateOrganization}
                  className="inline-flex items-center gap-2"
                >
                  <CommonIcon name="plus" size={20} />
                  {t('organizations.list.empty.cta')}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Organizations Grid */}
        {!isLoading && !error && data && data.content && data.content.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {data.content.map((org, index) => (
                <div
                  key={org.id}
                  className="transition-all hover:scale-105 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleOrganizationClick(org.id)}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CardTitle className="text-lg line-clamp-1">
                              {org.name}
                            </CardTitle>
                            {getRoleBadge(org.userRole)}
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {org.description || t('dashboard.noDescription')}
                          </p>
                        </div>
                        <CommonIcon name="building" size={32} className="text-purple-500 flex-shrink-0 ml-2" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Owner Badge */}
                        {org.owner && (
                          <div className="flex items-center gap-2 text-sm">
                            <CommonIcon name="crown" size={16} className="text-yellow-500" />
                            <span className="text-gray-700">
                              {org.ownerName || t('organizations.list.ownerLabel')}
                            </span>
                          </div>
                        )}

                        {/* Members Count */}
                        <div className="flex items-center gap-2 text-sm">
                          <CommonIcon name="users" size={16} className="text-gray-500" />
                          <span className="text-gray-700">
                            {t('organizations.list.members', { count: org.memberCount })}
                          </span>
                        </div>

                        {/* Created Date */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <CommonIcon name="calendar" size={16} />
                            <span>
                              {formatDate(org.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Settings Badge */}
                        {org.settings && (
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex flex-wrap gap-2">
                              {org.settings.isPublic && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  {t('organizations.list.badges.public')}
                                </span>
                              )}
                              {org.settings.allowInvitations && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {t('organizations.list.badges.openInvites')}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {data.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                >
                  {t('organizations.list.pagination.prev')}
                </Button>
                <span className="text-gray-600">
                  {t('organizations.list.pagination.pageOf', { page: page + 1, total: data.totalPages })}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                  disabled={page >= data.totalPages - 1}
                >
                  {t('organizations.list.pagination.next')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </OrganizationLayout>
  );
};
