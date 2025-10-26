package com.devgo2003.docgo.repository_service.service.event.impl;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.entity.ProcessedEventEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.repository.ProcessedEventRepository;
import com.devgo2003.docgo.repository_service.service.event.IFileEventService;
import com.devgo2003.docgo.repository_service.service.event.util.DeepMergeUtil;
import com.devgo2003.docgo.repository_service.service.event.util.EventProcessingUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * FileEventServiceImpl - File Event Processing Service Implementation
 * 
 * Handles Kafka events for Event Architecture v3:
 * 1. FILE_UPLOAD_COMPLETED - Create skeleton
 * 2. FILE_CONTENT_EXTRACTED - Merge content + AI classification
 * 3. CONTRACT_SUMMARY_GENERATED - Merge contract (conditional)
 * 
 * Features:
 * - Idempotency check (prevent duplicate processing)
 * - Deep merge for nested data
 * - Error handling and validation
 * - Audit trail creation
 */
@Service
@Slf4j
public class FileEventServiceImpl implements IFileEventService {

    private final FileRepository fileRepository;
    private final ProcessedEventRepository processedEventRepository;

    @Autowired
    public FileEventServiceImpl(FileRepository fileRepository, ProcessedEventRepository processedEventRepository) {
        this.fileRepository = fileRepository;
        this.processedEventRepository = processedEventRepository;
    }

    @Override
    public FileEntity processFileUploadCompleted(String documentId, Map<String, Object> eventData,
                                                  String correlationId, String actor) {
        log.info("Processing FILE_UPLOAD_COMPLETED event for documentId: {}", documentId);
        
        try {
            // Validate event data
            if (!EventProcessingUtil.validateRequiredFields(eventData, "data")) {
                throw new IllegalArgumentException("Missing required field: data");
            }
            
            Map<String, Object> data = EventProcessingUtil.extractEventData(eventData);
            
            // Create new FileEntity skeleton
            FileEntity entity = new FileEntity();
            entity.setId(documentId);
            
            // Set overview section
            Map<String, Object> overview = new HashMap<>();
            overview.put("title", EventProcessingUtil.getStringValue(data, "fileName", "Untitled"));
            overview.put("status", "UPLOADED");
            overview.put("ownerUserId", EventProcessingUtil.getStringValue(data, "ownerUserId", actor));
            overview.put("region", "VN");
            overview.put("priority", "LOW");
            entity.setOverview(overview);
            
            // Set storage section
            Map<String, Object> storage = (Map<String, Object>) data.getOrDefault("storage", new HashMap<>());
            entity.setStorage(storage);
            
            // Set metadata section
            Map<String, Object> metadata = (Map<String, Object>) data.getOrDefault("metadata", new HashMap<>());
            entity.setMetadata(metadata);
            
            // Set audit section
            Map<String, Object> audit = new HashMap<>();
            audit.put("createdAt", Instant.now().toString());
            audit.put("createdBy", actor);
            audit.put("updatedAt", Instant.now().toString());
            audit.put("updatedBy", actor);
            audit.put("version", 1);
            audit.put("isDeleted", false);
            entity.setAudit(audit);
            
            // Save entity
            FileEntity saved = fileRepository.save(entity);
            log.info("Created FileEntity skeleton for documentId: {}", documentId);
            
            return saved;
            
        } catch (Exception e) {
            log.error("Error processing FILE_UPLOAD_COMPLETED event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process FILE_UPLOAD_COMPLETED event", e);
        }
    }

