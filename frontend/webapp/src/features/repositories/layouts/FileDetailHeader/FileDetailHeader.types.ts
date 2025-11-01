export interface FileData {
  id: string;
  name: string;
  code?: string;
  type?: string;
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
  size?: number;
  status?: string;
}

export interface FileDetailHeaderProps {
  file: FileData;
  isEditing: boolean;
  hasPreview?: boolean;
  
  // Actions
  onEdit: () => void;
  onSave: () => void;
  onSaveAndClose: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onSubmit?: () => void;
  onCreateVersion?: () => void;
  onSendForSignature?: () => void;
  onDownload?: () => void;
  onComment?: () => void;
  onMore?: (action: string) => void;
  
  // Navigation
  onPrevFile?: () => void;
  onNextFile?: () => void;
  currentIndex?: number;
  totalFiles?: number;
  
  // Preview controls
  currentPage?: number;
  totalPages?: number;
  zoom?: number;
  onPageChange?: (page: number) => void;
  onZoomChange?: (zoom: number) => void;
  
  // Styling
  className?: string;
}

