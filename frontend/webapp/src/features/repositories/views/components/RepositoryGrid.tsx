import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      <CommonIcon name="building" className="w-8 h-8 flex-shrink-0 ml-2" color="#a855f7" />
    ) : (
      <CommonIcon name="user" className="h-8 flex-shrink-0 ml-2" color="#3b82f6" />
    );
  };

  const getRepositoryTypeLabel = (type: string) => {
    return type === 'ORGANIZATION'
      ? t('repositories.grid.types.organization')
      : t('repositories.grid.types.personal');
  };

  const getRepositoryTypeColor = (type: string) => {
    return type === 'ORGANIZATION'
      ? 'bg-purple-100 text-purple-800'
      : 'bg-blue-100 text-blue-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <LoadingSpinner text={t('repositories.grid.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <Card style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }} >
        <CardContent className="p-6">
          <p className="text-center" style={{ color: '#b91c1c' }} >
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
            <CommonIcon name="folder" className="h-16 mx-auto mb-4" color="#9ca3af" />
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#111827' }} >
              {t('repositories.grid.empty.title')}
            </h3>
            <p className="mb-6" style={{ color: '#4b5563' }} >
              {t('repositories.grid.empty.description')}
            </p>
            {onCreateRepository && (
              <Button
                variant="outline"
                onClick={onCreateRepository}
                className="inline-flex items-center gap-2"
              >
                <CommonIcon name="plus" className="w-5 h-5" />
                {t('repositories.grid.empty.create')}
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
                    <p className="text-sm line-clamp-2" style={{ color: '#4b5563' }} >
                      {repo.description || t('repositories.grid.noDescription')}
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#dcfce7' }} >
                        {t('repositories.grid.public')}
                      </span>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CommonIcon name="file-text" color="#6b7280" />
                      <span style={{ color: '#374151' }} >
                        {t('repositories.grid.stats.files', { count: repo.fileCount || 0 })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CommonIcon name="users" color="#6b7280" />
                      <span style={{ color: '#374151' }} >
                        {t('repositories.grid.stats.members', { count: repo.memberCount || 0 })}
                      </span>
                    </div>
                  </div>

                  {/* Size */}
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#4b5563' }} >{t('repositories.grid.stats.size')}</span>
                    <span className="font-medium" style={{ color: '#111827' }} >
                      {formatFileSize(repo.totalSize)}
                    </span>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center justify-between text-sm">
                    <span style={{ color: '#4b5563' }} >{t('repositories.grid.stats.owner')}</span>
                    <span className="font-medium" style={{ color: '#111827' }} >
                      {repo.ownerName || t('repositories.grid.stats.noOwner')}
                    </span>
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
