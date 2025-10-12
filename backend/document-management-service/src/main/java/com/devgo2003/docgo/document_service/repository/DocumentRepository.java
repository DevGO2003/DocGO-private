package com.devgo2003.docgo.document_service.repository;

import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {
    Page<DocumentEntity> findAll(Pageable pageable);
    Page<DocumentEntity> findByUserId(String userId, Pageable pageable);
    @Query("{ 'documentType': ?0 }")
    Page<DocumentEntity> findByDocumentType(String documentType, Pageable pageable);
    
    @Query("{ 'userId': ?0, 'documentType': ?1 }")
    Page<DocumentEntity> findByUserIdAndDocumentType(String userId, String documentType, Pageable pageable);
}