    @Override
    public FileEntity processFileContentExtracted(String documentId, Map<String, Object> eventData,
                                                   String correlationId, String actor) {
        log.info("Processing FILE_CONTENT_EXTRACTED event for documentId: {}", documentId);
        
        try {
            // Get existing entity
            Optional<FileEntity> existing = fileRepository.findById(documentId);
            if (!existing.isPresent()) {
                throw new RuntimeException("FileEntity not found for documentId: " + documentId);
            }
            
            FileEntity entity = existing.get();
            Map<String, Object> data = EventProcessingUtil.extractEventData(eventData);
            
            // Merge content section
            if (data.containsKey("content")) {
                entity.setContent((Map<String, Object>) data.get("content"));
            }
            
            // Deep merge metadata section
            if (data.containsKey("metadata")) {
                Map<String, Object> newMetadata = (Map<String, Object>) data.get("metadata");
                Map<String, Object> existingMetadata = entity.getMetadata();
                if (existingMetadata == null) {
                    existingMetadata = new HashMap<>();
                    entity.setMetadata(existingMetadata);
                }
                DeepMergeUtil.deepMerge(existingMetadata, newMetadata);
            }
            
            // Update overview with AI classification
            Map<String, Object> overview = entity.getOverview();
            if (overview == null) {
                overview = new HashMap<>();
                entity.setOverview(overview);
            }
            
            // Extract classification from content
            Map<String, Object> content = entity.getContent();
            if (content != null && content.containsKey("classification")) {
                Map<String, Object> classification = (Map<String, Object>) content.get("classification");
                overview.put("documentType", classification.getOrDefault("documentType", overview.get("documentType")));
                overview.put("category", classification.getOrDefault("category", overview.get("category")));
                overview.put("language", classification.getOrDefault("language", overview.get("language")));
            }
            
            // Update status
            overview.put("status", "PROCESSED");
            
            // Update audit
            Map<String, Object> audit = entity.getAudit();
            if (audit == null) {
                audit = new HashMap<>();
                entity.setAudit(audit);
            }
            audit.put("updatedAt", Instant.now().toString());
            audit.put("updatedBy", actor);
            
            // Save entity
            FileEntity saved = fileRepository.save(entity);
            log.info("Updated FileEntity with content for documentId: {}", documentId);
            
            return saved;
            
        } catch (Exception e) {
            log.error("Error processing FILE_CONTENT_EXTRACTED event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process FILE_CONTENT_EXTRACTED event", e);
        }
    }

