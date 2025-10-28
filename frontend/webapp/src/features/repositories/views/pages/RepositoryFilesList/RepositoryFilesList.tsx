import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button, Card, CardHeader, CardTitle, CardContent, Table, TableHeader, TableRow, TableCell, TableContainer, Text } from '@shared/components';
import { REPOSITORY_ROUTES, buildPath } from '@constants';
import { fileAPI } from '@features/upload/services/file-api';
import { DocumentsFilters } from '@features/repositories/views/components/DocumentsFilters/DocumentsFilters';
import { GeneralFileCard } from '@features/repositories/views/components/GeneralFileCard/GeneralFileCard';
import { ControlMainLayout } from '@shared/layouts';

interface RepoFileItem {
  fileId: string;
  fileName: string;
  size: number;
  uploadedAt: string;
  status?: string;
  contractType?: string;
  tags?: string[];
  fileType?: string;
  fileSize?: number;
}

export const RepositoryFilesList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<RepoFileItem[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    let isMounted = true;
    const fetchFiles = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await fileAPI.getRepositoryFiles(id || '');
        if (!isMounted) return;
        setFiles(resp.data.files || []);
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || 'Không thể tải danh sách tệp');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (id) fetchFiles();
    return () => { isMounted = false; };
  }, [id]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return files;
    return files.filter(f =>
      f.fileName.toLowerCase().includes(kw) ||
      f.tags?.some(t => t.toLowerCase().includes(kw))
    );
  }, [files, search]);

  return (
    <ControlMainLayout
      title="Repository Files"
      subtitle={id ? `Mã repo: ${id}` : undefined}
      breadcrumbs={[
        { label: 'Repositories', href: '/repositories' },
        { label: id ? `Repo ${id}` : 'Repository', href: id ? `/repositories/${id}` : '/repositories' },
        { label: 'Files', current: true },
      ]}
      loading={isLoading}
      loadingText="Đang tải danh sách tệp..."
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header + Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Quản lý tài liệu</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentsFilters
              search={search}
              onSearchChange={setSearch}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </CardContent>
        </Card>

        {/* Content */}
        {error && <Text className="text-sm text-red-600">{error}</Text>}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <Text className="text-gray-600 mb-6">Không tìm thấy tài liệu phù hợp.</Text>
              <Button variant="outline" onClick={() => setSearch('')}>Xóa tìm kiếm</Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((f) => (
              <GeneralFileCard
                key={f.fileId}
                item={{
                  fileId: f.fileId,
                  fileName: f.fileName,
                  status: f.status,
                  contractType: f.contractType,
                  tags: f.tags,
                  fileType: f.fileType,
                  fileSize: f.fileSize ?? f.size,
                  uploadedAt: f.uploadedAt,
                }}
                right={
                  <Link
                    className="inline-flex"
                    to={buildPath(REPOSITORY_ROUTES.FILE_DETAIL, { id: id || '', fileId: f.fileId })}
                  >
                    <Button variant="outline">Xem chi tiết</Button>
                  </Link>
                }
              />
            ))}
          </div>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <TableRow>
                  <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Tài liệu</Text></TableHeader>
                  <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Trạng thái</Text></TableHeader>
                  <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Loại</Text></TableHeader>
                  <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Kích thước</Text></TableHeader>
                  <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Tải lên lúc</Text></TableHeader>
                  <TableHeader></TableHeader>
                </TableRow>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <TableRow key={f.fileId}>
                    <TableCell><Text className="text-sm text-gray-900 break-all">{f.fileName}</Text></TableCell>
                    <TableCell><Text className="text-sm text-gray-600">{f.status || '-'}</Text></TableCell>
                    <TableCell><Text className="text-sm text-gray-600">{f.contractType || '-'}</Text></TableCell>
                    <TableCell><Text className="text-sm text-gray-600">{(f.fileSize ?? f.size)} bytes</Text></TableCell>
                    <TableCell><Text className="text-sm text-gray-600">{new Date(f.uploadedAt).toLocaleString('vi-VN')}</Text></TableCell>
                    <TableCell>
                      <Link
                        to={buildPath(REPOSITORY_ROUTES.FILE_DETAIL, { id: id || '', fileId: f.fileId })}
                      >
                        <Button variant="outline">Xem chi tiết</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
      </div>
    </ControlMainLayout>
  );
}
