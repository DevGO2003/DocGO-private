import type { Document } from '../../models/types/docs';
import type { FileApiData } from '../../models/types/file-api';

export function mapFileApiToUiDocument(data: FileApiData): Document {
  const ov = data.overview || ({} as FileApiData['overview']);
  const ct = data.contract || {};
  const payment = (ct as any).payment || {};
  const parties = Array.isArray((ct as any).parties) ? (ct as any).parties : [];

  const documentType =
    (ov.documentType === 'CONTRACT' ? 'CONTRACT' : ov.documentType === 'GENERAL' ? 'GENERAL' : (ov as any).documentType) ??
    undefined;

  const effectiveDate = (ct as any).effectiveDate || undefined;
  const expiryDate = (ct as any).expiryDate || undefined;
  const totalValue =
    typeof (ct as any).totalValue === 'number'
      ? (ct as any).totalValue
      : typeof (payment as any).totalValue === 'number'
      ? (payment as any).totalValue
      : undefined;
  const currency = (ct as any).currency || (payment as any).currency || undefined;

  return {
    id: String(data.id),
    title: ov.title || `Document ${data.id}`,
    description: (ct as any).summary || '',
    status: ov.status || 'DRAFT',
    contractType: ov.contractType || ov.category || 'Other',
    tags: ov.tags || [],
    contractNumber: data.id,
    createdAt: data.audit?.createdAt || '',
    updatedAt: data.audit?.updatedAt || '',
    parties: parties.map((p: any) => ({ name: p.name || '', role: p.role || '' })),
    totalValue: totalValue ?? 0,
    currency: currency ?? 'VND',
    effectiveDate: effectiveDate || '',
    expiryDate: expiryDate || '',
    riskLevel: (ct as any).risk?.level,
    attachments: [],
    documentType,
    fileType: data.file?.type || undefined,
    fileSize: data.file?.size || undefined,
    category: ov.category || undefined,
    extension: data.file?.name?.includes('.') ? data.file?.name.split('.').pop() : undefined,
    contractMetadata: { effectiveDate, expiryDate, totalValue, currency },
    file: data.file as any,
    storage: data.storage as any,
  };
}