    @Override
    public FileEntity processContractSummaryGenerated(String documentId, Map<String, Object> eventData,
                                                       String correlationId, String actor) {
        log.info("Processing CONTRACT_SUMMARY_GENERATED event for documentId: {}", documentId);
        
        try {
            // Get existing entity
            Optional<FileEntity> existing = fileRepository.findById(documentId);
            if (!existing.isPresent()) {
                throw new RuntimeException("FileEntity not found for documentId: " + documentId);
            }
            
            FileEntity entity = existing.get();
            Map<String, Object> data = (Map<String, Object>) eventData.get("data");
            if (data == null) {
                throw new IllegalArgumentException("Event data is null");
            }
            
            // Map contract analysis data (data is the contract metadata directly, not wrapped in contractAnalysis)
            Map<String, Object> contractAnalysis = data;
            if (contractAnalysis != null) {
                Map<String, Object> entityContract = entity.getContract();
                if (entityContract == null) {
                    entityContract = new HashMap<>();
                    entity.setContract(entityContract);
                }
                
                // Map basic contract info
                entityContract.put("type", asString(contractAnalysis.get("type")));
                entityContract.put("effectiveDate", asString(contractAnalysis.get("effectiveDate")));
                entityContract.put("expiryDate", asString(contractAnalysis.get("expiryDate")));
                entityContract.put("totalValue", contractAnalysis.get("totalValue"));
                entityContract.put("currency", asString(contractAnalysis.get("currency")));
                entityContract.put("summary", asString(contractAnalysis.get("summary")));
                entityContract.put("project", asString(contractAnalysis.get("project")));
                entityContract.put("department", asString(contractAnalysis.get("department")));
                entityContract.put("priority", asString(contractAnalysis.get("priority")));
                entityContract.put("confidentiality", asString(contractAnalysis.get("confidentiality")));
                entityContract.put("repositoryId", asString(contractAnalysis.get("repositoryId")));
                
                // Map parties
                List<Map<String, Object>> parties = (List<Map<String, Object>>) contractAnalysis.get("parties");
                if (parties != null) {
                    entityContract.put("parties", parties);
                }
                
                // Map payment information
                Map<String, Object> payment = (Map<String, Object>) contractAnalysis.get("payment");
                if (payment != null) {
                    Map<String, Object> paymentSection = (Map<String, Object>) entityContract.computeIfAbsent("payment", k -> new HashMap<>());
                    paymentSection.put("method", asString(payment.get("method")));
                    paymentSection.put("amount", asDouble(payment.get("amount")));
                    paymentSection.put("currency", asString(payment.get("currency")));
                    
                    List<Map<String, Object>> schedule = (List<Map<String, Object>>) payment.get("schedule");
                    if (schedule != null) {
                        paymentSection.put("schedule", schedule);
                    }
                }
                
                // Map risk information
                Map<String, Object> risk = (Map<String, Object>) contractAnalysis.get("risk");
                if (risk != null) {
                    Map<String, Object> riskSection = (Map<String, Object>) entityContract.computeIfAbsent("risk", k -> new HashMap<>());
                    riskSection.put("level", asString(risk.get("level")));
                    
                    List<Map<String, Object>> factors = (List<Map<String, Object>>) risk.get("factors");
                    if (factors != null) {
                        riskSection.put("factors", factors);
                    }
                }
                
                // Map compliance information
                Map<String, Object> compliance = (Map<String, Object>) contractAnalysis.get("compliance");
                if (compliance != null) {
                    Map<String, Object> complianceSection = (Map<String, Object>) entityContract.computeIfAbsent("compliance", k -> new HashMap<>());
                    complianceSection.put("status", asString(compliance.get("status")));
                    complianceSection.put("requirements", compliance.get("requirements"));
                    complianceSection.put("deadlines", compliance.get("deadlines"));
                }
                
                // Map clauses (key, favorable, unfavorable, all, and other clause types)
                Map<String, Object> clauses = (Map<String, Object>) contractAnalysis.get("clauses");
                if (clauses != null) {
                    Map<String, Object> clausesSection = (Map<String, Object>) entityContract.computeIfAbsent("clauses", k -> new HashMap<>());
                    
                    // Map key clauses
                    List<Map<String, Object>> keyClauses = (List<Map<String, Object>>) clauses.get("key");
                    if (keyClauses != null) {
                        clausesSection.put("key", keyClauses);
                    }
                    
                    // Map favorable clauses
                    List<Map<String, Object>> favorableClauses = (List<Map<String, Object>>) clauses.get("favorable");
                    if (favorableClauses != null) {
                        clausesSection.put("favorable", favorableClauses);
                    }
                    
                    // Map unfavorable clauses
                    List<Map<String, Object>> unfavorableClauses = (List<Map<String, Object>>) clauses.get("unfavorable");
                    if (unfavorableClauses != null) {
                        clausesSection.put("unfavorable", unfavorableClauses);
                    }
                    
                    // Map all clauses
                    List<Map<String, Object>> allClauses = (List<Map<String, Object>>) clauses.get("all");
                    if (allClauses != null) {
                        clausesSection.put("all", allClauses);
                    }
                    
                    // Map other clause types (intellectualProperty, confidentiality, warranty, termination)
                    if (clauses.get("intellectualProperty") != null) {
                        clausesSection.put("intellectualProperty", clauses.get("intellectualProperty"));
                    }
                    if (clauses.get("confidentiality") != null) {
                        clausesSection.put("confidentiality", clauses.get("confidentiality"));
                    }
                    if (clauses.get("warranty") != null) {
                        clausesSection.put("warranty", clauses.get("warranty"));
                    }
                    if (clauses.get("termination") != null) {
                        clausesSection.put("termination", clauses.get("termination"));
                    }
                }
                
                // Map reminders
                List<Map<String, Object>> reminders = (List<Map<String, Object>>) contractAnalysis.get("reminders");
                if (reminders != null) {
                    entityContract.put("reminders", reminders);
                }
                
                // Map summary
                String summary = asString(contractAnalysis.get("summary"));
                if (summary != null) {
                    entityContract.put("summary", summary);
                }
                
                // Map confidence
                Double confidence = asDouble(contractAnalysis.get("confidence"));
                if (confidence != null) {
                    entityContract.put("confidence", confidence);
                }
            }
            
            // Update overview.documentType if not already set
            Map<String, Object> overview = entity.getOverview();
            if (overview == null) {
                overview = new HashMap<>();
                entity.setOverview(overview);
            }
            overview.put("documentType", "CONTRACT");
            overview.put("isContract", true);
            
            // Update audit
            Map<String, Object> audit = entity.getAudit();
            if (audit == null) {
                audit = new HashMap<>();
                entity.setAudit(audit);
            }
            audit.put("updatedAt", Instant.now().toString());
            audit.put("updatedBy", actor);
            
            // Save entity
            FileEntity saved = fileRepository.save(entity);
            log.info("Updated FileEntity with contract for documentId: {}", documentId);
            
            return saved;
            
        } catch (Exception e) {
            log.error("Error processing CONTRACT_SUMMARY_GENERATED event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process CONTRACT_SUMMARY_GENERATED event", e);
        }
    }

