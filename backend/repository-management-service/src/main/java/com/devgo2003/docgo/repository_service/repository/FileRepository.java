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
}
