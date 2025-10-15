package com.devgo2003.docgo.file_service.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "spring.data.redis.enabled", havingValue = "true")
@Slf4j
public class RedisEventPublisher {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private static final String FILE_UPLOADED_CHANNEL = "docgo:events:file-uploaded";
    private static final String DOCUMENT_PROCESSED_CHANNEL = "docgo:events:document-processed";
    
    public void publishFileUploadedEvent(FileUploadedEvent event) {
        try {
            // Set default values if not provided
            if (event.getEventId() == null) {
                event.setEventId(UUID.randomUUID().toString());
            }
            if (event.getEventType() == null) {
                event.setEventType("FileUploaded");
            }
            if (event.getTimestamp() == null) {
                event.setTimestamp(LocalDateTime.now());
            }
            if (event.getSource() == null) {
                event.setSource("document-management-service");
            }
            if (event.getCorrelationId() == null) {
                event.setCorrelationId(UUID.randomUUID().toString());
            }
            if (event.getActor() == null) {
                event.setActor("system");
            }
            if (event.getRegion() == null) {
                event.setRegion("local");
            }
            if (event.getServiceVersion() == null) {
                event.setServiceVersion("1.0.0");
            }
            
            String eventJson = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(FILE_UPLOADED_CHANNEL, eventJson);
            
            log.info("Published FileUploaded event: documentId={}, fileId={}, eventId={}", 
                    event.getDocumentId(), event.getFileId(), event.getEventId());
                    
        } catch (Exception e) {
            log.error("Failed to publish FileUploaded event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish FileUploaded event", e);
        }
    }
    
    public void publishDocumentProcessedEvent(DocumentProcessedEvent event) {
        try {
            // Set default values if not provided
            if (event.getEventId() == null) {
                event.setEventId(UUID.randomUUID().toString());
            }
            if (event.getEventType() == null) {
                event.setEventType("DocumentProcessed");
            }
            if (event.getTimestamp() == null) {
                event.setTimestamp(LocalDateTime.now());
            }
            if (event.getSource() == null) {
                event.setSource("automation-service");
            }
            if (event.getCorrelationId() == null) {
                event.setCorrelationId(UUID.randomUUID().toString());
            }
            if (event.getActor() == null) {
                event.setActor("system");
            }
            if (event.getRegion() == null) {
                event.setRegion("local");
            }
            if (event.getServiceVersion() == null) {
                event.setServiceVersion("1.0.0");
            }
            
            String eventJson = objectMapper.writeValueAsString(event);
            redisTemplate.convertAndSend(DOCUMENT_PROCESSED_CHANNEL, eventJson);
            
            log.info("Published DocumentProcessed event: documentId={}, processingStatus={}, eventId={}", 
                    event.getDocumentId(), event.getProcessingStatus(), event.getEventId());
                    
        } catch (Exception e) {
            log.error("Failed to publish DocumentProcessed event: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to publish DocumentProcessed event", e);
        }
    }
}


