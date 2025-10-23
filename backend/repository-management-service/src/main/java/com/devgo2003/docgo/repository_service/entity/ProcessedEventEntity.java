package com.devgo2003.docgo.repository_service.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

/**
 * ProcessedEventEntity - Idempotency tracking
 * 
 * Tracks processed Kafka events to prevent duplicate processing
 * Collection: processed_events
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "processed_events")
public class ProcessedEventEntity {
    
    @Id
    private String id;  // eventId from Kafka event
    
    @Indexed
    private String eventType;  // FILE_UPLOAD_COMPLETED, FILE_CONTENT_EXTRACTED, CONTRACT_SUMMARY_GENERATED
    
    @Indexed
    private String documentId;  // UUID v7 of the document
    
    private LocalDateTime processedAt;
    
    /**
     * Constructor for easy creation
     */
    public ProcessedEventEntity(String eventId, String eventType, String documentId) {
        this.id = eventId;
        this.eventType = eventType;
        this.documentId = documentId;
        this.processedAt = LocalDateTime.now();
    }
}
