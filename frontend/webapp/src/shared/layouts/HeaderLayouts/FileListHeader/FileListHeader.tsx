import React, { useState } from 'react';
import { BaseHeaderLayout } from '../BaseHeaderLayout';
import { NormalModeActions } from './components/NormalModeActions';
import { BulkModeActions } from './components/BulkModeActions';
import { ViewControls } from './components/ViewControls';
import { StatsDisplay } from './components/StatsDisplay';
import { FilterDisplay } from './components/FilterDisplay';
import type { FileListHeaderProps } from './FileListHeader.types';
import type { BreadcrumbItem } from '../BaseHeaderLayout';

/**
 * FileListHeader Component
 * 
 * Specialized header for file list pages with:
 * - Normal/Bulk mode actions
 * - File statistics display
 * - Active filters display
 * - View mode controls (grid/list/compact)
 * - Sort controls
 * 
 * Usage:
 * ```tsx
 * <FileListHeader
 *   totalFiles={124}
 *   newFiles={12}
 *   processingFiles={3}
 *   selectedFiles={selectedFiles}
 *   viewMode={viewMode}
 *   onNew={handleNew}
 *   onUpload={handleUpload}
 *   onViewModeChange={setViewMode}
 *   // ... other props
 * />
 * ```
 */
export const FileListHeader: React.FC<FileListHeaderProps> = ({
  totalFiles,
  newFiles,
  processingFiles,
  selectedFiles,
  filters,
  viewMode,
  sortBy,
  
  // Normal mode actions
  onNew,
  onUpload,
  onDownload,
  onDelete,
  onSearch,
  onSettings,
  onRefresh,
  
  // Bulk actions
  onBulkDownload,
  onBulkDelete,
  onBulkTag,
  onBulkMove,
  onClearSelection,
  
  // View controls
  onViewModeChange,
  onSortChange,
  
  // Filters
  onFilterChange,
  onClearFilters,
  
  className,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isBulkMode = selectedFiles.length > 0;

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Kho tài liệu', href: '/repositories' },
    { label: 'Danh sách tệp', current: true },
  ];

  // Handle refresh with loading state
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  // Render actions based on mode
  const actions = isBulkMode ? (
    <BulkModeActions
      selectedCount={selectedFiles.length}
      onBulkDownload={onBulkDownload}
      onBulkDelete={onBulkDelete}
      onBulkTag={onBulkTag}
      onBulkMove={onBulkMove}
      onClearSelection={onClearSelection}
    />
  ) : (
    <NormalModeActions
      onNew={onNew}
      onUpload={onUpload}
      onDownload={onDownload}
      onDelete={onDelete}
      onSearch={onSearch}
      onSettings={onSettings}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );

  // Render secondary actions (view controls)
  const secondaryActions = !isBulkMode ? (
    <ViewControls
      viewMode={viewMode}
      sortBy={sortBy}
      onViewModeChange={onViewModeChange}
      onSortChange={onSortChange}
    />
  ) : null;

  // Render stats
  const stats = (
    <StatsDisplay
      totalFiles={totalFiles}
      newFiles={newFiles}
      processingFiles={processingFiles}
    />
  );

  // Render filters
  const filtersDisplay = (
    <FilterDisplay
      filters={filters}
      onClearFilters={onClearFilters}
    />
  );

  return (
    <BaseHeaderLayout
      breadcrumbs={breadcrumbs}
      title={`Danh sách tệp (${totalFiles})`}
      stats={stats}
      filters={filtersDisplay}
      actions={actions}
      secondaryActions={secondaryActions}
      mode={isBulkMode ? 'bulk' : 'normal'}
      onRefresh={handleRefresh}
      className={className}
    />
  );
};

