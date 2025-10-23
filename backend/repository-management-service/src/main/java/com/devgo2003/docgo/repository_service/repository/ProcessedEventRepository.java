package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.ProcessedEventEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ProcessedEventRepository
 * 
 * Repository for idempotency tracking
 */
@Repository
public interface ProcessedEventRepository extends MongoRepository<ProcessedEventEntity, String> {
    
    /**
     * Find by eventId (same as findById)
     */
    Optional<ProcessedEventEntity> findByEventId(String eventId);
    
    /**
     * Find all events for a document
     */
    List<ProcessedEventEntity> findByDocumentId(String documentId);
    
    /**
     * Find by event type
     */
    List<ProcessedEventEntity> findByEventType(String eventType);
    
    /**
     * Check if event already processed
     */
    boolean existsByIdAndEventType(String eventId, String eventType);
}
