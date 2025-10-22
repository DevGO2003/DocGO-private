package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.DocumentVersionEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentVersionRepository extends MongoRepository<DocumentVersionEntity, String> {
    
    /**
     * Find all version buckets for a document
     */
    List<DocumentVersionEntity> findByDocumentIdOrderByBucketNumberAsc(String documentId);
    
    /**
     * Find specific bucket
     */
    Optional<DocumentVersionEntity> findByDocumentIdAndBucketNumber(String documentId, Integer bucketNumber);
    
    /**
     * Delete all version buckets for a document
     */
    void deleteByDocumentId(String documentId);
    
    /**
     * Get latest bucket for a document
     */
    Optional<DocumentVersionEntity> findFirstByDocumentIdOrderByBucketNumberDesc(String documentId);
}