    @Override
    public boolean isEventProcessed(String eventId) {
        return processedEventRepository.existsById(eventId);
    }

    @Override
    public void markEventAsProcessed(String eventId, String eventType, String documentId) {
        ProcessedEventEntity processed = new ProcessedEventEntity(eventId, eventType, documentId);
        processedEventRepository.save(processed);
        log.debug("Marked event as processed - eventId: {}, eventType: {}", eventId, eventType);
    }
    
    @Override
    public FileEntity processFileMetadataRecorded(String fileId, Map<String, Object> eventData, 
                                                 String correlationId, String actor) {
        try {
            log.info("Processing FILE_UPLOAD_COMPLETED for fileId: {}", fileId);
            
            // Extract data from event
            Map<String, Object> data = (Map<String, Object>) eventData.get("data");
            if (data == null) {
                throw new IllegalArgumentException("Event data is null");
            }
            
            // Create or update FileEntity
            FileEntity entity = fileRepository.findById(fileId).orElse(new FileEntity());
            entity.setId(fileId);
            
            // Map basic file information
            entity.setName(asString(data.get("name")));
            entity.setContentType(asString(data.get("contentType")));
            entity.setSize(asLong(data.get("size")));
            entity.setOwnerUserId(asString(data.get("ownerUserId")));
            
            // Map file information
            Map<String, Object> fileInfo = (Map<String, Object>) data.get("file");
            if (fileInfo != null) {
                entity.setFileUrl(asString(fileInfo.get("name")));
                
                // Map hash information
                Map<String, Object> hash = (Map<String, Object>) fileInfo.get("hash");
                if (hash != null) {
                    entity.setMd5Hash(asString(hash.get("md5")));
                    entity.setSha256Hash(asString(hash.get("sha256")));
                }
                
                // Map permissions
                Map<String, Object> permissions = (Map<String, Object>) fileInfo.get("permissions");
                if (permissions != null) {
                    Map<String, Object> entitySecurity = entity.getSecurity();
                    if (entitySecurity == null) {
                        entitySecurity = new HashMap<>();
                        entity.setSecurity(entitySecurity);
                    }
                    
                    Map<String, Object> permissionsSection = (Map<String, Object>) entitySecurity.computeIfAbsent("permissions", k -> new HashMap<>());
                    permissionsSection.put("read", permissions.get("read"));
                    permissionsSection.put("write", permissions.get("write"));
                    permissionsSection.put("delete", permissions.get("delete"));
                    permissionsSection.put("share", permissions.get("share"));
                }
                
                // Map security settings
                Map<String, Object> security = (Map<String, Object>) fileInfo.get("security");
                if (security != null) {
                    Map<String, Object> entitySecurity = entity.getSecurity();
                    if (entitySecurity == null) {
                        entitySecurity = new HashMap<>();
                        entity.setSecurity(entitySecurity);
                    }
                    
                    entitySecurity.put("encryption", asString(security.get("encryption")));
                    entitySecurity.put("watermark", asBoolean(security.get("watermark")));
                    entitySecurity.put("digitalSignature", asBoolean(security.get("digitalSignature")));
                    entitySecurity.put("accessLogging", asBoolean(security.get("accessLogging")));
                }
                
                // Map versioning
                Object version = fileInfo.get("version");
                if (version != null) {
                    Map<String, Object> entityVersioning = entity.getVersioning();
                    if (entityVersioning == null) {
                        entityVersioning = new HashMap<>();
                        entity.setVersioning(entityVersioning);
                    }
                    
                    entityVersioning.put("version", asInteger(version));
                }
            }
            
            // Map storage information
            Map<String, Object> storage = (Map<String, Object>) data.get("storage");
            if (storage != null) {
                
                // Map complete storage information
                Map<String, Object> entityStorage = entity.getStorage();
                if (entityStorage == null) {
                    entityStorage = new HashMap<>();
                    entity.setStorage(entityStorage);
                }
                
                entityStorage.put("type", asString(storage.get("type")));
                
                // Map S3 information
                Map<String, Object> s3 = (Map<String, Object>) storage.get("s3");
                if (s3 != null) {
                    Map<String, Object> s3Section = (Map<String, Object>) entityStorage.computeIfAbsent("s3", k -> new HashMap<>());
                    s3Section.put("url", asString(s3.get("url")));
                    s3Section.put("bucket", asString(s3.get("bucket")));
                    s3Section.put("objectKey", asString(s3.get("objectKey")));
                    s3Section.put("region", asString(s3.get("region")));
                    s3Section.put("contentType", asString(s3.get("contentType")));
                    s3Section.put("size", asLong(s3.get("size")));
                    s3Section.put("versionId", asString(s3.get("versionId")));
                    
                    Map<String, Object> checksum = (Map<String, Object>) s3.get("checksum");
                    if (checksum != null) {
                        Map<String, Object> checksumSection = (Map<String, Object>) s3Section.computeIfAbsent("checksum", k -> new HashMap<>());
                        checksumSection.put("originalMD5", asString(checksum.get("originalMD5")));
                        checksumSection.put("archiveMD5", asString(checksum.get("archiveMD5")));
                    }
                }
                
                // Map local storage information
                Map<String, Object> local = (Map<String, Object>) storage.get("local");
                if (local != null) {
                    Map<String, Object> localSection = (Map<String, Object>) entityStorage.computeIfAbsent("local", k -> new HashMap<>());
                    localSection.put("path", asString(local.get("path")));
                    localSection.put("filename", asString(local.get("filename")));
                    localSection.put("mimeType", asString(local.get("mimeType")));
                    localSection.put("size", asLong(local.get("size")));
                    localSection.put("mtime", asString(local.get("mtime")));
                    localSection.put("revision", asString(local.get("revision")));
                }
            }
            
            // Map metadata
            Map<String, Object> metadata = (Map<String, Object>) data.get("metadata");
            if (metadata != null) {
                Map<String, Object> fileSystem = (Map<String, Object>) metadata.get("fileSystem");
                if (fileSystem != null) {
                    entity.setDateModified(asString(fileSystem.get("dateModified")));
                    entity.setDateAdded(asString(fileSystem.get("dateAdded")));
                    
                    // Map fileSystem metadata to entity.metadata.fileSystem
                    Map<String, Object> entityMetadata = entity.getMetadata();
                    if (entityMetadata == null) {
                        entityMetadata = new HashMap<>();
                        entity.setMetadata(entityMetadata);
                    }
                    
                    Map<String, Object> fileSystemSection = (Map<String, Object>) entityMetadata.computeIfAbsent("fileSystem", k -> new HashMap<>());
                    fileSystemSection.put("mediaFilename", asString(fileSystem.get("mediaFilename")));
                    fileSystemSection.put("originalFilename", asString(fileSystem.get("originalFilename")));
                    fileSystemSection.put("originalMD5", asString(fileSystem.get("originalMD5")));
                    fileSystemSection.put("originalFileSize", asLong(fileSystem.get("originalFileSize")));
                    fileSystemSection.put("originalMimeType", asString(fileSystem.get("originalMimeType")));
                    fileSystemSection.put("archiveMD5", asString(fileSystem.get("archiveMD5")));
                    fileSystemSection.put("archiveFileSize", asLong(fileSystem.get("archiveFileSize")));
                }
                
                Map<String, Object> technical = (Map<String, Object>) metadata.get("technical");
                if (technical != null) {
                    entity.setWordCount(asInteger(technical.get("wordCount")));
                    entity.setCharacterCount(asInteger(technical.get("characterCount")));
                    
                    // Map additional technical metadata
                    Map<String, Object> entityMetadata = entity.getMetadata();
                    if (entityMetadata == null) {
                        entityMetadata = new HashMap<>();
                        entity.setMetadata(entityMetadata);
                    }
                    
                    Map<String, Object> technicalSection = (Map<String, Object>) entityMetadata.computeIfAbsent("technical", k -> new HashMap<>());
                    technicalSection.put("encoding", asString(technical.get("encoding")));
                    technicalSection.put("lineEnding", asString(technical.get("lineEnding")));
                    technicalSection.put("bom", asBoolean(technical.get("bom")));
                    technicalSection.put("compression", asString(technical.get("compression")));
                    technicalSection.put("pages", asInteger(technical.get("pages")));
                }
            }
            
            // Set audit information
            Map<String, Object> audit = new HashMap<>();
            audit.put("createdAt", Instant.now().toString());
            audit.put("createdBy", actor);
            audit.put("correlationId", correlationId);
            
            // Extract event metadata (serviceVersion, region)
            Map<String, Object> eventMetadata = (Map<String, Object>) eventData.get("metadata");
            if (eventMetadata != null) {
                audit.put("serviceVersion", asString(eventMetadata.get("serviceVersion")));
                audit.put("region", asString(eventMetadata.get("region")));
            }
            
            entity.setAudit(audit);
            
            // Save entity
            FileEntity saved = fileRepository.save(entity);
            log.info("Created/Updated FileEntity with metadata for fileId: {}", fileId);
            
            return saved;
            
        } catch (Exception e) {
            log.error("Error processing FILE_UPLOAD_COMPLETED event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process FILE_UPLOAD_COMPLETED event", e);
        }
    }
    
