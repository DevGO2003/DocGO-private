package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.DocumentTypeEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentTypeRepository extends MongoRepository<DocumentTypeEntity, String> {
    List<DocumentTypeEntity> findByIsDeletedFalse();
    
    Optional<DocumentTypeEntity> findByIdAndIsDeletedFalse(String id);
    
    List<DocumentTypeEntity> findByCategoryAndIsDeletedFalse(String category);
}
