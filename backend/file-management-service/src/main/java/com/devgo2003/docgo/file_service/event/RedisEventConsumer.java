package com.devgo2003.docgo.file_service.event;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import lombok.extern.slf4j.Slf4j;

import java.util.concurrent.CountDownLatch;

@Service
@ConditionalOnProperty(name = "spring.data.redis.enabled", havingValue = "true")
@Slf4j
public class RedisEventConsumer {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    private CountDownLatch latch = new CountDownLatch(1);
    
    public void receiveDocumentProcessedEvent(String message) {
        try {
            log.info("Received DocumentProcessed event: {}", message);
            
            DocumentProcessedEvent event = objectMapper.readValue(message, DocumentProcessedEvent.class);
            
            // TODO: Update DocumentEntity với processing results
            // This will be implemented when we create the update API
            
            log.info("Processed DocumentProcessed event: documentId={}, status={}", 
                    event.getDocumentId(), event.getProcessingStatus());
                    
        } catch (Exception e) {
            log.error("Failed to process DocumentProcessed event: {}", e.getMessage(), e);
        }
    }
    
    public CountDownLatch getLatch() {
        return latch;
    }
}


