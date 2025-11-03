package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface FileRepository extends MongoRepository<FileEntity, String> {
    
    Page<FileEntity> findByRepositoryIdAndIsDeletedFalse(String repositoryId, Pageable pageable);

    // Query nested fields using dot notation
    @Query("{ 'overview.ownerUserId': ?0, 'isDeleted': false }")
    Page<FileEntity> findByOwnerUserIdAndIsDeletedFalse(String ownerUserId, Pageable pageable);

    @Query("{ 'overview.documentType': ?0, 'isDeleted': false }")
    Page<FileEntity> findByDocumentTypeAndIsDeletedFalse(String documentType, Pageable pageable);

    @Query("{ 'overview.organizationId': ?0, 'isDeleted': false }")
    Page<FileEntity> findByOrganizationIdAndIsDeletedFalse(String organizationId, Pageable pageable);

    // Combined filters
    @Query("{ 'overview.documentType': ?0, 'overview.organizationId': ?1, 'isDeleted': false }")
    Page<FileEntity> findByDocumentTypeAndOrganizationIdAndIsDeletedFalse(String documentType, String organizationId, Pageable pageable);
    
    @Query("{ 'overview.documentType': ?0, 'overview.ownerUserId': ?1, 'isDeleted': false }")
    Page<FileEntity> findByDocumentTypeAndOwnerUserIdAndIsDeletedFalse(String documentType, String ownerUserId, Pageable pageable);
    
    @Query("{ 'overview.organizationId': ?0, 'overview.ownerUserId': ?1, 'isDeleted': false }")
    Page<FileEntity> findByOrganizationIdAndOwnerUserIdAndIsDeletedFalse(String organizationId, String ownerUserId, Pageable pageable);
    
    @Query("{ 'overview.documentType': ?0, 'overview.organizationId': ?1, 'overview.ownerUserId': ?2, 'isDeleted': false }")
    Page<FileEntity> findByDocumentTypeAndOrganizationIdAndOwnerUserIdAndIsDeletedFalse(String documentType, String organizationId, String ownerUserId, Pageable pageable);
}
