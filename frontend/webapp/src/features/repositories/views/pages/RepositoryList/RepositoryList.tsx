import { useState } from 'react';
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
      title="My Repositories"
      subtitle="Manage your document repositories and files"
      breadcrumbs={[{ label: 'Repositories', href: '/repositories', current: true }]}
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
        <Button
          variant="outline"
          onClick={handleCreateRepository}
          className="inline-flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Repository
        </Button>
      }
      showToolbar={false}
    >
      <RepositoryLayout className="min-h-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={`Tìm kiếm ${activeTab === 'PERSONAL' ? 'cá nhân' : activeTab === 'ORGANIZATION' ? 'tổ chức' : 'công khai'} repositories...`}
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
            onCreateRepository={handleCreateRepository}
            onRepositoryClick={handleRepositoryClick}
          />

          {/* Pagination */}
          {currentData && currentData.totalPages > 1 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-sm text-gray-700">
                Hiển thị {currentData.currentPage * currentData.pageSize + 1} đến{' '}
                {Math.min((currentData.currentPage + 1) * currentData.pageSize, currentData.totalElements)}{' '}
                trong số {currentData.totalElements} repositories
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={!currentData.hasPrevious}
                >
                  Trước
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
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>

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

