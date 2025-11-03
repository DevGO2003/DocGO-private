import React from 'react';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import type { FilterState } from '../FileListHeader.types';

interface FilterDisplayProps {
  filters?: FilterState;
  onClearFilters?: () => void;
}

export const FilterDisplay: React.FC<FilterDisplayProps> = ({
  filters,
  onClearFilters,
}) => {
  if (!filters) return null;

  const activeFilters: string[] = [];
  
  if (filters.search) activeFilters.push(`Tìm kiếm: "${filters.search}"`);
  if (filters.type && filters.type.length > 0) activeFilters.push(...filters.type);
  if (filters.status && filters.status.length > 0) activeFilters.push(...filters.status);
  if (filters.tags && filters.tags.length > 0) activeFilters.push(...filters.tags);
  if (filters.dateRange) activeFilters.push('Khoảng thời gian');

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm font-medium" style={{ color: '#4b5563' }} >Bộ lọc:</span>
      {activeFilters.map((filter, idx) => (
        <span
          key={idx}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }} >
          {filter}
          <button
            onClick={onClearFilters}
            className="hover:bg-blue-200 rounded-full p-0.5"
          >
            <CommonIcon name="x" size={12} />
          </button>
        </span>
      ))}
      {onClearFilters && activeFilters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearFilters}
          className="text-xs"
        >
          Xóa tất cả
        </Button>
      )}
    </div>
  );
};

