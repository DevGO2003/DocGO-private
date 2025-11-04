package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.ContractApprovalWorkflow;
import com.devgo2003.docgo.repository_service.entity.ContractApprovalWorkflow.WorkflowStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractApprovalWorkflowRepository extends MongoRepository<ContractApprovalWorkflow, String> {

    /**
     * Find workflow by contract ID
     */
    Optional<ContractApprovalWorkflow> findByContractId(String contractId);

    /**
     * Find all workflows by contract ID (for history)
     */
    List<ContractApprovalWorkflow> findAllByContractIdOrderByCreatedAtDesc(String contractId);

    /**
     * Find workflows by organization ID
     */
    Page<ContractApprovalWorkflow> findByOrganizationId(String organizationId, Pageable pageable);

    /**
     * Find workflows by status
     */
    Page<ContractApprovalWorkflow> findByStatus(WorkflowStatus status, Pageable pageable);

    /**
     * Find workflows by organization and status
     */
    Page<ContractApprovalWorkflow> findByOrganizationIdAndStatus(
        String organizationId,
        WorkflowStatus status,
        Pageable pageable
    );

    /**
     * Find pending workflows (các workflow đang chờ duyệt)
     */
    @Query("{ 'status': { $in: ['LEGAL_REVIEW', 'FINANCE_REVIEW', 'EXECUTIVE_REVIEW'] } }")
    Page<ContractApprovalWorkflow> findPendingWorkflows(Pageable pageable);

    /**
     * Find pending workflows by organization
     */
    @Query("{ 'organizationId': ?0, 'status': { $in: ['LEGAL_REVIEW', 'FINANCE_REVIEW', 'EXECUTIVE_REVIEW'] } }")
    Page<ContractApprovalWorkflow> findPendingWorkflowsByOrganization(
        String organizationId,
        Pageable pageable
    );

    /**
     * Find workflows created by user
     */
    Page<ContractApprovalWorkflow> findByCreatedBy(String userId, Pageable pageable);

    /**
     * Count pending workflows by organization
     */
    @Query(value = "{ 'organizationId': ?0, 'status': { $in: ['LEGAL_REVIEW', 'FINANCE_REVIEW', 'EXECUTIVE_REVIEW'] } }", count = true)
    long countPendingByOrganization(String organizationId);
}
