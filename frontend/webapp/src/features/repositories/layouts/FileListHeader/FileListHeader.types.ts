export interface FilterState {
  search?: string;
  type?: string[];
  status?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
  tags?: string[];
}

export type ViewMode = 'grid' | 'list' | 'compact';

export interface FileListHeaderProps {
  // Stats
  totalFiles: number;
  newFiles?: number;
  processingFiles?: number;
  
  // Selection
  selectedFiles: string[];
  
  // Filters and view
  filters?: FilterState;
  viewMode: ViewMode;
  sortBy?: string;
  
  // Normal mode actions
  onNew?: () => void;
  onUpload?: () => void;
  onDownload?: () => void;
  onDelete?: () => void;
  onSearch?: (query: string) => void;
  onSettings?: () => void;
  onRefresh?: () => void;
  
  // Bulk actions
  onBulkDownload?: () => void;
  onBulkDelete?: () => void;
  onBulkTag?: () => void;
  onBulkMove?: () => void;
  onClearSelection?: () => void;
  
  // View controls
  onViewModeChange?: (mode: ViewMode) => void;
  onSortChange?: (sort: string) => void;
  
  // Filters
  onFilterChange?: (filters: FilterState) => void;
  onClearFilters?: () => void;
  
  // Styling
  className?: string;
}

