package com.devgo2003.docgo.file_service.mapper;

import com.devgo2003.docgo.file_service.api.ApiDocument;
import com.devgo2003.docgo.file_service.entity.DocumentEntity;
import java.util.ArrayList;

public class ApiDocumentMapper {

  public static ApiDocument toApi(DocumentEntity e) {
    if (e == null) return null;
    ApiDocument d = new ApiDocument();
    d.id = e.getId();

    // overview
    ApiDocument.Overview o = new ApiDocument.Overview();
    o.title = e.getTitle();
    o.status = e.getStatus();
    o.documentType = e.getDocumentType();
    o.contractType = e.getContractType();
    o.category = e.getCategory();
    o.tags = e.getTags();
    o.ownerUserId = e.getUserId();
    o.isNew = false;
    d.overview = o;

    // contract
    ApiDocument.Contract c = new ApiDocument.Contract();
    if (e.getContractMetadata() != null) {
      c.effectiveDate = e.getContractMetadata().getEffectiveDate() == null ? null : e.getContractMetadata().getEffectiveDate().atOffset(java.time.ZoneOffset.UTC);
      c.expiryDate = e.getContractMetadata().getExpiryDate() == null ? null : e.getContractMetadata().getExpiryDate().atOffset(java.time.ZoneOffset.UTC);
      c.totalValue = e.getContractMetadata().getTotalValue() == null ? null : java.math.BigDecimal.valueOf(e.getContractMetadata().getTotalValue());
      c.currency = e.getContractMetadata().getCurrency();
      c.summary = e.getDescription();
    } else {
      c.summary = e.getDescription();
    }
    // map parties list
    if (e.getParties() != null) {
      c.parties = new ArrayList<>();
      e.getParties().forEach(p -> {
        ApiDocument.Party ap = new ApiDocument.Party();
        ap.name = p.getName();
        ap.role = p.getRole();
        ap.representative = p.getRepresentative();
        ap.taxCode = p.getTaxCode();
        ap.contact = p.getContact();
        ap.address = p.getAddress();
        c.parties.add(ap);
      });
    }
    if (e.getPaymentDetails() != null) {
      ApiDocument.Payment p = new ApiDocument.Payment();
      p.totalValue = e.getPaymentDetails().getTotalValue() == null ? null : java.math.BigDecimal.valueOf(e.getPaymentDetails().getTotalValue());
      p.currency = e.getPaymentDetails().getCurrency();
      p.schedule = e.getPaymentDetails().getSchedule();
      p.method = e.getPaymentDetails().getPaymentMethod();
      c.payment = p;
    }
    ApiDocument.Clauses clauses = new ApiDocument.Clauses();
    clauses.unfavorable = e.getUnfavorableClauses();
    // key clauses mapping if present
    if (e.getKeyClauses() != null) {
      clauses.key = new ArrayList<>();
      e.getKeyClauses().forEach(k -> {
        ApiDocument.ClauseKey ck = new ApiDocument.ClauseKey();
        ck.name = k.getName();
        ck.description = k.getDescription();
        ck.importance = k.getImportance();
        ck.risk = k.getRisk();
        clauses.key.add(ck);
      });
    }
    c.clauses = clauses;
    if (e.getReminders() != null) {
      c.reminders = new ArrayList<>();
      e.getReminders().forEach(rm -> {
        ApiDocument.Reminder ar = new ApiDocument.Reminder();
        ar.date = rm.getDate() == null ? null : rm.getDate().atOffset(java.time.ZoneOffset.UTC);
        ar.title = rm.getTitle();
        ar.description = rm.getDescription();
        c.reminders.add(ar);
      });
    }
    if (e.getRiskAssessment() != null) {
      ApiDocument.Risk r = new ApiDocument.Risk();
      r.level = e.getRiskAssessment().getRiskLevel();
      r.factors = e.getRiskAssessment().getRiskFactors();
      r.mitigations = e.getRiskAssessment().getMitigationMeasures();
      c.risk = r;
    }
    if (e.getComplianceStatus() != null) {
      ApiDocument.Compliance cp = new ApiDocument.Compliance();
      cp.status = e.getComplianceStatus().getStatus();
      cp.issues = e.getComplianceStatus().getIssues();
      cp.recommendations = e.getComplianceStatus().getRecommendations();
      c.compliance = cp;
    }
    d.contract = c;

    // content
    ApiDocument.Content content = new ApiDocument.Content();
    content.plaintext = e.getContent();
    ApiDocument.Ocr ocr = new ApiDocument.Ocr();
    ocr.text = e.getOcrText();
    ocr.status = e.getOcrStatus();
    content.ocr = ocr;
    content.classification = e.getClassificationResult();
    ApiDocument.Processing pr = new ApiDocument.Processing();
    pr.status = e.getProcessingStatus();
    pr.error = e.getProcessingError();
    content.processing = pr;
    d.content = content;

    // file (minimal)
    ApiDocument.FileMinimal f = new ApiDocument.FileMinimal();
    f.id = e.getFileId();
    f.name = e.getFileName();
    f.type = e.getFileType();
    f.size = e.getFileSize() == null ? null : e.getFileSize().intValue();
    f.version = null;
    d.file = f;

    // storage (best-effort from existing fields)
    ApiDocument.Storage storage = new ApiDocument.Storage();
    ApiDocument.StorageS3 s3 = new ApiDocument.StorageS3();
    s3.url = e.getFileUrl();
    s3.bucket = null;
    s3.objectKey = null;
    s3.region = null;
    s3.contentType = e.getFileType();
    s3.size = f.size;
    ApiDocument.Checksum checksum = new ApiDocument.Checksum();
    checksum.originalMD5 = e.getFileSystemMetadata() != null ? e.getFileSystemMetadata().getOriginalMD5() : null;
    checksum.archiveMD5 = e.getFileSystemMetadata() != null ? e.getFileSystemMetadata().getArchiveMD5() : null;
    s3.checksum = checksum;
    storage.s3 = s3;
    ApiDocument.StorageLocal local = new ApiDocument.StorageLocal();
    local.path = null;
    local.filename = e.getFileName();
    local.mimeType = e.getFileType();
    local.size = f.size;
    local.mtime = e.getFileSystemMetadata() != null && e.getFileSystemMetadata().getDateModified() != null ? e.getFileSystemMetadata().getDateModified().atOffset(java.time.ZoneOffset.UTC) : null;
    local.revision = null;
    storage.local = local;
    d.storage = storage;

    // versioning (best-effort empty)
    d.versioning = null;

    // metadata
    ApiDocument.Metadata md = new ApiDocument.Metadata();
    ApiDocument.FileSystemMetadata fsm = new ApiDocument.FileSystemMetadata();
    if (e.getFileSystemMetadata() != null) {
      fsm.dateModified = e.getFileSystemMetadata().getDateModified() == null ? null : e.getFileSystemMetadata().getDateModified().atOffset(java.time.ZoneOffset.UTC);
      fsm.dateAdded = e.getFileSystemMetadata().getDateAdded() == null ? null : e.getFileSystemMetadata().getDateAdded().atOffset(java.time.ZoneOffset.UTC);
      fsm.mediaFilename = e.getFileSystemMetadata().getMediaFilename();
      fsm.originalFilename = e.getFileSystemMetadata().getOriginalFilename();
      fsm.originalMD5 = e.getFileSystemMetadata().getOriginalMD5();
      fsm.originalFileSize = e.getFileSystemMetadata().getOriginalFileSize() == null ? null : e.getFileSystemMetadata().getOriginalFileSize().intValue();
      fsm.originalMimeType = e.getFileSystemMetadata().getOriginalMimeType();
      fsm.archiveMD5 = e.getFileSystemMetadata().getArchiveMD5();
      fsm.archiveFileSize = e.getFileSystemMetadata().getArchiveFileSize() == null ? null : e.getFileSystemMetadata().getArchiveFileSize().intValue();
    }
    md.fileSystem = fsm;
    md.originalDocument = null;
    md.archivedDocument = null;
    d.metadata = md;

    // audit
    ApiDocument.Audit a = new ApiDocument.Audit();
    a.createdAt = e.getCreatedAt() == null ? null : e.getCreatedAt().atOffset(java.time.ZoneOffset.UTC);
    a.createdBy = e.getCreatedBy();
    a.updatedAt = e.getUpdatedAt() == null ? null : e.getUpdatedAt().atOffset(java.time.ZoneOffset.UTC);
    a.updatedBy = e.getUpdatedBy();
    a.deletedAt = e.getDeletedAt() == null ? null : e.getDeletedAt().atOffset(java.time.ZoneOffset.UTC);
    a.deletedBy = e.getDeletedBy();
    a.isDeleted = Boolean.TRUE.equals(e.getIsDeleted());
    a.version = e.getVersion() == null ? null : e.getVersion().intValue();
    d.audit = a;

    return d;
  }
}


