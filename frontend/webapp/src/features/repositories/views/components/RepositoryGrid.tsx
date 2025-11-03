import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  LoadingSpinner,
} from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Repository } from '@features/repositories/models/types/repository.types';

interface RepositoryGridProps {
  repositories: Repository[];
  isLoading?: boolean;
  error?: string | null;
  onCreateRepository?: () => void;
  onRepositoryClick?: (repositoryId: string) => void;
}

export const RepositoryGrid: React.FC<RepositoryGridProps> = ({
  repositories,
  isLoading = false,
  error = null,
  onCreateRepository,
  onRepositoryClick,
}) => {
  const navigate = useNavigate();

  const handleRepositoryClick = (repoId: string) => {
    if (onRepositoryClick) {
      onRepositoryClick(repoId);
    } else {
      // Default navigation
      navigate(`/repositories/${repoId}`);
    }
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getRepositoryIcon = (type: string) => {
    return type === 'ORGANIZATION' ? (
      <CommonIcon name="building" className="w-8 h-8 flex-shrink-0 ml-2" style={ color: '#a855f7' } />
    ) : (
      <CommonIcon name="user" className="h-8 flex-shrink-0 ml-2" style={ color: '#3b82f6' } />
    );
  };

  const getRepositoryTypeLabel = (type: string) => {
    return type === 'ORGANIZATION' ? 'Tổ chức' : 'Cá nhân';
  };

  const getRepositoryTypeColor = (type: string) => {
    return type === 'ORGANIZATION'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner text="Đang tải repositories..." />
      </div>
    );
  }

  if (error) {
    return (
      <Card style={ borderColor: '#fecaca' } style={ backgroundColor: '#fef2f2' }>
        <CardContent className="p-6">
          <p className="text-center" style={ color: '#b91c1c' }>
            {error}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (repositories.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <Card>
          <CardContent className="p-12">
            <CommonIcon name="folder" className="h-16 mx-auto mb-4" style={ color: '#9ca3af' } />
            <h3 className="text-xl font-semibold mb-2" style={ color: '#111827' }>
              Không có repository nào
            </h3>
            <p className="mb-6" style={ color: '#4b5563' }>
              Bắt đầu bằng cách tạo repository đầu tiên của bạn
            </p>
            {onCreateRepository && (
              <Button
                variant="outline"
                onClick={onCreateRepository}
                className="inline-flex items-center gap-2"
              >
                <CommonIcon name="plus" className="w-5 h-5" />
                Tạo Repository
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 animate-fade-in">
        {repositories.map((repo) => (
          <div
            key={repo.id}
            onClick={() => handleRepositoryClick(repo.id)}
            className="cursor-pointer transition-transform hover:scale-105"
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2 line-clamp-1">
                      {repo.name}
                    </CardTitle>
                    <p className="text-sm line-clamp-2" style={ color: '#4b5563' }>
                      {repo.description || 'Không có mô tả'}
                    </p>
                  </div>
                  {getRepositoryIcon(repo.type)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Type Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRepositoryTypeColor(
                        repo.type
                      )}`}
                    >
                      {getRepositoryTypeLabel(repo.type)}
                    </span>
                    {repo.isPublic && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={ backgroundColor: '#dcfce7' }>
                        Công khai
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CommonIcon name="file-text" style={ color: '#6b7280' } />
                      <span style={ color: '#374151' }>
                        {repo.fileCount || 0} tệp
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CommonIcon name="users" style={ color: '#6b7280' } />
                      <span style={ color: '#374151' }>
                        {repo.memberCount || 0} thành viên
                      </span>
                    </div>
                  </div>

                  {/* Size */}
                  <div className="flex items-center justify-between text-sm">
                    <span style={ color: '#4b5563' }>Dung lượng:</span>
                    <span className="font-medium" style={ color: '#111827' }>
                      {formatFileSize(repo.totalSize)}
                    </span>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center justify-between text-sm">
                    <span style={ color: '#4b5563' }>Chủ sở hữu:</span>
                    <span className="font-medium" style={ color: '#111827' }>
                      {repo.ownerName || 'Chưa có thông tin'}
                    </span>
                  </div>

                  {/* Updated Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs" style={ color: '#6b7280' }>
                      <CommonIcon name="clock" className="w-3 h-3" />
                      Cập nhật: {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString('vi-VN') : 'Không có'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </>
  );
};
