import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Select, Input, Button, RefreshButton } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import IncludeExcludeModal from '@shared/components/UIComponents/Modal/IncludeExcludeModal';
import TimeRangeModal from '@shared/components/UIComponents/Modal/TimeRangeModal';
import AddFileChoiceModal from '@shared/components/UIComponents/Modal/AddFileChoiceModal';

export type SortDirection = 'asc' | 'desc';

interface FilesFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
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
  onRefresh?: () => void;
  refreshing?: boolean;
  onUploadClick?: () => void;
}

export const FilesFilters: React.FC<FilesFiltersProps> = ({
  search,
  onSearchChange,
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
  onRefresh,
  refreshing = false,
  onUploadClick,
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

  const handleTagsChange = (inc: string[]) => {
    // Diff with selectedTags and call onToggleTag accordingly
    const next = Array.from(new Set(inc));
    // Remove
    selectedTags.forEach(tag => { if (!next.includes(tag)) onToggleTag(tag); });
    // Add
    next.forEach(tag => { if (!selectedTags.includes(tag)) onToggleTag(tag); });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Row 1: Search + Sort + SortDir + RefreshButton */}
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <CommonIcon name="search" size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('repositories.files.filters.search')}
              className="pl-7"
            />
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-[130px]"
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
            className="w-[110px]"
            options={[
              { value: 'asc', label: t('repositories.files.filters.sortDirections.asc') },
              { value: 'desc', label: t('repositories.files.filters.sortDirections.desc') },
            ]}
          />
        </div>
        {onRefresh && <RefreshButton onClick={onRefresh} loading={refreshing} className="flex-shrink-0" />}
      </div>

      {/* Row 2: Actions (Upload, etc.) */}
      <div className="flex items-center gap-2 justify-end w-full">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={onUploadClick}
            className="flex items-center gap-2"
          >
            <CommonIcon name="upload" size={16} />
            {t('repositories.files.filters.upload', 'Tải tệp lên')}
          </Button>
        </div>
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
      />
      <TimeRangeModal
        open={openTime}
        title={t('repositories.files.filters.timeRange')}
        value={{}}
        onChange={() => {}}
        onClose={()=>setOpenTime(false)}
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

