import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select } from '@shared/components'; // CommonSelect as Select
import IncludeExcludeModal from '@shared/components/UIComponents/Modal/IncludeExcludeModal';
import TimeRangeModal from '@shared/components/UIComponents/Modal/TimeRangeModal';
import AddFileChoiceModal from '@shared/components/UIComponents/Modal/AddFileChoiceModal';
// Import MultiSelect if available, else use checkboxes for tags

export type ViewMode = 'grid' | 'list';
export type SortDirection = 'asc' | 'desc';

interface FilesFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
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

  // Local state for modals + anchors
  const [openTags, setOpenTags] = useState(false);
  const [openTypes, setOpenTypes] = useState(false);
  const [openTime, setOpenTime] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [anchorTags, setAnchorTags] = useState<HTMLElement | null>(null);
  const [anchorTypes, setAnchorTypes] = useState<HTMLElement | null>(null);
  const [anchorTime, setAnchorTime] = useState<HTMLElement | null>(null);

  const handleTagsChange = (inc: string[]) => {
    // Diff with selectedTags and call onToggleTag accordingly
    const next = Array.from(new Set(inc));
    // Remove
    selectedTags.forEach(tag => { if (!next.includes(tag)) onToggleTag(tag); });
    // Add
    next.forEach(tag => { if (!selectedTags.includes(tag)) onToggleTag(tag); });
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-lg p-[0px] w-full">
      {/* Row 1: Search + Sort + SortDir + Refresh (compact) */}
      <div className="flex items-center gap-[5px] w-full">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            {/* Simple icon placeholder */}
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">🔎</span>
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('repositories.files.filters.search')}
              className="w-full rounded-lg border border-gray-300 pl-7 pr-2 h-[28px] text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="h-[28px] px-2 pr-6 py-0 leading-[1.1] min-w-[130px] rounded-lg border border-indigo-300 text-xs text-indigo-700 bg-white hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="createdAt">{t('repositories.files.filters.sortOptions.createdAt')}</option>
          <option value="title">{t('repositories.files.filters.sortOptions.fileName')}</option>
          <option value="status">{t('repositories.files.filters.sortOptions.status')}</option>
          <option value="totalValue">{t('repositories.files.filters.sortOptions.totalValue')}</option>
          <option value="uploadedAt">{t('repositories.files.filters.sortOptions.uploadedAt')}</option>
        </select>
        <select
          value={sortDirection}
          onChange={(e) => onSortDirectionChange(e.target.value as SortDirection)}
          className="h-[28px] px-2 pr-6 py-0 leading-[1.1] min-w-[110px] rounded-lg border border-indigo-300 text-xs text-indigo-700 bg-white hover:bg-indigo-50 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="asc">{t('repositories.files.filters.sortDirections.asc')}</option>
          <option value="desc">{t('repositories.files.filters.sortDirections.desc')}</option>
        </select>
      </div>

      {/* Row 2: Advanced toggle + filter triggers + reset + view toggle */}
      <div className="flex items-center gap-[5px] w-full mt-[5px]">
        <button onClick={onToggleAdvanced} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium whitespace-nowrap">
          {showAdvanced ? t('repositories.files.filters.hideAdvanced') : t('repositories.files.filters.showAdvanced')}
        </button>
        {showAdvanced && (
          <div className="ml-auto flex items-center gap-[5px]">
            <button
              onClick={(e)=>{ setOpenTags(true); setAnchorTags(e.currentTarget); }}
              className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"
            >
              {t('repositories.files.filters.classification')}
            </button>
            <button
              onClick={(e)=>{ setOpenTypes(true); setAnchorTypes(e.currentTarget); }}
              className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"
            >
              {t('repositories.files.filters.fileType')}
            </button>
            <button
              onClick={(e)=>{ setOpenTime(true); setAnchorTime(e.currentTarget); }}
              className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"
            >
              {t('repositories.files.filters.timeRange')}
            </button>
            <button
              onClick={() => { onSearchChange(''); onStatusChange('ALL'); onTypeChange('ALL'); }}
              className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50"
            >
              {t('repositories.files.filters.reset')}
            </button>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button onClick={() => onViewModeChange('grid')} className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} title={t('repositories.files.filters.viewGrid')}>
                {t('repositories.files.filters.viewGrid')}
              </button>
              <button onClick={() => onViewModeChange('list')} className={`p-1.5 transition-colors border-l border-gray-300 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} title={t('repositories.files.filters.viewList')}>
                {t('repositories.files.filters.viewList')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Row 3: Actions */}
      <div className="mt-[5px] flex items-center gap-[5px] justify-end">
        <button onClick={()=>setOpenAdd(true)} className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">{t('repositories.files.filters.add')}</button>
        <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-indigo-300 text-xs text-indigo-700 hover:bg-indigo-50">{t('repositories.files.filters.edit')}</button>
        <button className="inline-flex items-center gap-1 px-2 h-[28px] rounded-lg border border-rose-300 text-xs text-rose-700 hover:bg-rose-50">{t('repositories.files.filters.delete')}</button>
      </div>

      {/* Modals */}
      <IncludeExcludeModal
        open={openTags}
        title={t('repositories.files.filters.classification')}
        availableItems={availableTags}
        include={selectedTags}
        exclude={[]}
        onChange={(inc) => handleTagsChange(inc)}
        onClose={()=>setOpenTags(false)}
        anchorEl={anchorTags}
      />
      <IncludeExcludeModal
        open={openTypes}
        title={t('repositories.files.filters.fileType')}
        availableItems={["ALL","CONTRACT","GENERAL"]}
        include={type && type !== 'ALL' ? [type] : []}
        exclude={[]}
        onChange={(inc) => { const picked = Array.isArray(inc) && inc.length > 0 ? inc[0] : 'ALL'; onTypeChange(picked); }}
        onClose={()=>setOpenTypes(false)}
        anchorEl={anchorTypes}
      />
      <TimeRangeModal
        open={openTime}
        title={t('repositories.files.filters.timeRange')}
        value={{}}
        onChange={() => {}}
        onClose={()=>setOpenTime(false)}
        anchorEl={anchorTime}
      />
      <AddFileChoiceModal
        open={openAdd}
        onCreateNew={() => { setOpenAdd(false); }}
        onUpload={() => { setOpenAdd(false); }}
        onClose={()=>setOpenAdd(false)}
      />
    </div>
  );
};

