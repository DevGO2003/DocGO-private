import React, { useState } from 'react';
import { FileDetailHeader } from '@features/repositories/layouts';
import type { FileData } from '@features/repositories/layouts';

/**
 * Demo page showing FileDetailHeader usage
 * This demonstrates the new design system header layout
 */
export default function RepositoryFileDetailDemo() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);

  // Mock file data
  const file: FileData = {
    id: 'file-123',
    name: 'Hợp đồng thuê văn phòng 2024.pdf',
    code: 'F-2024-0123',
    type: 'Hợp đồng',
    owner: 'Nguyễn Văn A',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-20T14:45:00Z',
    size: 2048576, // 2MB
    status: 'active',
  };

  // Action handlers
  const handleEdit = () => {
    console.log('Edit clicked');
    setIsEditing(true);
  };

  const handleSave = () => {
    console.log('Save clicked');
    // Save logic here
  };

  const handleSaveAndClose = () => {
    console.log('Save & Close clicked');
    setIsEditing(false);
    // Save logic here
  };

  const handleCancel = () => {
    console.log('Cancel clicked');
    setIsEditing(false);
  };

  const handleDelete = () => {
    console.log('Delete clicked');
    if (confirm('Bạn có chắc muốn xóa file này?')) {
      // Delete logic here
    }
  };

  const handleSubmit = () => {
    console.log('Submit for approval clicked');
  };

  const handleCreateVersion = () => {
    console.log('Create version clicked');
  };

  const handleSendForSignature = () => {
    console.log('Send for signature clicked');
  };

  const handleDownload = () => {
    console.log('Download clicked');
  };

  const handleComment = () => {
    console.log('Comment clicked');
  };

  const handleMore = (action: string) => {
    console.log('More action:', action);
  };

  const handlePrevFile = () => {
    console.log('Previous file');
  };

  const handleNextFile = () => {
    console.log('Next file');
  };

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#f9fafb' }} >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <FileDetailHeader
          file={file}
          isEditing={isEditing}
          hasPreview={true}
          onEdit={handleEdit}
          onSave={handleSave}
          onSaveAndClose={handleSaveAndClose}
          onCancel={handleCancel}
          onDelete={handleDelete}
          onSubmit={handleSubmit}
          onCreateVersion={handleCreateVersion}
          onSendForSignature={handleSendForSignature}
          onDownload={handleDownload}
          onComment={handleComment}
          onMore={handleMore}
          onPrevFile={handlePrevFile}
          onNextFile={handleNextFile}
          currentIndex={4}
          totalFiles={24}
          currentPage={currentPage}
          totalPages={10}
          zoom={zoom}
          onPageChange={setCurrentPage}
          onZoomChange={setZoom}
        />

        {/* Content Area */}
        <div className="rounded-2xl border p-6" style={{ backgroundColor: '#ffffff' }} >
          <h2 className="text-lg font-semibold mb-4">File Content</h2>
          <div className="rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }} >
            <p style={{ color: '#6b7280' }} >
              {isEditing ? 'Edit Mode - File Preview' : 'View Mode - File Preview'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

