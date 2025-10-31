package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.TagEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TagRepository extends MongoRepository<TagEntity, String> {
    List<TagEntity> findByIsDeletedFalse();
    
    List<TagEntity> findByNameContainingIgnoreCaseAndIsDeletedFalse(String name);
    
    Optional<TagEntity> findByIdAndIsDeletedFalse(String id);
}
