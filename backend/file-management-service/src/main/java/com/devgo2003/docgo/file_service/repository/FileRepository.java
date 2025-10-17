package com.devgo2003.docgo.file_service.repository;

import com.devgo2003.docgo.file_service.entity.FileEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface FileRepository extends MongoRepository<FileEntity, String> {
    Optional<FileEntity> findById(String id);
    List<FileEntity> findByOverviewStatus(String status);
    List<FileEntity> findByOverviewDocumentType(String documentType);
    List<FileEntity> findByOverviewOwnerUserId(String ownerUserId);
    
    // Paginated methods
    Page<FileEntity> findByOverviewOwnerUserId(String ownerUserId, Pageable pageable);
    Page<FileEntity> findByOverviewDocumentType(String documentType, Pageable pageable);
    Page<FileEntity> findByOverviewOwnerUserIdAndOverviewDocumentType(String ownerUserId, String documentType, Pageable pageable);
}
