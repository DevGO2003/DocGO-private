import React, { useState } from 'react';
import { FileListHeader } from '@features/repositories/layouts';
import type { ViewMode, FilterState } from '@features/repositories/layouts';

/**
 * Demo page showing FileListHeader usage
 * This demonstrates the new design system header layout for file lists
 */
export default function RepositoryFilesListDemo() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [filters, setFilters] = useState<FilterState>({
    type: ['Hợp đồng'],
    tags: ['2024'],
  });

  // Mock data
  const totalFiles = 124;
  const newFiles = 12;
  const processingFiles = 3;

  // Action handlers
  const handleNew = () => {
    console.log('New file clicked');
  };

  const handleUpload = () => {
    console.log('Upload clicked');
  };

  const handleDownload = () => {
    console.log('Download clicked');
  };

  const handleDelete = () => {
    console.log('Delete clicked');
  };

  const handleSearch = (query: string) => {
    console.log('Search:', query);
  };

  const handleSettings = () => {
    console.log('Settings clicked');
  };

  const handleRefresh = async () => {
    console.log('Refresh clicked');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  // Bulk action handlers
  const handleBulkDownload = () => {
    console.log('Bulk download:', selectedFiles);
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', selectedFiles);
    if (confirm(`Xóa ${selectedFiles.length} files?`)) {
      setSelectedFiles([]);
    }
  };

  const handleBulkTag = () => {
    console.log('Bulk tag:', selectedFiles);
  };

  const handleBulkMove = () => {
    console.log('Bulk move:', selectedFiles);
  };

  const handleClearSelection = () => {
    setSelectedFiles([]);
  };

  // View control handlers
  const handleViewModeChange = (mode: ViewMode) => {
    console.log('View mode changed:', mode);
    setViewMode(mode);
  };

  const handleSortChange = (sort: string) => {
    console.log('Sort changed:', sort);
    setSortBy(sort);
  };

  // Filter handlers
  const handleFilterChange = (newFilters: FilterState) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    console.log('Clear filters');
    setFilters({});
  };

  // Mock file selection
  const toggleFileSelection = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#f9fafb' }} >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FileListHeader
          totalFiles={totalFiles}
          newFiles={newFiles}
          processingFiles={processingFiles}
          selectedFiles={selectedFiles}
          filters={filters}
          viewMode={viewMode}
          sortBy={sortBy}
          onNew={handleNew}
          onUpload={handleUpload}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onSearch={handleSearch}
          onSettings={handleSettings}
          onRefresh={handleRefresh}
          onBulkDownload={handleBulkDownload}
          onBulkDelete={handleBulkDelete}
          onBulkTag={handleBulkTag}
          onBulkMove={handleBulkMove}
          onClearSelection={handleClearSelection}
          onViewModeChange={handleViewModeChange}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        {/* Content Area */}
        <div className="rounded-2xl border p-6" style={{ backgroundColor: '#ffffff' }} >
          <h2 className="text-lg font-semibold mb-4">File List ({viewMode} view)</h2>
          
          {/* Mock file grid */}
          <div className={`grid gap-4 ${
            viewMode === 'grid' ? 'grid-cols-4' :
            viewMode === 'list' ? 'grid-cols-1' :
            'grid-cols-2'
          }`}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div
                key={i}
                onClick={() => toggleFileSelection(`file-${i}`)}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedFiles.includes(`file-${i}`)
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="text-sm font-medium">File {i}.pdf</div>
                <div className="text-xs mt-1" style={{ color: '#6b7280' }} >2.5 MB</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

