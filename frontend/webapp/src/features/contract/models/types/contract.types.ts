// Contract types
export interface Contract {
  id: string;
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  organizationId: string;
  repositoryId?: string;
  uploadedBy: string;
  uploadedByName?: string;
  status: ContractStatus;
  createdAt: string;
  updatedAt: string;
}

export enum ContractStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
}

export interface ContractUploadData {
  file: File;
  title: string;
  description?: string;
  organizationId: string;
  repositoryId?: string;
}

export interface ContractCreateRequest {
  title: string;
  description?: string;
  fileName: string;
  fileSize: number;
  fileUrl: string;
  organizationId: string;
  repositoryId?: string;
  uploadedBy: string;
}
