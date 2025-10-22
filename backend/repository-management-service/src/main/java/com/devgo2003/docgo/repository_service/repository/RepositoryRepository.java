package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryRepository extends MongoRepository<RepositoryEntity, String> {
    
    /**
     * Tìm tất cả repositories của organization
     */
    List<RepositoryEntity> findByOrganizationId(String organizationId);
    
    /**
     * Tìm repositories theo organization và type
     */
    List<RepositoryEntity> findByOrganizationIdAndType(String organizationId, String type);
    
    /**
     * Tìm repository theo organization và name
     */
    Optional<RepositoryEntity> findByOrganizationIdAndName(String organizationId, String name);
    
    /**
     * Check repository tồn tại
     */
    boolean existsByOrganizationIdAndName(String organizationId, String name);
    
    /**
     * Đếm số repositories của organization
     */
    long countByOrganizationId(String organizationId);
    
    /**
     * Tìm repositories mà user có quyền truy cập
     * (Check trong accessControl.viewerRoles hoặc viewerUsers)
     */
    List<RepositoryEntity> findByOrganizationIdAndDeletedAtIsNull(String organizationId);
}
