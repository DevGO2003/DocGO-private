package com.devgo2003.docgo.repository_service.service.event;

import com.devgo2003.docgo.repository_service.entity.FileEntity;

import java.util.Map;

/**
 * IFileEventService - File Event Processing Service Interface
 * 
 * Responsibilities:
 * - Process Kafka events (FILE_UPLOAD_COMPLETED, FILE_CONTENT_EXTRACTED, CONTRACT_SUMMARY_GENERATED)
 * - Deep merge event data into FileEntity
 * - Handle idempotency (prevent duplicate processing)
 * - Error handling and recovery
 */
public interface IFileEventService {
    
    /**
     * Process FILE_UPLOAD_COMPLETED event
     * Creates document skeleton with basic metadata
     * 
     * @param documentId UUID v7 of the document
     * @param eventData Event payload data
     * @param correlationId Request correlation ID
     * @param actor Actor performing action
     * @return Created FileEntity
     */
    FileEntity processFileUploadCompleted(String documentId, Map<String, Object> eventData, 
                                          String correlationId, String actor);
    
    /**
     * Process FILE_CONTENT_EXTRACTED event
     * Deep merge content + AI classification into existing document
     * 
     * @param documentId UUID v7 of the document
     * @param eventData Event payload data
     * @param correlationId Request correlation ID
     * @param actor Actor performing action
     * @return Updated FileEntity
     */
    FileEntity processFileContentExtracted(String documentId, Map<String, Object> eventData,
                                           String correlationId, String actor);
    
    /**
     * Process CONTRACT_SUMMARY_GENERATED event
     * Deep merge contract analysis into existing document (conditional)
     * 
     * @param documentId UUID v7 of the document
     * @param eventData Event payload data
     * @param correlationId Request correlation ID
     * @param actor Actor performing action
     * @return Updated FileEntity
     */
    FileEntity processContractSummaryGenerated(String documentId, Map<String, Object> eventData,
                                               String correlationId, String actor);
    
    /**
     * Check if event was already processed (idempotency)
     * 
     * @param eventId Unique event ID
     * @return true if already processed
     */
    boolean isEventProcessed(String eventId);
    
    /**
     * Mark event as processed
     * 
     * @param eventId Unique event ID
     * @param eventType Type of event
     * @param documentId Document ID
     */
    void markEventAsProcessed(String eventId, String eventType, String documentId);
}
