import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@shared/utils/dateFormatter';
import { motion } from 'framer-motion';
import { Plus, Search, Building2, Users, Crown, Calendar, Shield, UserCog } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  LoadingSpinner,
  OrganizationHeaderLayout,
} from '@shared/components';
import { useMyOrganizations, CreateOrganizationDialog } from '@/features/organizations';
import { ORGANIZATION_WORKSPACE_PATH } from '@constants';

export const OrganizationList = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
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
            <Crown className="w-3 h-3" />
            {t('organizations.list.badges.owner')}
          </div>
        );
      case 'MANAGER':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
            <UserCog className="w-3 h-3" />
            {t('organizations.list.badges.manager')}
          </div>
        );
      case 'MEMBER':
        return (
          <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
            <Shield className="w-3 h-3" />
            {t('organizations.list.badges.member')}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Create Organization Dialog */}
      <CreateOrganizationDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header (use OrganizationHeaderLayout) */}
        <OrganizationHeaderLayout
          title={t('organizations.list.title')}
          subtitle={t('organizations.list.subtitle')}
          orgActions={(
            <Button variant="outline" onClick={handleCreateOrganization} className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              {t('organizations.list.new')}
            </Button>
          )}
          filters={(
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={t('organizations.list.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        />

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
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card>
              <CardContent className="p-12">
                <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
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
                  <Plus className="w-5 h-5" />
                  {t('organizations.list.empty.cta')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Organizations Grid */}
        {!isLoading && !error && data && data.content && data.content.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {data.content.map((org, index) => (
                <motion.div
                  key={org.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleOrganizationClick(org.id)}
                  className="cursor-pointer"
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
                        <Building2 className="w-8 h-8 text-purple-500 flex-shrink-0 ml-2" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Owner Badge */}
                        {org.owner && (
                          <div className="flex items-center gap-2 text-sm">
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <span className="text-gray-700">
                              {org.ownerName || t('organizations.list.ownerLabel')}
                            </span>
                          </div>
                        )}

                        {/* Members Count */}
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {t('organizations.list.members', { count: org.memberCount })}
                          </span>
                        </div>

                        {/* Created Date */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="w-3 h-3" />
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
                </motion.div>
              ))}
            </motion.div>

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
      </div>
    </>
  );
};
