package com.devgo2003.docgo.document_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentProcessedEvent {
    private String eventId;
    private String eventType;
    private LocalDateTime timestamp;
    private String source;
    private String correlationId;
    
    // Event data
    private String documentId;
    private String fileId;
    private String ocrText;
    private String ocrStatus;
    private Object classificationResult;
    private String processingStatus;
    private String processingError;
    
    // Actor information
    private String actor;
    private String actorUserId;
    private String actorIp;
    
    // Metadata
    private String region;
    private String serviceVersion;
}


