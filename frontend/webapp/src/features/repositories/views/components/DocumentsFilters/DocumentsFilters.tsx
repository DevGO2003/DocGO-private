import React from 'react';
import { useTranslation } from 'react-i18next';

export type ViewMode = 'grid' | 'list';

interface DocumentsFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
  onRefresh?: () => void;
}

export const DocumentsFilters: React.FC<DocumentsFiltersProps> = ({
  search,
  onSearchChange,
  viewMode,
  onViewModeChange,
  onRefresh,
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('repositories.documentsFilters.searchPlaceholder')}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-3 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            {t('repositories.documentsFilters.refresh')}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`px-3 py-1.5 text-xs ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {t('repositories.documentsFilters.grid')}
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`px-3 py-1.5 text-xs border-l border-gray-200 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {t('repositories.documentsFilters.list')}
          </button>
        </div>
      </div>
    </div>
  );
};
