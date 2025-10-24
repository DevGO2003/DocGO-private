package com.devgo2003.docgo.repository_service.service.event.consumer;

import com.devgo2003.docgo.repository_service.service.event.IFileEventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DocgoFileEventsConsumer {

    private final IFileEventService fileEventService;
    private final ObjectMapper objectMapper;

    @KafkaListener(
        topics = "${app.kafka.topic.docgo-file-events}",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleDocgoFileEvent(
        @Payload String payload,
        @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
        @Header(KafkaHeaders.OFFSET) long offset
    ) {
        try {
            log.info("📨 Received docgo-file-events: topic={}, partition={}, offset={}", topic, partition, offset);
            
            // Parse the event payload
            Map<String, Object> eventMap = objectMapper.readValue(payload, Map.class);
            String eventType = (String) eventMap.get("eventType");
            String eventId = (String) eventMap.get("eventId");
            String correlationId = (String) eventMap.get("correlationId");
            
            log.info("📨 Processing event: eventType={}, eventId={}, correlationId={}", eventType, eventId, correlationId);
            
            // Extract data section
            Map<String, Object> data = asMap(eventMap.get("data"));
            String documentId = (String) data.get("documentId");
            
            if (documentId == null) {
                log.error("❌ Missing documentId in event data: {}", data);
                return;
            }
            
            // Route to appropriate handler based on event type
            switch (eventType) {
                case "FILE_UPLOAD_COMPLETED":
                    handleFileUploadCompleted(documentId, data, correlationId, eventId);
                    break;
                case "FILE_CONTENT_EXTRACTED":
                    handleFileContentExtracted(documentId, data, correlationId, eventId);
                    break;
                case "CONTRACT_SUMMARY_GENERATED":
                    handleContractSummaryGenerated(documentId, data, correlationId, eventId);
                    break;
                default:
                    log.warn("⚠️ Unknown event type: {}", eventType);
            }
            
        } catch (Exception e) {
            log.error("❌ Error processing docgo-file-events: {}", e.getMessage(), e);
        }
    }
    
    private void handleFileUploadCompleted(String documentId, Map<String, Object> eventData, String correlationId, String eventId) {
        try {
            log.info("📨 Received FILE_UPLOAD_COMPLETED: eventId={}, documentId={}, correlationId={}", eventId, documentId, correlationId);
            
            fileEventService.processFileUploadCompleted(documentId, eventData, correlationId, "system");
            
            log.info("✅ Processed file upload completed: documentId={}", documentId);
        } catch (Exception e) {
            log.error("❌ Error processing FILE_UPLOAD_COMPLETED: {}", e.getMessage(), e);
        }
    }
    
    private void handleFileContentExtracted(String documentId, Map<String, Object> eventData, String correlationId, String eventId) {
        try {
            log.info("📨 Received FILE_CONTENT_EXTRACTED: eventId={}, documentId={}, correlationId={}", eventId, documentId, correlationId);
            
            fileEventService.processFileContentExtracted(documentId, eventData, correlationId, "system");
            
            log.info("✅ Processed file content extracted: documentId={}", documentId);
        } catch (Exception e) {
            log.error("❌ Error processing FILE_CONTENT_EXTRACTED: {}", e.getMessage(), e);
        }
    }
    
    private void handleContractSummaryGenerated(String documentId, Map<String, Object> eventData, String correlationId, String eventId) {
        try {
            log.info("📨 Received CONTRACT_SUMMARY_GENERATED: eventId={}, documentId={}, correlationId={}", eventId, documentId, correlationId);
            
            fileEventService.processContractSummaryGenerated(documentId, eventData, correlationId, "system");
            
            log.info("✅ Processed contract summary generated: documentId={}", documentId);
        } catch (Exception e) {
            log.error("❌ Error processing CONTRACT_SUMMARY_GENERATED: {}", e.getMessage(), e);
        }
    }
    
    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object obj) {
        if (obj instanceof Map) {
            return (Map<String, Object>) obj;
        }
        return Map.of();
    }
}
