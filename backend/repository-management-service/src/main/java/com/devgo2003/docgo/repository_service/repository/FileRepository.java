package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileRepository extends MongoRepository<FileEntity, String> {
    List<FileEntity> findByStatus(String status);
    List<FileEntity> findByDocumentType(String documentType);
    List<FileEntity> findByOwnerUserId(String ownerUserId);
    Page<FileEntity> findByNameContainingIgnoreCase(String name, Pageable pageable);
    Page<FileEntity> findByRepositoryIdAndIsDeletedFalse(String repositoryId, Pageable pageable);

    // Filter files by owner user ID with pagination
    Page<FileEntity> findByOwnerUserIdAndIsDeletedFalse(String ownerUserId, Pageable pageable);

    // Filter files by document type with pagination
    Page<FileEntity> findByDocumentTypeAndIsDeletedFalse(String documentType, Pageable pageable);

    // Filter files by repository IDs with pagination
    Page<FileEntity> findByRepositoryIdInAndIsDeletedFalse(List<String> repositoryIds, Pageable pageable);
    
    // Combined filters
    Page<FileEntity> findByDocumentTypeAndOwnerUserIdAndIsDeletedFalse(String documentType, String ownerUserId, Pageable pageable);
    Page<FileEntity> findByDocumentTypeAndRepositoryIdInAndIsDeletedFalse(String documentType, List<String> repositoryIds, Pageable pageable);
    Page<FileEntity> findByOwnerUserIdAndRepositoryIdInAndIsDeletedFalse(String ownerUserId, List<String> repositoryIds, Pageable pageable);
    Page<FileEntity> findByDocumentTypeAndOwnerUserIdAndRepositoryIdInAndIsDeletedFalse(String documentType, String ownerUserId, List<String> repositoryIds, Pageable pageable);
}
