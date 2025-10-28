import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { Button, Input, HeaderPanel } from '@shared/components';
import {
  usePersonalRepositories,
  useOrganizationRepositories,
  RepositoryType
} from '@features/repositories';
import { RepositoryTabs } from '@features/repositories/views/components/RepositoryTabs';
import { RepositoryGrid } from '@features/repositories/views/components/RepositoryGrid';
import { CreateRepositoryModal } from '@features/repositories/views/components/CreateRepositoryModal';
import { REPOSITORY_DETAIL_PATH } from '@shared/constants';

export const RepositoryList = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<RepositoryType>('PERSONAL');
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const size = 12;

  // Fetch repositories based on active tab
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

  // Get current data based on active tab
  const currentData = activeTab === 'PERSONAL' ? personalData : organizationData;
  const currentLoading = activeTab === 'PERSONAL' ? personalLoading : organizationLoading;
  const currentError = activeTab === 'PERSONAL' ? personalError : organizationError;

  // Convert error object to string for display
  const errorMessage = currentError
    ? typeof currentError === 'string'
      ? currentError
      : (currentError as any)?.message || 'Đã xảy ra lỗi khi tải repositories'
    : null;

  const handleCreateRepository = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateSubmit = async (data: any) => {
    setIsCreating(true);
    try {
      // TODO: Call API to create repository
      console.log('Creating repository:', data);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Close modal and refresh data
      setIsCreateModalOpen(false);

      // TODO: Invalidate queries to refresh data
      // queryClient.invalidateQueries(['personal-repositories']);
      // queryClient.invalidateQueries(['organization-repositories']);

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
    setPage(0); // Reset page when changing tabs
    setSearchTerm(''); // Clear search when changing tabs
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(0); // Reset page when searching
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Panel */}
        <HeaderPanel
          title="My Repositories"
          subtitle="Manage your document repositories and files"
          right={
            <Button
              variant="outline"
              onClick={handleCreateRepository}
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Repository
            </Button>
          }
        />

        {/* Primary Content */}
        <div>
          {/* Tabs */}
          <RepositoryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            personalCount={personalData?.totalElements || 0}
            organizationCount={organizationData?.totalElements || 0}
          />

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder={`Tìm kiếm ${activeTab === 'PERSONAL' ? 'cá nhân' : 'tổ chức'} repositories...`}
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
      </div>
    </div>
  );
};
