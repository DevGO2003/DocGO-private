package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.DocumentFullContentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DocumentFullContentRepository extends MongoRepository<DocumentFullContentEntity, String> {
    
    /**
     * Find full content by documentId
     */
    Optional<DocumentFullContentEntity> findByDocumentId(String documentId);
    
    /**
     * Delete full content by documentId
     */
    void deleteByDocumentId(String documentId);
    
    /**
     * Check if full content exists for a document
     */
    boolean existsByDocumentId(String documentId);
}
