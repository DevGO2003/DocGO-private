import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Search, FolderOpen, Users, FileText, Clock } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  LoadingSpinner,
} from '@shared/components';
import { useMyRepositories } from '@features/repository';
import { REPOSITORY_DETAIL_PATH } from '@constants';

export const RepositoryList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const size = 12;

  const { data, isLoading, error } = useMyRepositories({
    page,
    size,
    searchTerm: searchTerm || undefined,
  });

  const handleCreateRepository = () => {
    // TODO: Open create modal or navigate to create page
    console.log('Create repository');
  };

  const handleRepositoryClick = (repoId: string) => {
    navigate(REPOSITORY_DETAIL_PATH.replace(':id', repoId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Repositories
              </h1>
              <p className="text-gray-600">
                Manage your document repositories and files
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateRepository}
              className="flex items-center gap-2"
              animated
            >
              <Plus className="w-5 h-5" />
              New Repository
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search repositories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner text="Loading repositories..." />}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-700">
                Failed to load repositories. Please try again.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !error && data && data.content.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <Card>
              <CardContent className="p-12">
                <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No repositories yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Get started by creating your first repository
                </p>
                <Button
                  variant="primary"
                  onClick={handleCreateRepository}
                  className="inline-flex items-center gap-2"
                  animated
                >
                  <Plus className="w-5 h-5" />
                  Create Repository
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Repository Grid */}
        {!isLoading && !error && data && data.content.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {data.content.map((repo, index) => (
                <motion.div
                  key={repo.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleRepositoryClick(repo.id)}
                  className="cursor-pointer"
                >
                  <Card animated className="h-full">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2 line-clamp-1">
                            {repo.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {repo.description || 'No description'}
                          </p>
                        </div>
                        <FolderOpen className="w-8 h-8 text-blue-500 flex-shrink-0 ml-2" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center gap-2 text-sm">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {repo.fileCount} files
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-700">
                              {repo.memberCount} members
                            </span>
                          </div>
                        </div>

                        {/* Size */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Size:</span>
                          <span className="font-medium text-gray-900">
                            {formatFileSize(repo.totalSize)}
                          </span>
                        </div>

                        {/* Visibility Badge */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              repo.isPublic
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {repo.isPublic ? 'Public' : 'Private'}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {new Date(repo.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
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
                  animated
                >
                  Previous
                </Button>
                <span className="text-gray-600">
                  Page {page + 1} of {data.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(data.totalPages - 1, page + 1))}
                  disabled={page >= data.totalPages - 1}
                  animated
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
