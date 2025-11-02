import React from 'react';
import { BaseHeaderLayout } from '../BaseHeaderLayout';
import { NormalModeActions } from './components/NormalModeActions';
import { EditModeActions } from './components/EditModeActions';
import { MetadataDisplay } from './components/MetadataDisplay';
import { ContextNavigation } from './components/ContextNavigation';
import { PreviewControls } from './components/PreviewControls';
import type { FileDetailHeaderProps } from './FileDetailHeader.types';
import type { BreadcrumbItem } from '../BaseHeaderLayout';

/**
 * FileDetailHeader Component
 * 
 * Specialized header for file detail pages with:
 * - Edit mode toggle (Normal/Edit actions)
 * - File metadata display
 * - File navigation (prev/next)
 * - Preview controls (page, zoom)
 * - Rich action buttons
 * 
 * Usage:
 * ```tsx
 * <FileDetailHeader
 *   file={fileData}
 *   isEditing={isEditing}
 *   hasPreview={true}
 *   onEdit={() => setIsEditing(true)}
 *   onSave={handleSave}
 *   onSaveAndClose={handleSaveAndClose}
 *   onCancel={() => setIsEditing(false)}
 *   onDelete={handleDelete}
 *   // ... other props
 * />
 * ```
 */
export const FileDetailHeader: React.FC<FileDetailHeaderProps> = ({
  file,
  isEditing,
  hasPreview = false,
  
  // Actions
  onEdit,
  onSave,
  onSaveAndClose,
  onCancel,
  onDelete,
  onSubmit,
  onCreateVersion,
  onSendForSignature,
  onDownload,
  onComment,
  onMore,
  
  // Navigation
  onPrevFile,
  onNextFile,
  currentIndex,
  totalFiles,
  
  // Preview
  currentPage,
  totalPages,
  zoom,
  onPageChange,
  onZoomChange,
  
  className,
}) => {
  // Build breadcrumbs (can be customized based on file path)
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Kho tài liệu', href: '/repositories' },
    { label: file.name, current: true },
  ];

  // Render actions based on mode
  const actions = isEditing ? (
    <EditModeActions
      onCancel={onCancel}
      onSave={onSave}
      onSaveAndClose={onSaveAndClose}
    />
  ) : (
    <NormalModeActions
      onEdit={onEdit}
      onSubmit={onSubmit}
      onCreateVersion={onCreateVersion}
      onSendForSignature={onSendForSignature}
      onDownload={onDownload}
      onComment={onComment}
      onDelete={onDelete}
      onMore={onMore}
    />
  );

  // Render secondary actions (preview controls if available)
  const secondaryActions = hasPreview && !isEditing ? (
    <PreviewControls
      currentPage={currentPage}
      totalPages={totalPages}
      zoom={zoom}
      onPageChange={onPageChange}
      onZoomChange={onZoomChange}
    />
  ) : null;

  // Render metadata
  const metadata = <MetadataDisplay file={file} />;

  // Render context navigation
  const contextNav = (onPrevFile || onNextFile) ? (
    <ContextNavigation
      onPrevFile={onPrevFile}
      onNextFile={onNextFile}
      currentIndex={currentIndex}
      totalFiles={totalFiles}
    />
  ) : null;

  return (
    <BaseHeaderLayout
      breadcrumbs={breadcrumbs}
      title={file.name}
      subtitle={file.code}
      metadata={metadata}
      contextNav={contextNav}
      actions={actions}
      secondaryActions={secondaryActions}
      mode={isEditing ? 'edit' : hasPreview ? 'preview' : 'normal'}
      className={className}
    />
  );
};