    @Override
    public FileEntity processFilePlaintextExtracted(String fileId, Map<String, Object> eventData,
                                                   String correlationId, String actor) {
        try {
            log.info("Processing FILE_CONTENT_EXTRACTED for fileId: {}", fileId);
            
            // Extract data from event
            Map<String, Object> data = (Map<String, Object>) eventData.get("data");
            if (data == null) {
                throw new IllegalArgumentException("Event data is null");
            }
            
            // Find existing entity
            FileEntity entity = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("FileEntity not found for fileId: " + fileId));
            
            // Map content information
            entity.setPlaintext(asString(data.get("plaintext")));
            entity.setExtractedText(asString(data.get("extractedText")));
            entity.setSummary(asString(data.get("summary")));
            
            // Map title and JSON content
            String title = asString(data.get("title"));
            if (title != null) {
                Map<String, Object> overview = entity.getOverview();
                if (overview == null) {
                    overview = new HashMap<>();
                    entity.setOverview(overview);
                }
                overview.put("title", title);
            }
            
            Map<String, Object> jsonContent = (Map<String, Object>) data.get("jsonContent");
            if (jsonContent != null) {
                Map<String, Object> entityContent = entity.getContent();
                if (entityContent == null) {
                    entityContent = new HashMap<>();
                    entity.setContent(entityContent);
                }
                entityContent.put("jsonContent", jsonContent);
            }
            
            // Map key terms
            List<String> keyTerms = (List<String>) data.get("keyTerms");
            if (keyTerms != null) {
                entity.setKeyTerms(keyTerms);
            }
            
            // Map classification
            Map<String, Object> classification = (Map<String, Object>) data.get("classification");
            if (classification != null) {
                entity.setDocumentType(asString(classification.get("documentType")));
                entity.setIsContract(asBoolean(classification.get("isContract")));
                entity.setConfidence(asDouble(classification.get("confidence")));
                entity.setLanguage(asString(classification.get("language")));
                
                List<String> reasons = (List<String>) classification.get("reasons");
                if (reasons != null) {
                    entity.setReasons(reasons);
                }
            }
            
            // Map OCR information
            Map<String, Object> ocr = (Map<String, Object>) data.get("ocr");
            if (ocr != null) {
                entity.setOcrStatus(asString(ocr.get("status")));
                entity.setOcrEngine(asString(ocr.get("engine")));
                entity.setOcrConfidence(asDouble(ocr.get("confidence")));
                
                // Map additional OCR metadata
                Map<String, Object> entityContent = entity.getContent();
                if (entityContent == null) {
                    entityContent = new HashMap<>();
                    entity.setContent(entityContent);
                }
                
                Map<String, Object> ocrSection = (Map<String, Object>) entityContent.computeIfAbsent("ocr", k -> new HashMap<>());
                ocrSection.put("text", asString(ocr.get("text")));
                ocrSection.put("status", asString(ocr.get("status")));
                ocrSection.put("engine", asString(ocr.get("engine")));
                ocrSection.put("confidence", asDouble(ocr.get("confidence")));
                ocrSection.put("processedAt", asString(ocr.get("processedAt")));
                ocrSection.put("processingTime", asDouble(ocr.get("processingTime")));
                ocrSection.put("error", asString(ocr.get("error")));
                
                // Map OCR metadata
                Map<String, Object> ocrMetadata = (Map<String, Object>) ocr.get("metadata");
                if (ocrMetadata != null) {
                    Map<String, Object> metadataSection = (Map<String, Object>) ocrSection.computeIfAbsent("metadata", k -> new HashMap<>());
                    metadataSection.put("language", asString(ocrMetadata.get("language")));
                    metadataSection.put("pageCount", asInteger(ocrMetadata.get("pageCount")));
                    metadataSection.put("boxCount", asInteger(ocrMetadata.get("boxCount")));
                    metadataSection.put("averageConfidence", asDouble(ocrMetadata.get("averageConfidence")));
                }
            }
            
            // Map sections
            List<Map<String, Object>> sections = (List<Map<String, Object>>) data.get("sections");
            if (sections != null && !sections.isEmpty()) {
                Map<String, Object> entityContent = entity.getContent();
                if (entityContent == null) {
                    entityContent = new HashMap<>();
                    entity.setContent(entityContent);
                }
                
                entityContent.put("sections", sections);
            }
            
            // Map jsonAnalysisStatus
            String jsonAnalysisStatus = asString(data.get("jsonAnalysisStatus"));
            if (jsonAnalysisStatus != null) {
                Map<String, Object> entityContent = entity.getContent();
                if (entityContent == null) {
                    entityContent = new HashMap<>();
                    entity.setContent(entityContent);
                }
                entityContent.put("jsonAnalysisStatus", jsonAnalysisStatus);
            }
            
            // Map processing information
            Map<String, Object> processing = (Map<String, Object>) data.get("processing");
            if (processing != null) {
                Map<String, Object> entityContent = entity.getContent();
                if (entityContent == null) {
                    entityContent = new HashMap<>();
                    entity.setContent(entityContent);
                }
                entityContent.put("processing", processing);
            }
            
            // Update audit
            Map<String, Object> audit = entity.getAudit();
            if (audit == null) {
                audit = new HashMap<>();
                entity.setAudit(audit);
            }
            audit.put("updatedAt", Instant.now().toString());
            audit.put("updatedBy", actor);
            
            // Extract event metadata (serviceVersion, region) từ eventData
            Map<String, Object> eventMetadata = (Map<String, Object>) eventData.get("metadata");
            if (eventMetadata != null) {
                audit.put("serviceVersion", asString(eventMetadata.get("serviceVersion")));
                audit.put("region", asString(eventMetadata.get("region")));
            }
            
            // Save entity
            FileEntity saved = fileRepository.save(entity);
            log.info("Updated FileEntity with content for fileId: {}", fileId);
            
            return saved;
            
        } catch (Exception e) {
            log.error("Error processing FILE_CONTENT_EXTRACTED event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process FILE_CONTENT_EXTRACTED event", e);
        }
    }
    
    // Utility methods
    private String asString(Object o) {
        return (o != null) ? String.valueOf(o) : null;
    }
    
    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).longValue();
        try {
            return Long.parseLong(String.valueOf(o));
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Integer asInteger(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).intValue();
        try {
            return Integer.parseInt(String.valueOf(o));
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Double asDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number) return ((Number) o).doubleValue();
        try {
            return Double.parseDouble(String.valueOf(o));
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Boolean asBoolean(Object o) {
        if (o == null) return null;
        if (o instanceof Boolean) return (Boolean) o;
        return Boolean.parseBoolean(String.valueOf(o));
    }
}
