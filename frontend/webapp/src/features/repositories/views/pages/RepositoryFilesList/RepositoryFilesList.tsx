import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button, RefreshButton } from '@shared/components';
import { Card, CardHeader, CardTitle, CardContent } from '@shared/components/UIComponents/Card';
import { Table, TableHeader, TableRow, TableCell, TableContainer } from '@shared/components/UIComponents/Table';
import { Text } from '@shared/components/UIComponents/Text';
import { Tabs, TabList, CommonTab } from '@shared/components/UIComponents/Tabs/CommonTabs';
import { Checkbox } from '@shared/components/UIComponents/Checkbox';
import { REPOSITORY_ROUTES, buildPath } from '@constants';
import repositoryApi from '@features/repositories/models/api/repositoryApi';
import { FilesFilters } from '@features/repositories/views/components/FilesFilters/FilesFilters';
import { GeneralFileCard } from '@features/repositories/views/components/GeneralFileCard/GeneralFileCard';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import TableSettings from './TableSettings';
import { tagAPI } from '@features/tags/services/tag-api';
// TODO: Add Tooltip and AlertDialog components to @shared/components
// import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@shared/components';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@shared/components';
// Use real repository API

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
  contractNumber?: string;
  parties?: { name: string; role: string }[];
  totalValue?: number;
  currency?: string;
  riskLevel?: string;
  reminders?: any[];
  documentType?: string;
}

