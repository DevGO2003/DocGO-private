import { FileItem } from '../types/repository.types';

/**
 * Map API file data to UI document structure (compatible with src-old)
 * Following the structure from src-old/lib/mappers/file-mapper.ts
 * 
 * ✅ FULL MAPPING: Bao gồm tất cả các trường từ backend
 */
export function mapFileApiToUiDocument(apiData: FileItem, fileId: string, fileName: string, size: number): any {
  const ov = (apiData as any)?.overview || {};
  const ct = (apiData as any)?.contract || {};
  const payment = ct.payment || {};
  const parties = Array.isArray(ct.parties) ? ct.parties : [];
  const content = (apiData as any)?.content || {};
  const storage = (apiData as any)?.storage || {};
  const versioning = (apiData as any)?.versioning || {};
  const security = (apiData as any)?.security || {};
  const audit = (apiData as any)?.audit || {};
  const metadata = (apiData as any)?.metadata || {};

  // Normalize documentType
  const documentType =
    ov.documentType === 'CONTRACT'
      ? 'CONTRACT'
      : ov.documentType === 'GENERAL'
      ? 'GENERAL'
      : ov.documentType;

  // Handle totalValue from both contract and payment
  const totalValue =
    typeof ct.totalValue === 'number'
      ? ct.totalValue
      : typeof payment.totalValue === 'number'
      ? payment.totalValue
      : undefined;

  const currency = ct.currency || payment.currency || 'VND';

  return {
    id: String(fileId),
    // ✅ FIXED: Use overview.title instead of fileName
    title: ov.title || `Document ${fileId}`,
    description: ct.summary || '',
    status: ov.status || 'DRAFT',
    contractType: ov.contractType || ov.category || 'Other',
    tags: ov.tags || [],
    contractNumber: fileId,
    createdAt: (apiData as any)?.audit?.createdAt || '',
    updatedAt: (apiData as any)?.audit?.updatedAt || '',
    // ✅ PARTIES - Đầy đủ thông tin liên hệ
    parties: parties.map((p: any) => ({
      name: p.name || '',
      role: p.role || '',
      representative: p.representative || null,
      taxCode: p.taxCode || null,
      contact: p.contact || null,
      address: p.address || null,
      email: p.email || null,
      phone: p.phone || null,
    })),
    totalValue: totalValue ?? 0,
    currency,
    effectiveDate: ct.effectiveDate || '',
    expiryDate: ct.expiryDate || '',
    riskLevel: ct.risk?.level,
    attachments: [],
    documentType,
    fileType: (apiData as any)?.file?.type || undefined,
    fileSize: (apiData as any)?.file?.size || undefined,
    category: ov.category || undefined,
    extension: (apiData as any)?.file?.name?.includes('.')
      ? (apiData as any)?.file?.name.split('.').pop()
      : undefined,
    contractMetadata: {
      effectiveDate: ct.effectiveDate,
      expiryDate: ct.expiryDate,
      totalValue,
      currency,
    },
    file: (apiData as any)?.file,

    // Additional fields for tabs
    project: ct.project || null,
    department: ct.department || null,
    priority: ct.priority || null,
    confidentiality: ct.confidentiality || null,
    summary: ct.summary || '',
    paymentDetails: {
      totalValue,
      currency,
      schedule: payment.schedule || [],
      paymentMethod: payment.method || '',
    },
    // ✅ CLAUSES - Đầy đủ key/unfavorable/intellectual property
    keyClauses: (ct.clauses?.key || []).map((clause: any) => ({
      name: clause.name || '',
      description: clause.description || '',
      importance: clause.importance || null,
      risk: clause.risk || null,
      category: clause.category || null,
    })),
    unfavorableClauses: ct.clauses?.unfavorable || [],
    intellectualPropertyClauses: ct.clauses?.intellectualProperty || [],
    allClauses: ct.clauses?.all || [],
    reminders: (ct.reminders || []).map((reminder: any) => ({
      date: reminder.date || null,
      title: reminder.title || '',
      description: reminder.description || '',
      type: reminder.type || null,
      priority: reminder.priority || null,
    })),
    riskAssessment: {
      riskLevel: ct.risk?.level || null,
      riskFactors: ct.risk?.factors || [],
      mitigationMeasures: ct.risk?.mitigations || [],
    },
    complianceStatus: {
      status: ct.compliance?.status || null,
      issues: ct.compliance?.issues || [],
      recommendations: ct.compliance?.recommendations || [],
    },
    // ✅ CONTENT - Đầy đủ tất cả layers
    content: {
      plaintext: content.plaintext || content.extractedText || '',
      ocr: {
        text: content.ocr?.text || '',
        status: content.ocr?.status || null,
        confidence: content.ocr?.confidence || null,
        engine: content.ocr?.engine || null,
        processedAt: content.ocr?.processedAt || null,
        characterCount: content.ocr?.characterCount || null,
        wordCount: content.ocr?.wordCount || null,
        metadata: content.ocr?.metadata || null,
      },
      extraction: {
        raw: content.extraction?.raw || '',
        structured: content.extraction?.structured || null,
        tables: content.extraction?.tables || [],
        images: content.extraction?.images || [],
        metadata: content.extraction?.metadata || null,
      },
      classification: content.classification || null,
      processing: {
        status: content.processing?.status || null,
        error: content.processing?.error || null,
        startedAt: content.processing?.startedAt || null,
        completedAt: content.processing?.completedAt || null,
      },
    },
    
    // Legacy compatibility
    ocrContent: content.ocr?.text || '',
    
    authorNotes: (apiData as any)?.notes || [],
    history: versioning.history || audit.history || [],
    permissions: security.permissions || [],
    
    // ✅ STORAGE - Đầy đủ S3 và Local
    storage: {
      type: storage.type || (storage.s3 ? 's3' : storage.local ? 'local' : null),
      s3: storage.s3 ? {
        url: storage.s3.url || null,
        bucket: storage.s3.bucket || null,
        objectKey: storage.s3.objectKey || null,
        region: storage.s3.region || null,
        contentType: storage.s3.contentType || null,
        size: storage.s3.size || null,
        versionId: storage.s3.versionId || null,
        checksum: storage.s3.checksum || null,
        etag: storage.s3.etag || null,
        metadata: storage.s3.metadata || null,
      } : null,
      local: storage.local ? {
        path: storage.local.path || null,
        filename: storage.local.filename || null,
        mimeType: storage.local.mimeType || null,
        size: storage.local.size || null,
        mtime: storage.local.mtime || null,
        revision: storage.local.revision || null,
      } : null,
    },
    
    // ✅ SECURITY - Permissions & Access Control
    security: {
      permissions: security.permissions || [],
      accessControl: security.accessControl || null,
      encryption: security.encryption ? {
        enabled: security.encryption.enabled || false,
        algorithm: security.encryption.algorithm || null,
        keyId: security.encryption.keyId || null,
      } : null,
      visibility: security.visibility || 'private',
      sharedWith: security.sharedWith || [],
    },
    
    // ✅ VERSIONING - Lịch sử phiên bản đầy đủ
    versioning: {
      enabled: versioning.enabled || false,
      currentVersion: versioning.currentVersion || 1,
      versions: versioning.versions || [],
      history: versioning.history || [],
      latestChange: versioning.latestChange || null,
    },
    
    // ✅ AUDIT - History đầy đủ
    audit: {
      createdAt: audit.createdAt || (apiData as any)?.createdAt || '',
      createdBy: audit.createdBy || null,
      updatedAt: audit.updatedAt || (apiData as any)?.updatedAt || '',
      updatedBy: audit.updatedBy || null,
      deletedAt: audit.deletedAt || null,
      deletedBy: audit.deletedBy || null,
      isDeleted: audit.isDeleted || false,
      version: audit.version || null,
      history: audit.history || [],
    },
    
    fileSystemMetadata: {
      dateModified: metadata.fileSystem?.dateModified || null,
      dateAdded: metadata.fileSystem?.dateAdded || null,
      mediaFilename: metadata.fileSystem?.mediaFilename || (apiData as any)?.file?.name || fileName,
      originalFilename: metadata.fileSystem?.originalFilename || (apiData as any)?.file?.name || fileName,
      originalMD5: metadata.fileSystem?.originalMD5 || metadata.file?.hash?.md5 || '',
      originalFileSize: metadata.fileSystem?.originalFileSize || metadata.file?.size || size,
      originalMimeType: metadata.fileSystem?.originalMimeType || (apiData as any)?.file?.type || null,
      archiveMD5: metadata.fileSystem?.archiveMD5 || '',
      archiveFileSize: metadata.fileSystem?.archiveFileSize || null,
    },
    originalDocumentMetadata: {
      dcFormat: metadata.originalDocument?.dcFormat || (apiData as any)?.file?.type || null,
      dcTitle: metadata.originalDocument?.dcTitle || ov.title || fileName,
      dcCreator: metadata.originalDocument?.dcCreator || null,
      dcDescription: metadata.originalDocument?.dcDescription || ct.summary || '',
      xmpCreateDate: metadata.originalDocument?.xmpCreateDate || null,
      xmpCreatorTool: metadata.originalDocument?.xmpCreatorTool || null,
      xmpModifyDate: metadata.originalDocument?.xmpModifyDate || null,
    },
    
    // ✅ METADATA - Technical metadata đầy đủ
    metadata: {
      fileSystem: metadata.fileSystem || null,
      originalDocument: metadata.originalDocument || null,
      technical: metadata.technical || null,
      custom: metadata.custom || null,
    },
  };
}
