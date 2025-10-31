package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.CorrespondentEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CorrespondentRepository extends MongoRepository<CorrespondentEntity, String> {
    List<CorrespondentEntity> findByIsDeletedFalse();
    
    List<CorrespondentEntity> findByNameContainingIgnoreCaseAndIsDeletedFalse(String name);
    
    Optional<CorrespondentEntity> findByIdAndIsDeletedFalse(String id);
}
