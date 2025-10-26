package com.devgo2003.docgo.backend.user_service.repository;

import com.devgo2003.docgo.backend.user_service.entity.WorkflowEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowRepository extends MongoRepository<WorkflowEntity, String> {
    
    /**
     * Tìm workflow mặc định của organization
     */
    Optional<WorkflowEntity> findByOrganizationIdAndIsDefaultTrue(String organizationId);
    
    /**
     * Tìm tất cả workflows của organization
     */
    List<WorkflowEntity> findByOrganizationId(String organizationId);
    
    /**
     * Tìm workflows đang active của organization
     */
    List<WorkflowEntity> findByOrganizationIdAndIsActiveTrue(String organizationId);
    
    /**
     * Check workflow tồn tại
     */
    boolean existsByOrganizationIdAndName(String organizationId, String name);
}
