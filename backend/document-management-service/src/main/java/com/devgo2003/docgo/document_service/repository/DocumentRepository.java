package com.devgo2003.docgo.document_service.repository;

import com.devgo2003.docgo.document_service.entity.DocumentEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentRepository extends MongoRepository<DocumentEntity, String> {
    Page<DocumentEntity> findAll(Pageable pageable);
    Page<DocumentEntity> findByUserId(String userId, Pageable pageable);
}