export const RepositoryFilesList: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<RepoFileItem[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [status, setStatus] = useState('ALL');
  const [type, setType] = useState('ALL');
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [tagsLoading, setTagsLoading] = useState(false);
  const [tagsError, setTagsError] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'contract'>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [tableColumns, setTableColumns] = useState([
    { key: 'checkbox', label: '', visible: true },
    { key: 'document', label: t('repositories.files.table.document'), visible: true },
    { key: 'contractNumber', label: 'Mã HĐ', visible: false }, // New
    { key: 'status', label: t('repositories.files.table.status'), visible: true },
    { key: 'type', label: t('repositories.files.table.type'), visible: true },
    { key: 'totalValue', label: 'Giá trị', visible: false }, // New
    { key: 'size', label: t('repositories.files.table.size'), visible: true },
    { key: 'uploadedAt', label: t('repositories.files.table.uploadedAt'), visible: true },
    { key: 'actions', label: '', visible: true },
    { key: 'parties', label: 'Parties', visible: false },
    { key: 'riskLevel', label: 'Risk', visible: true },
    { key: 'reminders', label: 'Reminders', visible: false },
  ]);
  const [showTableSettings, setShowTableSettings] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [repoName, setRepoName] = useState('');

  const navigate = useNavigate();
  const abortControllerRef = useRef<AbortController | null>(null);

  const refreshFiles = () => {
    setCurrentPage(0);
    fetchFiles(false);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);
    setSearch('');
  };

  const retryTags = () => {
    setTagsError(false);
    setTagsLoading(true);
    setTimeout(() => {
      setAvailableTags(['Tag1', 'Tag2']);
      setTagsLoading(false);
    }, 1000);
  };

  const handleSortByChange = (v: string) => {
    setSortBy(v);
  };
  const handleSortDirectionChange = (d: 'asc' | 'desc') => {
    setSortDirection(d);
  };

  const toggleSelectFile = (fileId: string, checked: boolean) => {
    setSelectedFiles(prev => 
      checked ? [...prev, fileId] : prev.filter(id => id !== fileId)
    );
  };

  const selectAll = (checked: boolean) => {
    setSelectedFiles(checked ? filtered.map(f => f.fileId) : []);
  };

  const openTableSettings = () => {
    // Trigger modal, for now console or add state
    // Later: setShowTableSettings(true)
  };

  const filtered = useMemo(() => {
    let result = files;
    const kw = debouncedSearch.trim().toLowerCase();
    if (kw) {
      result = result.filter(f =>
        f.fileName.toLowerCase().includes(kw) ||
        f.tags?.some(t => t.toLowerCase().includes(kw))
      );
    }
    if (status !== 'ALL') {
      result = result.filter(f => f.status === status);
    }
    if (type !== 'ALL') {
      result = result.filter(f => f.contractType === type);
    }
    if (selectedTags.length > 0) {
      result = result.filter(f => f.tags?.some(tag => selectedTags.includes(tag)));
    }
    if (activeTab === 'contract') {
      result = result.filter(f => f.contractType?.toLowerCase().includes('contract') || f.fileType === 'CONTRACT');
    }
    result = [...result].sort((a, b) => {
      let aVal = a[sortBy as keyof RepoFileItem] || '';
      let bVal = b[sortBy as keyof RepoFileItem] || '';
      if (sortBy === 'uploadedAt') {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }
      if (sortBy === 'totalValue') {
        aVal = (a as any).totalValue || 0;
        bVal = (b as any).totalValue || 0;
      }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [files, debouncedSearch, status, type, selectedTags, sortBy, sortDirection, activeTab]);

  const fetchFiles = async (append = false, params: any = {}) => {
    abortControllerRef.current = new AbortController();
    try {
      setIsLoading(true);
      setRefreshing(true);
      setError(null);
      const fetchParams = {
        page: currentPage,
        sortBy,
        sortDirection,
        status: status !== 'ALL' ? status : undefined,
        type: type !== 'ALL' ? type : undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        searchTerm: debouncedSearch || undefined,
        ...params,
      };
      const resp = await repositoryApi.getRepositoryFiles(id || '', fetchParams);
      const pageContent = resp?.content || [];
      const newFiles = pageContent.map((f: any) => ({
        ...f,
        totalValue: f.totalValue ?? undefined, // Convert null to undefined
      }));
      setTotalPages(resp.totalPages || 0);
      setHasMore((resp.currentPage ?? 0) < (resp.totalPages ?? 0) - 1);
      if (append) {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        setFiles(newFiles);
      }
    } catch (e: any) {
      if (e.name === 'AbortError') return; // Ignore abort
      if (e.response?.status === 404) {
        navigate('/not-found');
        return;
      }
      setError(e?.message || t('repositories.files.empty.notFound'));
      // If network, show retry
      if (e.code === 'NETWORK_ERROR' || !e.response) {
        setError('Network error - Retry?');
        // Add retry logic
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    if (id) {
      setCurrentPage(0);
      fetchFiles(false); // Initial load
    }
  }, [id]);

  useEffect(() => {
    setCurrentPage(0);
    fetchFiles(false);
  }, [debouncedSearch, status, type, selectedTags, sortBy, sortDirection, activeTab]);

  useEffect(() => {
    const loadTags = async () => {
      setTagsLoading(true);
      setTagsError(false);
      try {
        const res = await tagAPI.getAllTags(); // Assume returns { data: string[] }
        setAvailableTags(res.data || []);
      } catch (e) {
        setTagsError(true);
        setAvailableTags([]);
      } finally {
        setTagsLoading(false);
      }
    };
    loadTags();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const fetchRepoName = async () => {
      if (id) {
        try {
          const repo = await repositoryApi.getRepositoryById(id);
          setRepoName((repo as any)?.name || id);
        } catch (e) {
          console.error('Failed to fetch repo name');
        }
      }
    };
    fetchRepoName();
  }, [id]);

  const loadMore = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchFiles(true); // Append mode
  };

  return (
    <RepositoryLayout
      title={t('repositories.files.breadcrumbs.files')}
      subtitle={id ? `Mã repo: ${id}` : undefined}
      breadcrumbs={[
        { label: t('nav.repositories'), href: '/repositories' },
        { label: repoName || id || t('repositories.files.breadcrumbs.repository'), href: `/repositories/${id}` },
        { label: t('repositories.files.breadcrumbs.files'), current: true },
      ]}
      loading={isLoading}
      loadingText={t('repositories.files.loading')}
      onRefresh={refreshFiles}
      secondaryTabs={
        <Tabs>
          <TabList>
            <CommonTab value="all" activeValue={activeTab} onSelect={(v: string) => setActiveTab(v as 'all' | 'contract')} className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              {t('repositories.files.tabs.all')}
            </CommonTab>
            <CommonTab value="contract" activeValue={activeTab} onSelect={(v: string) => setActiveTab(v as 'all' | 'contract')} className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white">
              {t('repositories.files.tabs.contract')}
            </CommonTab>
          </TabList>
        </Tabs>
      }
      headerChildren={
        <FilesFilters
          search={search}
          onSearchChange={setSearch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          status={status}
          onStatusChange={setStatus}
          type={type}
          onTypeChange={setType}
          availableTags={availableTags}
          tagsLoading={tagsLoading}
          tagsError={tagsError}
          selectedTags={selectedTags}
          onToggleTag={toggleTag}
          onRetryTags={retryTags}
          sortBy={sortBy}
          onSortByChange={handleSortByChange}
          sortDirection={sortDirection}
          onSortDirectionChange={handleSortDirectionChange}
          showAdvanced={showAdvanced}
          onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
        />
      }
      headerRight={
        <RefreshButton onClick={refreshFiles} loading={refreshing} />
      }
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">

        {/* Content */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <Text className="text-red-600">{error}</Text>
            <Button variant="outline" onClick={() => fetchFiles(false)} size="sm" className="mt-2">Retry</Button>
          </div>
        )}

        {isLoading && !refreshing && (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : ''}>
            {/* Skeleton placeholders, e.g., 3-6 */}
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <div className="h-48 bg-gray-100 rounded-lg" />
                </Card> {/* For grid */}
                {/* Or table row skeleton for list */}
              </div>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="mb-4">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <Text className="text-gray-600 mb-6">{t('repositories.files.empty.notFound')}</Text>
              <Button variant="outline" onClick={() => setSearch('')}>{t('repositories.files.empty.clearSearch')}</Button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedFiles.length > 0 && (
              <div className="col-span-full flex gap-2 p-2 bg-blue-50 rounded">
                <Text>{selectedFiles.length} selected</Text>
                <Button variant="outline" size="sm" onClick={() => selectAll(false)}>Clear</Button>
              </div>
            )}
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
                  totalValue: f.totalValue,
                  currency: f.currency,
                  riskLevel: f.riskLevel,
                  reminders: f.reminders,
                  parties: f.parties,
                }}
                right={
                  <Link
                    className="inline-flex"
                    to={buildPath(REPOSITORY_ROUTES.FILE_DETAIL, { id: id || '', fileId: f.fileId })}
                  >
                    <Button variant="outline">{t('repositories.files.table.viewDetail')}</Button>
                  </Link>
                }
                isSelected={selectedFiles.includes(f.fileId)}
                onSelect={(checked: boolean) => toggleSelectFile(f.fileId, checked)}
              />
            ))}
          </div>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <TableRow>
                  <TableHeader>
                    <Checkbox 
                      checked={selectedFiles.length === filtered.length && filtered.length > 0}
                      onCheckedChange={(checked: boolean) => selectAll(checked)}
                      indeterminate={selectedFiles.length > 0 && selectedFiles.length < filtered.length}
                    />
                  </TableHeader>
                  {tableColumns.filter(col => col.visible).map(col => (
                    <TableHeader key={col.key}>
                      <Text className="text-xs font-medium text-gray-500 uppercase">
                        {col.label}
                        {col.key === 'checkbox' ? null : <button onClick={() => openTableSettings()}>Settings</button>} // Add settings button in header
                      </Text>
                    </TableHeader>
                  ))}
                </TableRow>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <TableRow key={f.fileId}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedFiles.includes(f.fileId)}
                        onCheckedChange={(checked: boolean) => toggleSelectFile(f.fileId, checked)}
                      />
                    </TableCell>
                    {tableColumns.filter(col => col.visible).map(col => (
                      col.key === 'checkbox' ? null : (
                        <TableCell key={col.key}>
                          <Text className="text-sm text-gray-900">
                            {col.key === 'document' ? f.fileName :
                             col.key === 'contractNumber' ? f.contractNumber || '-' :
                             col.key === 'status' ? (
                               <span className={`px-2 py-1 rounded text-xs bg-blue-100 text-blue-800`} title={t(`status.${f.status}.tooltip`)}>{f.status}</span>
                             ) :
                             col.key === 'type' ? f.contractType || '-' :
                             col.key === 'totalValue' ? <Text>{f.totalValue ? `${f.totalValue.toLocaleString()} ${f.currency}` : '-'}</Text> :
                             col.key === 'size' ? `${f.fileSize ?? f.size} bytes` :
                             col.key === 'uploadedAt' ? new Date(f.uploadedAt).toLocaleString() :
                             col.key === 'actions' ? (
                               <Link to={buildPath(REPOSITORY_ROUTES.FILE_DETAIL, { id: id || '', fileId: f.fileId })}>
                                 <Button variant="outline" size="sm">{t('viewDetail')}</Button>
                               </Link>
                             ) : col.key === 'parties' ? <Text>{f.parties?.map(p => p.name).join(', ') || '-'}</Text> :
                             col.key === 'riskLevel' ? (
                               <span className={`px-2 py-1 rounded text-xs ${f.riskLevel === 'LOW' ? 'bg-green-100 text-green-800' : f.riskLevel === 'HIGH' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`} title={t(`riskLevel.${f.riskLevel}.tooltip`)}>{f.riskLevel}</span>
                             ) :
                             col.key === 'reminders' ? <Text>{f.reminders?.length || 0}</Text> : '-'}
                          </Text>
                        </TableCell>
                      )
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableContainer>
        )}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <Button 
              onClick={loadMore} 
              variant="outline" 
              disabled={isLoading}
              className="px-6 py-3"
            >
              {isLoading ? t('loading') : t('showMore', { count: 10 })}
            </Button>
          </div>
        )}
        {showTableSettings && (
          <TableSettings 
            isOpen={showTableSettings}
            columns={tableColumns} 
            onColumnsChange={setTableColumns} 
            onClose={() => setShowTableSettings(false)} 
          />
        )}
        {/* TODO: Implement AlertDialog when component is available */}
        {selectedFiles.length > 0 && (
          <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <p className="text-sm text-gray-700 mb-2">Delete {selectedFiles.length} files?</p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedFiles([])}>Cancel</Button>
              <Button variant="destructive" onClick={() => {/* TODO: API delete */}}>Delete</Button>
            </div>
          </div>
        )}
      </div>
    </RepositoryLayout>
  );
}
