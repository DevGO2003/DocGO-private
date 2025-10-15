package com.devgo2003.docgo.file_service.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadedEvent {
    private String eventId;
    private String eventType;
    private LocalDateTime timestamp;
    private String source;
    private String correlationId;
    
    // Event data
    private String documentId;
    private String fileId;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String fileUrl;
    private String userId;
    private String s3Key;
    private String s3Bucket;
    
    // Actor information
    private String actor;
    private String actorUserId;
    private String actorIp;
    
    // Metadata
    private String region;
    private String serviceVersion;
}

