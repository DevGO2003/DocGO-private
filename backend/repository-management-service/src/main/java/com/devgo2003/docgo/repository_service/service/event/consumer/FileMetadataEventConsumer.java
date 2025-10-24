package com.devgo2003.docgo.repository_service.service.event.consumer;

import com.devgo2003.docgo.repository_service.service.event.IFileEventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.util.Map;

/**
 * FileMetadataEventConsumer - Kafka Event Consumer for file.metadata.recorded
 * 
 * Listens to Kafka topic: file.metadata.recorded
 * Processes file metadata events from automation service
 */
@Component
@Slf4j
public class FileMetadataEventConsumer {

    private final IFileEventService fileEventService;
    private final ObjectMapper objectMapper;

    @Value("${app.kafka.topic.file-metadata-recorded:file.metadata.recorded}")
    private String topicName;

    @Autowired
    public FileMetadataEventConsumer(IFileEventService fileEventService) {
        this.fileEventService = fileEventService;
        this.objectMapper = new ObjectMapper();
    }
    
    @PostConstruct
    public void init() {
        log.info("✅ FileMetadataEventConsumer initialized");
        log.info("📡 Listening on topic: {}", topicName);
    }

    @KafkaListener(
        topics = "${app.kafka.topic.file-metadata-recorded:file.metadata.recorded}",
        groupId = "${spring.kafka.consumer.group-id:repository-service-consumer}",
        errorHandler = "kafkaErrorHandler"
    )
    public void handleFileMetadataRecorded(@Payload String eventJson) {
        try {
            Map<String, Object> payload = objectMapper.readValue(eventJson, Map.class);
            String eventType = asString(payload.get("eventType"));
            String eventId = asString(payload.get("eventId"));
            String correlationId = asString(payload.get("correlationId"));
            String fileId = asString(asMap(payload.get("data")).get("fileId"));
            
            log.info("📨 Received file.metadata.recorded: eventId={}, fileId={}, correlationId={}", 
                    eventId, fileId, correlationId);
            
            if (eventId == null || fileId == null) {
                log.warn("⚠️ Event missing required fields (eventId or fileId), skipping");
                return;
            }
            
            // Check idempotency
            if (fileEventService.isEventProcessed(eventId)) {
                log.info("ℹ️ Event already processed: eventId={}", eventId);
                return;
            }
            
            // Process file metadata
            fileEventService.processFileMetadataRecorded(fileId, payload, correlationId, "system");
            fileEventService.markEventAsProcessed(eventId, "file.metadata.recorded", fileId);
            
            log.info("✅ Processed file metadata: fileId={}", fileId);
            
        } catch (Exception e) {
            log.error("❌ Error processing file.metadata.recorded: {}", e.getMessage(), e);
        }
    }

    private String asString(Object o) {
        return (o != null) ? String.valueOf(o) : null;
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        return (o instanceof Map) ? (Map<String, Object>) o : null;
    }
}
