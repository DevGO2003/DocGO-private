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
            Map<String, Object> data = EventProcessingUtil.extractEventData(eventData);
            
            // Merge contract section
            if (data.containsKey("contract")) {
                entity.setContract((Map<String, Object>) data.get("contract"));
            }
            
            // Update overview.documentType if not already set
            Map<String, Object> overview = entity.getOverview();
            if (overview == null) {
                overview = new HashMap<>();
                entity.setOverview(overview);
            }
            overview.put("documentType", "CONTRACT");
            
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
}
