import React from 'react';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Select } from '@shared/components'; // CommonSelect as Select
// Import MultiSelect if available, else use checkboxes for tags

export type ViewMode = 'grid' | 'list';
export type SortDirection = 'asc' | 'desc';

interface FilesFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onRefresh?: () => void;
  // New props
  status: string;
  onStatusChange: (v: string) => void;
  type: string;
  onTypeChange: (v: string) => void;
  availableTags: string[];
  tagsLoading: boolean;
  tagsError: boolean;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  onRetryTags?: () => void;
  sortBy: string;
  onSortByChange: (v: string) => void;
  sortDirection: SortDirection;
  onSortDirectionChange: (d: SortDirection) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export const FilesFilters: React.FC<FilesFiltersProps> = ({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
  status,
  onStatusChange,
  type,
  onTypeChange,
  availableTags,
  tagsLoading,
  tagsError,
  selectedTags,
  onToggleTag,
  onRetryTags,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
  showAdvanced,
  onToggleAdvanced,
}) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3">
      {/* Top Row: Search + Refresh */}
      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('repositories.filesFilters.searchPlaceholder')}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            {t('repositories.filesFilters.refresh')}
          </button>
        )}
      </div>

      {/* Advanced Toggle */}
      <button
        onClick={onToggleAdvanced}
        className="text-sm text-indigo-600 hover:underline"
      >
        {showAdvanced ? t('hideAdvanced') : t('showAdvanced')}
      </button>

      {/* Advanced Filters (Collapsible) */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-md">
          {/* Status Dropdown */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              {t('status')}
            </label>
            <Select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="text-sm"
              options={[
                { value: 'ALL', label: t('allStatus') },
                { value: 'DRAFT', label: t('draft') },
                { value: 'ACTIVE', label: t('active') },
              ]}
            />
          </div>

          {/* Type Dropdown */}
          <div>
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              {t('type')}
            </label>
            <Select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="text-sm"
              options={[
                { value: 'ALL', label: t('allTypes') },
                { value: 'CONTRACT', label: t('contract') },
              ]}
            />
          </div>

          {/* Tags Multi-Select (Simple checkboxes for now) */}
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              {t('tags')}
              {tagsLoading && <span className="ml-1 text-indigo-600">Loading...</span>}
              {tagsError && <button onClick={onRetryTags} className="ml-1 text-red-600 underline text-xs">Retry</button>}
            </label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
                <label key={tag} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag)}
                    onChange={() => onToggleTag(tag)}
                    className="rounded"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex gap-2">
            <Select
              value={sortBy}
              onChange={(e) => onSortByChange(e.target.value)}
              className="w-24"
              options={[
                { value: 'createdAt', label: 'Created At' },
                { value: 'title', label: 'Title' },
              ]}
            />
            <Select
              value={sortDirection}
              onChange={(e) => onSortDirectionChange(e.target.value as SortDirection)}
              className="w-20"
              options={[
                { value: 'asc', label: 'Asc' },
                { value: 'desc', label: 'Desc' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Bottom Row: View Mode */}
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1.5 text-xs ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {t('repositories.filesFilters.grid')}
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-1.5 text-xs border-l border-gray-200 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {t('repositories.filesFilters.list')}
          </button>
        </div>
      </div>
    </div>
  );
};

