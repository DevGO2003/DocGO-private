import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Upload,
  Trash2,
  FileText,
  FolderOpen,
  Users,
  Settings,
  Calendar,
  HardDrive,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  LoadingSpinner,
} from '@shared/components';
import { useRepository, useFiles, useDeleteFile } from '@features/repository';
import { REPOSITORIES_PATH } from '@constants';

export const RepositoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const size = 20;

  const { data: repository, isLoading: repoLoading } = useRepository(id!);
  const { data: files, isLoading: filesLoading } = useFiles({
    page,
    size,
    // Add repositoryId filter if your API supports it
  });
  const deleteFileMutation = useDeleteFile();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleFileSelect = (fileId: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.length === 0) return;
    
    if (window.confirm(`Delete ${selectedFiles.length} file(s)?`)) {
      for (const fileId of selectedFiles) {
        try {
          await deleteFileMutation.mutateAsync(fileId);
        } catch (error) {
          console.error(`Failed to delete file ${fileId}:`, error);
        }
      }
      setSelectedFiles([]);
    }
  };

  const handleUpload = () => {
    console.log('Open upload modal');
    // TODO: Implement upload modal
  };

  if (repoLoading) {
    return <LoadingSpinner text="Loading repository..." fullScreen />;
  }

  if (!repository) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-700">Repository not found</p>
            <Button
              variant="primary"
              onClick={() => navigate(REPOSITORIES_PATH)}
              className="mt-4"
              animated
            >
              Back to Repositories
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button
            variant="outline"
            onClick={() => navigate(REPOSITORIES_PATH)}
            className="mb-4 flex items-center gap-2"
            animated
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Repositories
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <FolderOpen className="w-10 h-10 text-blue-500" />
                {repository.name}
              </h1>
              <p className="text-gray-600">
                {repository.description || 'No description'}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                animated
              >
                <Settings className="w-4 h-4" />
                Settings
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                className="flex items-center gap-2"
                animated
              >
                <Upload className="w-4 h-4" />
                Upload Files
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Repository Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <Card animated>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Files</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {repository.fileCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card animated>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Members</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {repository.memberCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card animated>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <HardDrive className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Storage</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatFileSize(repository.totalSize)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card animated>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Updated</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatDate(repository.updatedAt)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* File Browser */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card animated>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Files & Documents</CardTitle>
                {selectedFiles.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {selectedFiles.length} selected
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedFiles([])}
                      className="text-sm"
                      animated
                    >
                      Clear
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleDeleteSelected}
                      className="text-red-600 hover:text-red-700 flex items-center gap-2 text-sm"
                      animated
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {filesLoading ? (
                <div className="py-8">
                  <LoadingSpinner text="Loading files..." />
                </div>
              ) : files && files.content.length > 0 ? (
                <div className="space-y-2">
                  {/* File List Header */}
                  <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700">
                    <div className="col-span-1"></div>
                    <div className="col-span-5">Name</div>
                    <div className="col-span-2">Size</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-2">Date</div>
                  </div>

                  {/* File List Items */}
                  {files.content.map((file) => (
                    <motion.div
                      key={file.id}
                      whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                      className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg border-2 transition-colors cursor-pointer ${
                        selectedFiles.includes(file.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleFileSelect(file.id)}
                    >
                      <div className="col-span-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedFiles.includes(file.id)}
                          onChange={() => handleFileSelect(file.id)}
                          className="w-4 h-4 text-blue-600 rounded"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className="col-span-5 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
                        <span className="font-medium text-gray-900 truncate">
                          {file.originalName || file.name}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center text-gray-600">
                        {formatFileSize(file.fileSize)}
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                          {file.mimeType?.split('/')[1]?.toUpperCase() || 'FILE'}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center text-sm text-gray-500">
                        {formatDate(file.createdAt)}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No files in this repository yet</p>
                  <Button
                    variant="primary"
                    onClick={handleUpload}
                    className="inline-flex items-center gap-2"
                    animated
                  >
                    <Upload className="w-4 h-4" />
                    Upload Files
                  </Button>
                </div>
              )}

              {/* Pagination */}
              {files && files.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="text-sm"
                    animated
                  >
                    Previous
                  </Button>
                  <span className="text-gray-600 text-sm">
                    Page {page + 1} of {files.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(files.totalPages - 1, page + 1))}
                    disabled={page >= files.totalPages - 1}
                    className="text-sm"
                    animated
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
