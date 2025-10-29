import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button, Input, CreateRepositoryModal } from '@shared/components';
import {
  usePersonalRepositories,
  useOrganizationRepositories,
  usePublicRepositories,
  RepositoryType
} from '@features/repositories';
import { RepositoryTabs } from '@features/repositories/views/components/RepositoryTabs';
import { RepositoryGrid } from '@features/repositories/views/components/RepositoryGrid';
import type { RepositoryCreateData } from '@features/repositories/models/types/repository.types';
import { useCreateRepository } from '@features/repositories/models/api/repositoryApi';
import { REPOSITORY_DETAIL_PATH } from '@shared/constants';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { ControlMainLayout } from '@shared/layouts';

export const RepositoryList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<RepositoryType>('PERSONAL');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const createRepo = useCreateRepository();
  const size = 12;


  const {
    data: personalData,
    isLoading: personalLoading,
    error: personalError
  } = usePersonalRepositories({
    page,
    size,
    searchTerm: searchTerm || undefined,
  });

  const {
    data: organizationData,
    isLoading: organizationLoading,
    error: organizationError
  } = useOrganizationRepositories({
    page,
    size,
    searchTerm: searchTerm || undefined,
  });

  const {
    data: publicData,
    isLoading: publicLoading,
    error: publicError
  } = usePublicRepositories({
    page,
    size,
    searchTerm: searchTerm || undefined,
  });

  const currentData =
    activeTab === 'PERSONAL' ? personalData :
    activeTab === 'ORGANIZATION' ? organizationData :
    publicData;
  const currentLoading =
    activeTab === 'PERSONAL' ? personalLoading :
    activeTab === 'ORGANIZATION' ? organizationLoading :
    publicLoading;
  const currentError =
    activeTab === 'PERSONAL' ? personalError :
    activeTab === 'ORGANIZATION' ? organizationError :
    publicError;

  const errorMessage = currentError
    ? typeof currentError === 'string'
      ? currentError
      : (currentError as any)?.message || 'Đã xảy ra lỗi khi tải repositories'
    : null;

  const handleCreateRepository = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (data: RepositoryCreateData) => {
    setIsCreating(true);
    try {
      await createRepo.mutateAsync(data);
      setIsCreateModalOpen(false);
      // Force refetch ngay tab hiện tại để hiển thị repo mới
      if (activeTab === 'PERSONAL') {
        await queryClient.invalidateQueries({ queryKey: ['personal-repositories'] });
        await queryClient.refetchQueries({ queryKey: ['personal-repositories'] });
      } else if (activeTab === 'ORGANIZATION') {
        await queryClient.invalidateQueries({ queryKey: ['organization-repositories'] });
        await queryClient.refetchQueries({ queryKey: ['organization-repositories'] });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['public-repositories'] });
        await queryClient.refetchQueries({ queryKey: ['public-repositories'] });
      }
    } catch (error) {
      console.error('Failed to create repository:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRepositoryClick = (repoId: string) => {
    navigate(REPOSITORY_DETAIL_PATH.replace(':id', repoId));
  };

  const handleTabChange = (tab: RepositoryType) => {
    setActiveTab(tab);
    setPage(0);
    setSearchTerm('');
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <ControlMainLayout
      title={t('repositories.list.title')}
      subtitle={t('repositories.list.subtitle')}
      breadcrumbs={[{ label: t('nav.repositories'), href: '/repositories', current: true }]}
      headerChildren={
        <RepositoryTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          personalCount={personalData?.totalElements || 0}
          organizationCount={organizationData?.totalElements || 0}
          publicCount={publicData?.totalElements || 0}
        />
      }
      headerRight={
        activeTab !== 'PUBLIC' ? (
          <Button
            variant="outline"
            onClick={handleCreateRepository}
            className="inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            {t('repositories.list.new')}
          </Button>
        ) : null
      }
      showToolbar={false}
    >
      <RepositoryLayout className="min-h-full">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={
                  activeTab === 'PERSONAL'
                    ? t('repositories.list.search.personal')
                    : activeTab === 'ORGANIZATION'
                    ? t('repositories.list.search.organization')
                    : t('repositories.list.search.public')
                }
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Repository Grid */}
          <RepositoryGrid
            repositories={currentData?.content || []}
            isLoading={currentLoading}
            error={errorMessage}
            onCreateRepository={activeTab !== 'PUBLIC' ? handleCreateRepository : undefined}
            onRepositoryClick={handleRepositoryClick}
          />

          {/* Pagination */}
          {currentData && currentData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-700">
                {t('repositories.list.pagination.showing', {
                  from: currentData.currentPage * currentData.pageSize + 1,
                  to: Math.min((currentData.currentPage + 1) * currentData.pageSize, currentData.totalElements),
                  total: currentData.totalElements,
                })}
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!currentData.hasPrevious}
                >
                  {t('repositories.list.pagination.prev')}
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: currentData.totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={i === currentData.currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(i)}
                      className="min-w-[2.5rem]"
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={!currentData.hasNext}
                >
                  {t('repositories.list.pagination.next')}
                </Button>
              </div>
            </div>
          )}

        {/* Create Repository Modal */}
        <CreateRepositoryModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateSubmit}
          isLoading={isCreating}
        />
      </RepositoryLayout>
    </ControlMainLayout>
  );
};

