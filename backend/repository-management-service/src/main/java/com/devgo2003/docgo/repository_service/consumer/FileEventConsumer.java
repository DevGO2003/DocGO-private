package com.devgo2003.docgo.repository_service.consumer;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.entity.ProcessedEventEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.repository.ProcessedEventRepository;
import com.devgo2003.docgo.repository_service.util.DeepMergeUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;

/**
 * FileEventConsumer v3 - Event Architecture v3
 * 
 * Single topic listener with event type routing
 * Topic: docgo-file-events
 * 
 * Event Types:
 * - FILE_UPLOAD_COMPLETED: Create skeleton with defaults
 * - FILE_CONTENT_EXTRACTED: Deep merge content section
 * - CONTRACT_SUMMARY_GENERATED: Deep merge contract section
 */
@Component
@Slf4j
public class FileEventConsumer {

    private final FileRepository fileRepository;
    private final ProcessedEventRepository processedEventRepository;
    private final ObjectMapper objectMapper;

    @Autowired
    public FileEventConsumer(
        FileRepository fileRepository,
        ProcessedEventRepository processedEventRepository
    ) {
        this.fileRepository = fileRepository;
        this.processedEventRepository = processedEventRepository;
        this.objectMapper = new ObjectMapper();
    }
    
    @PostConstruct
    public void init() {
        log.info("✅ FileEventConsumer initialized - Event Architecture v3");
        log.info("📡 Listening on topic: docgo-file-events");
        log.info("📋 Supported events: FILE_UPLOAD_COMPLETED, FILE_CONTENT_EXTRACTED, CONTRACT_SUMMARY_GENERATED");
    }

    /**
     * Single Kafka listener for all file events
     * Routes to specific handler based on eventType
     */
    @KafkaListener(
        topics = "docgo-file-events",
        groupId = "${spring.kafka.consumer.group-id}",
        errorHandler = "kafkaErrorHandler"
    )
    public void handleFileEvent(@Payload String eventJson) {
        try {
            Map<String, Object> payload = objectMapper.readValue(eventJson, Map.class);
            String eventType = asString(payload.get("eventType"));
            String eventId = asString(payload.get("eventId"));
            
            log.info("📨 Received event: type={}, eventId={}", eventType, eventId);
            
            if (eventType == null) {
                log.warn("⚠️ Event missing eventType field, skipping");
                return;
            }
            
            // Route to specific handler
            switch (eventType) {
                case "FILE_UPLOAD_COMPLETED":
                    handleFileUploadCompleted(payload);
                    break;
                    
                case "FILE_CONTENT_EXTRACTED":
                    handleFileContentExtracted(payload);
                    break;
                    
                case "CONTRACT_SUMMARY_GENERATED":
                    handleContractSummaryGenerated(payload);
                    break;
                    
                default:
                    log.warn("⚠️ Unknown event type: {}", eventType);
            }
            
        } catch (Exception e) {
            log.error("❌ Error processing event: {}", e.getMessage(), e);
        }
    }

