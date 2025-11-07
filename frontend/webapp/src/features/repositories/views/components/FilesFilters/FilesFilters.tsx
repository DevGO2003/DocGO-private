import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Input, Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import IncludeExcludeModal from '@shared/components/UIComponents/Modal/IncludeExcludeModal';
import TimeRangeModal from '@shared/components/UIComponents/Modal/TimeRangeModal';
import AddFileChoiceModal from '@shared/components/UIComponents/Modal/AddFileChoiceModal';

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
  // status,
  // onStatusChange,
  type,
  onTypeChange,
  availableTags,
  // tagsLoading,
  // tagsError,
  selectedTags,
  onToggleTag,
  // onRetryTags,
  sortBy,
  onSortByChange,
  sortDirection,
  onSortDirectionChange,
  showAdvanced,
  onToggleAdvanced,
}) => {
  const { t } = useTranslation();

  const fileTypes = [
    { value: 'ALL', label: t('repositories.files.filters.fileTypes.all', 'Tất cả') },
    { value: 'CONTRACT', label: t('repositories.files.filters.fileTypes.contract', 'Hợp đồng') },
    { value: 'GENERAL', label: t('repositories.files.filters.fileTypes.general', 'Tài liệu chung') },
  ];

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
    <>
      {/* Row 1: Search + Sort + SortDir (compact) */}
      <div className="flex items-center gap-[5px] w-full">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            {/* Simple icon placeholder */}
            <CommonIcon name="search" size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('repositories.files.filters.search')}
              className="pl-7 h-[28px] text-xs"
            />
          </div>
        </div>
        <Select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="h-[28px] min-w-[130px] text-xs"
          options={[
            { value: 'createdAt', label: t('repositories.files.filters.sortOptions.createdAt') },
            { value: 'title', label: t('repositories.files.filters.sortOptions.fileName') },
            { value: 'status', label: t('repositories.files.filters.sortOptions.status') },
            { value: 'totalValue', label: t('repositories.files.filters.sortOptions.totalValue') },
            { value: 'uploadedAt', label: t('repositories.files.filters.sortOptions.uploadedAt') },
          ]}
        />
        <Select
          value={sortDirection}
          onChange={(e) => onSortDirectionChange(e.target.value as SortDirection)}
          className="h-[28px] min-w-[110px] text-xs"
          options={[
            { value: 'asc', label: t('repositories.files.filters.sortDirections.asc') },
            { value: 'desc', label: t('repositories.files.filters.sortDirections.desc') },
          ]}
        />
      </div>

      {/* Row 2: Advanced toggle + filter triggers + reset + view toggle */}
      <div className="flex items-center gap-[5px] w-full mt-[5px]">
        <Button
          variant="ghost"
          onClick={onToggleAdvanced}
          className="text-sm hover: font-medium whitespace-nowrap h-auto p-0" style={{ color: '#4338ca' }} >
          {showAdvanced ? t('repositories.files.filters.hideAdvanced') : t('repositories.files.filters.showAdvanced')}
        </Button>
        {showAdvanced && (
          <div className="ml-auto flex items-center gap-[5px]">
            <Button
              variant="outline"
              size="sm"
              onClick={(e)=>{ setOpenTags(true); setAnchorTags(e.currentTarget); }}
              className="h-[28px] text-xs"
            >
              {t('repositories.files.filters.classification')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e)=>{ setOpenTypes(true); setAnchorTypes(e.currentTarget); }}
              className="h-[28px] text-xs"
            >
              {t('repositories.files.filters.fileType')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={(e)=>{ setOpenTime(true); setAnchorTime(e.currentTarget); }}
              className="h-[28px] text-xs"
            >
              {t('repositories.files.filters.timeRange')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { onSearchChange(''); onTypeChange('ALL'); }}
              className="h-[28px] text-xs"
            >
              {t('repositories.files.filters.reset')}
            </Button>
            <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: '#d1d5db' }} >
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="p-1.5 rounded-none border-0 h-auto"
                title={t('repositories.files.filters.viewGrid')}
              >
                {t('repositories.files.filters.viewGrid')}
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="p-1.5 rounded-none border-0 border-l h-auto"
                title={t('repositories.files.filters.viewList')}
              >
                {t('repositories.files.filters.viewList')}
              </Button>
            </div>

          </div>
        )}
      </div>

      {/* Row 3: Actions */}
      <div className="mt-[5px] flex items-center gap-[5px] justify-end">
        <Button variant="outline" size="sm" onClick={()=>setOpenAdd(true)} className="h-[28px] text-xs">{t('repositories.files.filters.add')}</Button>
        <Button variant="outline" size="sm" className="h-[28px] text-xs">{t('repositories.files.filters.edit')}</Button>
        <Button variant="destructive" size="sm" className="h-[28px] text-xs">{t('repositories.files.filters.delete')}</Button>
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
        availableItems={fileTypes.map(ft => ft.label)}
        include={type && type !== 'ALL' ? [fileTypes.find(ft => ft.value === type)?.label].filter(Boolean) as string[] : []}
        exclude={[]}
        onChange={(inc) => {
          const pickedLabel = Array.isArray(inc) && inc.length > 0 ? inc[0] : '';
          const pickedValue = fileTypes.find(ft => ft.label === pickedLabel)?.value || 'ALL';
          onTypeChange(pickedValue);
        }}
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
    </>
  );
};

