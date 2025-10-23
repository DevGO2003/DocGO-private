/**
 * Event Architecture v3 - TypeScript Types
 * Kafka event types for file upload flow
 */

// ==================== BASE EVENT ====================

export interface EventBase {
  eventVersion: string;
  eventId: string;
  timestamp: string;
  source: string;
  correlationId: string;
  actor: string;
}

// ==================== EVENT 1: FILE_UPLOAD_COMPLETED ====================

export interface FileUploadCompletedData {
  documentId: string;
  fileName: string;
  mimeType: string;
  size: number;
  ownerUserId: string;
  storage: {
    s3?: {
      url: string;
      bucket: string;
      objectKey: string;
      key: string;
      region: string;
      contentType: string;
      size: number;
      versionId?: string;
      checksum?: {
        md5: string;
      };
      storageClass?: string;
    };
    local?: {
      path: string;
      filename: string;
      mimeType: string;
      size: number;
      mtime: string;
      revision?: string;
    };
  };
  metadata: {
    file?: {
      name: string;
      mimeType: string;
      size: number;
      hash?: {
        md5: string;
        sha256: string;
      };
    };
    fileSystem?: {
      dateAdded: string;
      dateModified: string;
      originalFilename: string;
      originalMD5?: string;
      originalFileSize?: number;
      originalMimeType?: string;
      archiveMD5?: string;
      archiveFileSize?: number;
    };
  };
}

export interface FileUploadCompletedEvent extends EventBase {
  eventType: 'FILE_UPLOAD_COMPLETED';
  data: FileUploadCompletedData;
}

// ==================== EVENT 2: FILE_CONTENT_EXTRACTED ====================

export interface FileContentExtractedData {
  documentId: string;
  content: {
    plaintext?: string;
    extractedText?: string;
    summary?: string;
    keyTerms?: string[];
    ocr?: {
      text: string;
      status: string;
      engine: string;
      confidence: number;
      processedAt: string;
      processingTime: number;
      metadata?: {
        language: string;
        pageCount: number;
        boxCount: number;
        averageConfidence: number;
      };
    };
    extraction?: {
      status: string;
      method: string;
      extractedAt: string;
      characterCount: number;
      wordCount: number;
    };
    summarization?: {
      status: string;
      model: string;
      processedAt: string;
      processingTime: number;
      inputTokens: number;
      outputTokens: number;
    };
    classification?: {
      isContract: boolean;
      confidence: number;
      language: string;
    };
    processing?: {
      status: string;
    };
    jsonAnalysisStatus?: string;
  };
  metadata?: {
    technical?: Record<string, any>;
    originalDocument?: {
      dcFormat?: string;
      dcTitle?: string;
      dcCreator?: string;
      dcDescription?: string;
      dcSubject?: string;
      xmpCreateDate?: string;
      xmpCreatorTool?: string;
    };
  };
}

export interface FileContentExtractedEvent extends EventBase {
  eventType: 'FILE_CONTENT_EXTRACTED';
  data: FileContentExtractedData;
}

// ==================== EVENT 3: CONTRACT_SUMMARY_GENERATED ====================

export interface ContractSummaryGeneratedData {
  documentId: string;
  contract: {
    parties?: Array<{
      name: string;
      type: string;
      role: string;
      contact?: {
        email?: string;
        phone?: string;
        address?: string;
      };
      representative?: {
        name: string;
        title: string;
        contact?: {
          email?: string;
          phone?: string;
        };
      };
    }>;
    payment?: {
      totalAmount?: number;
      currency?: string;
      schedule?: Array<{
        amount: number;
        dueDate: string;
        description: string;
      }>;
    };
    clauses?: {
      general?: string[];
      specific?: string[];
    };
    reminders?: Array<{
      type: string;
      date: string;
      description: string;
    }>;
    risk?: {
      level: string;
      factors: string[];
    };
    compliance?: {
      status: string;
      checks: Array<{
        name: string;
        passed: boolean;
        details: string;
      }>;
    };
    effectiveDate?: string;
    expiryDate?: string;
    duration?: string;
    terminationNotice?: string;
    governingLaw?: string;
    disputeResolution?: string;
  };
}

export interface ContractSummaryGeneratedEvent extends EventBase {
  eventType: 'CONTRACT_SUMMARY_GENERATED';
  data: ContractSummaryGeneratedData;
}

// ==================== UNION TYPE ====================

export type FileEvent =
  | FileUploadCompletedEvent
  | FileContentExtractedEvent
  | ContractSummaryGeneratedEvent;

// ==================== KAFKA MESSAGE ====================

export interface KafkaFileMessage {
  key: string;
  value: FileEvent;
}

// ==================== EVENT TYPE ENUM ====================

export enum FileEventType {
  FILE_UPLOAD_COMPLETED = 'FILE_UPLOAD_COMPLETED',
  FILE_CONTENT_EXTRACTED = 'FILE_CONTENT_EXTRACTED',
  CONTRACT_SUMMARY_GENERATED = 'CONTRACT_SUMMARY_GENERATED'
}
