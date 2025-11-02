import React from 'react';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';

interface PreviewControlsProps {
  currentPage?: number;
  totalPages?: number;
  zoom?: number;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
}

export const PreviewControls: React.FC<PreviewControlsProps> = ({
  currentPage,
  totalPages,
  zoom = 100,
  onPageChange,
  onZoomChange,
}) => {
  if (!currentPage || !totalPages) return null;

  const handlePrevPage = () => {
    if (onPageChange && currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (onPageChange && currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handleZoomIn = () => {
    if (onZoomChange) {
      onZoomChange(Math.min(zoom + 25, 200));
    }
  };

  const handleZoomOut = () => {
    if (onZoomChange) {
      onZoomChange(Math.max(zoom - 25, 50));
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
      {/* Page Navigation */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage <= 1}
          className="p-1"
        >
          <CommonIcon name="chevron-left" size={16} />
        </Button>
        
        <span className="text-sm text-gray-700 px-2 min-w-[60px] text-center">
          {currentPage}/{totalPages}
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage >= totalPages}
          className="p-1"
        >
          <CommonIcon name="chevron-right" size={16} />
        </Button>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-300" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomOut}
          disabled={zoom <= 50}
          className="p-1"
        >
          <CommonIcon name="minus" size={16} />
        </Button>
        
        <span className="text-sm text-gray-700 px-2 min-w-[50px] text-center">
          {zoom}%
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          className="p-1"
        >
          <CommonIcon name="plus" size={16} />
        </Button>
      </div>
    </div>
  );
};

