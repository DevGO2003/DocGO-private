import type { FileApiData } from '../../models/types/file-api';
import type { FileUnion, ContractFile, GeneralFile } from '../../models/types/file.types';

export function mapFileApiToUiDocument(data: FileApiData): FileUnion {
  const ov = data.overview || ({} as FileApiData['overview']);
  const ct = (data as any).contract || {};
  const payment = (ct as any).payment || {};
  const parties = Array.isArray((ct as any).parties) ? (ct as any).parties : [];

  const isContract = ov.documentType === 'CONTRACT'
    || typeof (ct as any).totalValue === 'number'
    || Array.isArray((ct as any).parties);

  const base = {
    fileId: String(data.id),
    fileName: ov.title || (data.file?.name || `File ${data.id}`),
    status: ov.status || 'DRAFT',
    contractType: ov.contractType || ov.category || undefined,
    tags: ov.tags || [],
    fileType: data.file?.type || undefined,
    fileSize: data.file?.size || undefined,
    uploadedAt: data.audit?.createdAt || undefined,
    repositoryId: (data as any).repositoryId || undefined,
  };

  if (isContract) {
    const effectiveDate = (ct as any).effectiveDate || undefined;
    const expiryDate = (ct as any).expiryDate || undefined;
    const totalValue =
      typeof (ct as any).totalValue === 'number'
        ? (ct as any).totalValue
        : typeof (payment as any).totalValue === 'number'
        ? (payment as any).totalValue
        : undefined;
    const currency = (ct as any).currency || (payment as any).currency || undefined;

    const cf: ContractFile = {
      kind: 'contract',
      ...base,
      totalValue,
      currency,
      parties: parties.map((p: any) => ({ name: p.name || '', role: p.role || '' })),
      effectiveDate,
      expiryDate,
      riskLevel: (ct as any).risk?.level,
      contractNumber: String(data.id),
    };
    return cf;
  }

  const gf: GeneralFile = {
    kind: 'general',
    ...base,
  };
  return gf;
}
