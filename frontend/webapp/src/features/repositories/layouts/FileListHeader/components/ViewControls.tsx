import React from 'react';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import type { ViewMode } from '../FileListHeader.types';

interface ViewControlsProps {
  viewMode: ViewMode;
  sortBy?: string;
  onViewModeChange?: (mode: ViewMode) => void;
  onSortChange?: (sort: string) => void;
}

export const ViewControls: React.FC<ViewControlsProps> = ({
  viewMode,
  sortBy,
  onViewModeChange,
  onSortChange,
}) => {
  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {/* Grid View */}
      {onViewModeChange && (
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
          className="p-2"
          title="Grid view"
        >
          <CommonIcon name="grid" size={16} />
        </Button>
      )}

      {/* List View */}
      {onViewModeChange && (
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
          className="p-2"
          title="List view"
        >
          <CommonIcon name="list" size={16} />
        </Button>
      )}

      {/* Compact View */}
      {onViewModeChange && (
        <Button
          variant={viewMode === 'compact' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('compact')}
          className="p-2"
          title="Compact view"
        >
          <CommonIcon name="list" size={16} />
        </Button>
      )}

      {/* Sort Dropdown */}
      {onSortChange && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSortChange(sortBy || 'name')}
          className="inline-flex items-center gap-1 px-2"
        >
          <span className="text-xs">Sắp xếp</span>
          <CommonIcon name="chevron-down" size={12} />
        </Button>
      )}
    </div>
  );
};

