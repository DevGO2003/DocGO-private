export type BaseFile = {
  kind: 'general' | 'contract';
  fileId: string;
  fileName: string;
  status?: string;
  tags?: string[];
  fileType?: string | null;
  fileSize?: number | null;
  uploadedAt?: string | null;
  contractType?: string | null;
  repositoryId?: string | null;
};

export type ContractParty = {
  name?: string;
  role?: string;
};

export type ContractFile = BaseFile & {
  kind: 'contract';
  totalValue?: number | null;
  currency?: string | null;
  parties?: ContractParty[];
  effectiveDate?: string | null;
  expiryDate?: string | null;
  riskLevel?: string | null;
  contractNumber?: string | null;
};

export type GeneralFile = BaseFile & {
  kind: 'general';
};

export type FileUnion = ContractFile | GeneralFile;
