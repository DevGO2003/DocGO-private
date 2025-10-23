package com.devgo2003.docgo.repository_service.service.event.consumer;

import com.devgo2003.docgo.repository_service.service.event.IFileEventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Map;

/**
 * FileEventConsumer - Kafka Event Consumer Wrapper
 * 
 * Listens to Kafka topic: docgo-file-events
 * Routes events to IFileEventService for processing
 * 
 * Event Types:
 * - FILE_UPLOAD_COMPLETED: Create skeleton
 * - FILE_CONTENT_EXTRACTED: Merge content + AI classification
 * - CONTRACT_SUMMARY_GENERATED: Merge contract (conditional)
 */
@Component
@Slf4j
public class FileEventConsumer {

    private final IFileEventService fileEventService;
    private final ObjectMapper objectMapper;

    @Autowired
    public FileEventConsumer(IFileEventService fileEventService) {
        this.fileEventService = fileEventService;
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
        groupId = "${spring.kafka.consumer.group-id:repository-service-consumer}",
        errorHandler = "kafkaErrorHandler"
    )
    public void handleFileEvent(@Payload String eventJson) {
        try {
            Map<String, Object> payload = objectMapper.readValue(eventJson, Map.class);
            String eventType = asString(payload.get("eventType"));
            String eventId = asString(payload.get("eventId"));
            String correlationId = asString(payload.get("correlationId"));
            String actor = asString(payload.get("actor"));
            
            log.info("📨 Received event: type={}, eventId={}, correlationId={}", eventType, eventId, correlationId);
            
            if (eventType == null || eventId == null) {
                log.warn("⚠️ Event missing required fields (eventType or eventId), skipping");
                return;
            }
            
            // Check idempotency
            if (fileEventService.isEventProcessed(eventId)) {
                log.info("ℹ️ Event already processed: eventId={}", eventId);
                return;
            }
            
            // Route to specific handler
            switch (eventType) {
                case "FILE_UPLOAD_COMPLETED":
                    handleFileUploadCompleted(payload, eventId, correlationId, actor);
                    break;
                    
                case "FILE_CONTENT_EXTRACTED":
                    handleFileContentExtracted(payload, eventId, correlationId, actor);
                    break;
                    
                case "CONTRACT_SUMMARY_GENERATED":
                    handleContractSummaryGenerated(payload, eventId, correlationId, actor);
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
     */
    private void handleFileUploadCompleted(Map<String, Object> payload, String eventId, 
                                          String correlationId, String actor) {
        try {
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
            
            log.info("📝 Creating skeleton for documentId={}", documentId);
            
            fileEventService.processFileUploadCompleted(documentId, payload, correlationId, actor);
            fileEventService.markEventAsProcessed(eventId, "FILE_UPLOAD_COMPLETED", documentId);
            
            log.info("✅ Created skeleton: documentId={}, status=UPLOADED", documentId);
            
        } catch (Exception e) {
            log.error("❌ Error handling FILE_UPLOAD_COMPLETED: {}", e.getMessage(), e);
        }
    }

    /**
     * Event 2: FILE_CONTENT_EXTRACTED
     * Purpose: Add content + AI classification
     */
    private void handleFileContentExtracted(Map<String, Object> payload, String eventId,
                                           String correlationId, String actor) {
        try {
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
            
            log.info("📝 Processing content for documentId={}", documentId);
            
            fileEventService.processFileContentExtracted(documentId, payload, correlationId, actor);
            fileEventService.markEventAsProcessed(eventId, "FILE_CONTENT_EXTRACTED", documentId);
            
            log.info("✅ Updated content: documentId={}, status=PROCESSED", documentId);
            
        } catch (Exception e) {
            log.error("❌ Error handling FILE_CONTENT_EXTRACTED: {}", e.getMessage(), e);
        }
    }

    /**
     * Event 3: CONTRACT_SUMMARY_GENERATED
     * Purpose: Add contract analysis (conditional: only if isContract=true)
     */
    private void handleContractSummaryGenerated(Map<String, Object> payload, String eventId,
                                               String correlationId, String actor) {
        try {
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
            
            log.info("📝 Processing contract for documentId={}", documentId);
            
            fileEventService.processContractSummaryGenerated(documentId, payload, correlationId, actor);
            fileEventService.markEventAsProcessed(eventId, "CONTRACT_SUMMARY_GENERATED", documentId);
            
            log.info("✅ Updated contract: documentId={}", documentId);
            
        } catch (Exception e) {
            log.error("❌ Error handling CONTRACT_SUMMARY_GENERATED: {}", e.getMessage(), e);
        }
    }

    // ==================== UTILITY METHODS ====================

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : null;
    }

    private String asString(Object o) {
        return (o != null) ? String.valueOf(o) : null;
    }
}
