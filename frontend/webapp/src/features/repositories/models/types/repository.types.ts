// Repository types matching backend

export type RepositoryType = 'PERSONAL' | 'ORGANIZATION';

export interface Repository {
  id: string;
  name: string;
  description?: string;
  type: RepositoryType;
  ownerUserId: string;
  ownerName?: string;
  organizationId?: string;
  organizationName?: string;
  memberCount: number;
  fileCount: number;
  totalSize: number; // bytes
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  tags?: string[];
  metadata?: Record<string, any>;
  settings?: RepositorySettings;
  permissions?: RepositoryPermission[];
}

export interface RepositorySettings {
  allowFileUpload?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  enableVersioning?: boolean;
  enableComments?: boolean;
  enableTags?: boolean;
}

export interface RepositoryPermission {
  userId: string;
  role: string; // OWNER, ADMIN, EDITOR, VIEWER
  permissions: string[]; // READ, WRITE, DELETE, ADMIN
  grantedBy: string;
  grantedAt: string;
}

export interface RepositoryCreateData {
  name: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

export interface RepositoryUpdateData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
}

// File types
export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  repositoryId?: string;
  uploadedBy: string;
  uploadedByName?: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

export interface FileUploadData {
  file: File;
  repositoryId?: string;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Contract types
export interface Contract {
  id: string;
  title: string;
  content: string;
  status: string;
  type: string;
  parties: string[];
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
  attachments: string[];
}

export interface ContractCreateData {
  title: string;
  content: string;
  type: string;
  parties: string[];
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  tags?: string[];
}

export interface ContractUpdateData {
  title?: string;
  content?: string;
  status?: string;
  type?: string;
  parties?: string[];
  startDate?: string;
  endDate?: string;
  value?: number;
  currency?: string;
  tags?: string[];
}

// Document types
export interface Document {
  id: string;
  title: string;
  content: string;
  type: string;
  status: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  tags: string[];
}

export interface DocumentCreateData {
  title: string;
  content: string;
  type: string;
  filePath?: string;
  tags?: string[];
}

// Pagination and filters
export interface PaginationParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchTerm?: string;
  includeDeleted?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Repository state
export interface RepositoryState {
  repositories: Repository[];
  currentRepository: Repository | null;
  files: FileItem[];
  currentFile: FileItem | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    size: number;
    total: number;
  };
}
