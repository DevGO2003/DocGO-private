package com.devgo2003.docgo.backend.user_service.repository;

import com.devgo2003.docgo.backend.user_service.entity.WorkflowInstanceEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowInstanceRepository extends MongoRepository<WorkflowInstanceEntity, String> {
    
    /**
     * Tìm workflow instance đang active của contract
     */
    Optional<WorkflowInstanceEntity> findByContractIdAndStatus(String contractId, String status);
    
    /**
     * Tìm tất cả workflow instances của contract
     */
    List<WorkflowInstanceEntity> findByContractId(String contractId);
    
    /**
     * Tìm workflow instances của organization theo status
     */
    List<WorkflowInstanceEntity> findByOrganizationIdAndStatus(String organizationId, String status);
    
    /**
     * Tìm workflow instances đang in_progress
     */
    List<WorkflowInstanceEntity> findByStatus(String status);
    
    /**
     * Tìm workflow instances bị timeout (để xử lý escalation)
     * Tìm các instance có step đang in_progress và timeoutAt < now
     */
    List<WorkflowInstanceEntity> findByStatusAndSteps_TimeoutAtBefore(String status, LocalDateTime now);
    
    /**
     * Đếm số workflow instances đang pending approval của user
     * (User là approver trong current step)
     */
    long countByStatusAndSteps_Status(String workflowStatus, String stepStatus);
}