    /**
     * Event 1: FILE_UPLOAD_COMPLETED
     * Purpose: Create document skeleton with basic metadata
     * Requirement: MUST be first - creates the document
     */
    private void handleFileUploadCompleted(Map<String, Object> payload) {
        try {
            String eventId = asString(payload.get("eventId"));
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) {
                log.warn("⚠️ Event data is null");
                return;
            }
            
            String documentId = asString(data.get("documentId"));
            if (documentId == null) {
                log.warn("⚠️ Missing documentId");
                return;
            }
            
            // ✅ Idempotency check
            if (processedEventRepository.existsById(eventId)) {
                log.info("ℹ️ Event already processed: eventId={}, documentId={}", eventId, documentId);
                return;
            }
            
            // Check if document already exists (secondary check)
            if (fileRepository.existsById(documentId)) {
                log.warn("⚠️ Document already exists but event not marked: documentId={}", documentId);
                // Mark event as processed and return
                processedEventRepository.save(new ProcessedEventEntity(eventId, "FILE_UPLOAD_COMPLETED", documentId));
                return;
            }
            
            log.info("📝 Creating skeleton for documentId={}", documentId);
            
            FileEntity entity = new FileEntity();
            entity.setId(documentId);
            
            // === OVERVIEW SECTION ===
            Map<String, Object> overview = entity.getOverview();
            overview.put("title", asString(data.get("fileName")));
            overview.put("status", "UPLOADED");  // ✅ Uppercase
            overview.put("ownerUserId", asString(data.get("ownerUserId")));
            overview.put("region", "VN");  // ✅ Default
            overview.put("priority", "LOW");  // ✅ Default
            overview.put("isNew", true);
            
            // === STORAGE SECTION ===
            Map<String, Object> storage = asMap(data.get("storage"));
            if (storage != null) {
                DeepMergeUtil.deepMerge(entity.getStorage(), storage);
            }
            
            // === METADATA SECTION ===
            Map<String, Object> metadata = asMap(data.get("metadata"));
            if (metadata != null) {
                DeepMergeUtil.deepMerge(entity.getMetadata(), metadata);
            }
            
            // === AUDIT SECTION ===
            String actor = asString(payload.get("actor"));
            String actorUserId = extractUserId(actor);
            LocalDateTime timestamp = parseTimestamp(asString(payload.get("timestamp")));
            
            Map<String, Object> audit = entity.getAudit();
            audit.put("createdAt", timestamp != null ? timestamp.toString() : LocalDateTime.now().toString());
            audit.put("createdBy", actorUserId);
            audit.put("updatedAt", timestamp != null ? timestamp.toString() : LocalDateTime.now().toString());
            audit.put("updatedBy", actorUserId);
            audit.put("isDeleted", false);
            
            fileRepository.save(entity);
            
            // ✅ Mark event as processed
            processedEventRepository.save(new ProcessedEventEntity(eventId, "FILE_UPLOAD_COMPLETED", documentId));
            
            log.info("✅ Created skeleton: documentId={}, status=UPLOADED", documentId);
            
        } catch (Exception e) {
            log.error("❌ Error handling FILE_UPLOAD_COMPLETED: {}", e.getMessage(), e);
        }
    }

    /**
     * Event 2: FILE_CONTENT_EXTRACTED
     * Purpose: Add content + AI classification
     * Timing: 1-10s after Event 1
     */
    private void handleFileContentExtracted(Map<String, Object> payload) {
        try {
            String eventId = asString(payload.get("eventId"));
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) {
                log.warn("⚠️ Event data is null");
                return;
            }
            
            String documentId = asString(data.get("documentId"));
            if (documentId == null) {
                log.warn("⚠️ Missing documentId");
                return;
            }
            
            // ✅ Idempotency check
            if (processedEventRepository.existsById(eventId)) {
                log.info("ℹ️ Event already processed: eventId={}, documentId={}", eventId, documentId);
                return;
            }
            
            log.info("📝 Processing content for documentId={}", documentId);
            
            // Get existing entity (throw if not found)
            FileEntity entity = fileRepository.findById(documentId)
                .orElseThrow(() -> new IllegalStateException(
                    "Event ordering error: Event 1 not received for documentId=" + documentId
                ));
            
            // === CONTENT SECTION - Deep merge ===
            Map<String, Object> content = asMap(data.get("content"));
            if (content != null) {
                DeepMergeUtil.deepMerge(entity.getContent(), content);
                
                // Extract classification for overview
                Map<String, Object> classification = asMap(content.get("classification"));
                if (classification != null) {
                    Map<String, Object> overview = entity.getOverview();
                    overview.put("documentType", asString(classification.get("documentType")));
                    overview.put("category", asString(classification.get("category")));
                    overview.put("language", asString(classification.get("language")));
                    overview.put("status", "PROCESSED");  // ✅ Update status
                }
            }
            
            // === METADATA SECTION - Deep merge technical & originalDocument ===
            Map<String, Object> metadata = asMap(data.get("metadata"));
            if (metadata != null) {
                DeepMergeUtil.deepMerge(entity.getMetadata(), metadata);
            }
            
            // === AUDIT SECTION - Update timestamp ===
            String actor = asString(payload.get("actor"));
            String actorUserId = extractUserId(actor);
            LocalDateTime timestamp = parseTimestamp(asString(payload.get("timestamp")));
            
            Map<String, Object> audit = entity.getAudit();
            audit.put("updatedAt", timestamp != null ? timestamp.toString() : LocalDateTime.now().toString());
            audit.put("updatedBy", actorUserId != null ? actorUserId : "system");
            
            fileRepository.save(entity);
            
            // ✅ Mark event as processed
            processedEventRepository.save(new ProcessedEventEntity(eventId, "FILE_CONTENT_EXTRACTED", documentId));
            
            log.info("✅ Updated content: documentId={}, status=PROCESSED", documentId);
            
        } catch (IllegalStateException e) {
            log.error("❌ Event ordering error: {}", e.getMessage());
            throw e;  // Rethrow để Kafka retry
        } catch (Exception e) {
            log.error("❌ Error handling FILE_CONTENT_EXTRACTED: {}", e.getMessage(), e);
        }
    }

    /**
     * Event 3: CONTRACT_SUMMARY_GENERATED
     * Purpose: Add contract analysis (conditional: only if isContract=true)
     * Timing: 10-30s after Event 1
     */
    private void handleContractSummaryGenerated(Map<String, Object> payload) {
        try {
            String eventId = asString(payload.get("eventId"));
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) {
                log.warn("⚠️ Event data is null");
                return;
            }
            
            String documentId = asString(data.get("documentId"));
            if (documentId == null) {
                log.warn("⚠️ Missing documentId");
                return;
            }
            
            // ✅ Idempotency check
            if (processedEventRepository.existsById(eventId)) {
                log.info("ℹ️ Event already processed: eventId={}, documentId={}", eventId, documentId);
                return;
            }
            
            log.info("📝 Processing contract for documentId={}", documentId);
            
            // Get existing entity (throw if not found)
            FileEntity entity = fileRepository.findById(documentId)
                .orElseThrow(() -> new IllegalStateException(
                    "Event ordering error: Event 1 not received for documentId=" + documentId
                ));
            
            // === CONTRACT SECTION - Deep merge ===
            Map<String, Object> contract = asMap(data.get("contract"));
            if (contract != null) {
                DeepMergeUtil.deepMerge(entity.getContract(), contract);
            }
            
            // === AUDIT SECTION - Update timestamp ===
            String actor = asString(payload.get("actor"));
            String actorUserId = extractUserId(actor);
            LocalDateTime timestamp = parseTimestamp(asString(payload.get("timestamp")));
            
            Map<String, Object> audit = entity.getAudit();
            audit.put("updatedAt", timestamp != null ? timestamp.toString() : LocalDateTime.now().toString());
            audit.put("updatedBy", actorUserId != null ? actorUserId : "system");
            
            fileRepository.save(entity);
            
            // ✅ Mark event as processed
            processedEventRepository.save(new ProcessedEventEntity(eventId, "CONTRACT_SUMMARY_GENERATED", documentId));
            
            log.info("✅ Updated contract: documentId={}", documentId);
            
        } catch (IllegalStateException e) {
            log.error("❌ Event ordering error: {}", e.getMessage());
            throw e;  // Rethrow để Kafka retry
        } catch (Exception e) {
            log.error("❌ Error handling CONTRACT_SUMMARY_GENERATED: {}", e.getMessage(), e);
        }
    }

    // ==================== UTILITY METHODS ====================

    /**
     * Extract userId from actor string
     * Format: "user:12345" → "12345"
     */
    private String extractUserId(String actor) {
        if (actor == null) return null;
        if (actor.startsWith("user:")) {
            return actor.substring(5);  // Remove "user:" prefix
        }
        return actor;
    }

    /**
     * Parse ISO 8601 timestamp to LocalDateTime
     */
    private LocalDateTime parseTimestamp(String timestamp) {
        if (timestamp == null || timestamp.isEmpty()) return null;
        try {
            return OffsetDateTime.parse(timestamp).toLocalDateTime();
        } catch (Exception e) {
            log.warn("⚠️ Failed to parse timestamp: {}", timestamp);
            return null;
        }
    }

    // Type conversion utilities
    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : null;
    }

    private String asString(Object o) {
        return (o != null) ? String.valueOf(o) : null;
    }
}
