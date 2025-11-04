package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.entity.ContractApprovalWorkflow;
import com.devgo2003.docgo.repository_service.entity.ContractApprovalWorkflow.*;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.ContractApprovalWorkflowRepository;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class ContractApprovalService {

    private final ContractApprovalWorkflowRepository workflowRepository;
    private final FileRepository fileRepository;
    private final RestTemplate restTemplate;

    /**
     * Xác định approval levels dựa trên contract value
     */
    public List<ApprovalLevel> determineApprovalLevels(Double contractValue) {
        List<ApprovalLevel> levels = new ArrayList<>();

        if (contractValue == null || contractValue <= 0) {
            return levels; // No approval needed
        }

        if (contractValue < 100_000_000) {
            // < 100 triệu: Chỉ Legal
            levels.add(ApprovalLevel.LEGAL);
        } else if (contractValue < 500_000_000) {
            // 100tr - 500tr: Legal + Finance
            levels.add(ApprovalLevel.LEGAL);
            levels.add(ApprovalLevel.FINANCE);
        } else {
            // >= 500tr: Legal + Finance + Executive
            levels.add(ApprovalLevel.LEGAL);
            levels.add(ApprovalLevel.FINANCE);
            levels.add(ApprovalLevel.EXECUTIVE);
        }

        return levels;
    }

    /**
     * Create workflow khi submit contract for approval
     */
    public ContractApprovalWorkflow createWorkflow(
        String contractId,
        String organizationId,
        String userId,
        String userName,
        String userEmail,
        String comment
    ) {
        log.info("Creating approval workflow for contract: {}", contractId);

        // Get contract info
        FileEntity contract = fileRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        // Get contract value
        Double contractValue = extractContractValue(contract);
        String contractTitle = (String) contract.getOverview().get("title");

        // Determine required levels
        List<ApprovalLevel> requiredLevels = determineApprovalLevels(contractValue);

        if (requiredLevels.isEmpty()) {
            throw new IllegalStateException("Contract value is 0 or invalid, no approval needed");
        }

        // Create workflow
        ContractApprovalWorkflow workflow = ContractApprovalWorkflow.builder()
            .contractId(contractId)
            .contractTitle(contractTitle)
            .contractValue(contractValue)
            .organizationId(organizationId)
            .repositoryId(contract.getRepositoryId())
            .requiredLevels(requiredLevels)
            .currentLevelIndex(0)
            .status(WorkflowStatus.LEGAL_REVIEW) // Start with first level
            .approvals(new ArrayList<>())
            .createdBy(userId)
            .createdByName(userName)
            .createdByEmail(userEmail)
            .createdAt(LocalDateTime.now())
            .submittedAt(LocalDateTime.now())
            .lastActionAt(LocalDateTime.now())
            .build();

        // Save workflow
        workflow = workflowRepository.save(workflow);

        // Update contract status
        updateContractStatus(contractId, WorkflowStatus.LEGAL_REVIEW);

        log.info("Created workflow: {} for contract: {}, required levels: {}",
            workflow.getId(), contractId, requiredLevels);

        return workflow;
    }

    /**
     * Approve current level
     */
    public ContractApprovalWorkflow approve(
        String workflowId,
        String userId,
        String userName,
        String userEmail,
        String userRole,
        List<String> userPermissions,
        String comment
    ) {
        log.info("Approving workflow: {} by user: {}", workflowId, userId);

        // Load workflow
        ContractApprovalWorkflow workflow = workflowRepository.findById(workflowId)
            .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));

        // Validate can approve
        if (!canApprove(workflow, userId, userRole, userPermissions)) {
            throw new IllegalStateException("User does not have permission to approve this level");
        }

        // Get current level
        ApprovalLevel currentLevel = workflow.getCurrentLevel();

        // Create approval record
        ApprovalRecord record = ApprovalRecord.builder()
            .id(UUID.randomUUID().toString())
            .level(currentLevel)
            .action(ApprovalAction.APPROVED)
            .approvedBy(userId)
            .approverName(userName)
            .approverEmail(userEmail)
            .approverRole(userRole)
            .approverPermissions(userPermissions)
            .actionAt(LocalDateTime.now())
            .comment(comment)
            .build();

        // Add record
        workflow.addApprovalRecord(record);

        // Move to next level
        int nextLevelIndex = workflow.getCurrentLevelIndex() + 1;

        if (nextLevelIndex >= workflow.getRequiredLevels().size()) {
            // Completed all levels
            workflow.setStatus(WorkflowStatus.FULLY_APPROVED);
            workflow.setCompletedAt(LocalDateTime.now());
            workflow.setCurrentLevelIndex(nextLevelIndex);

            log.info("Workflow {} fully approved", workflowId);

            // Update contract status
            updateContractStatus(workflow.getContractId(), WorkflowStatus.FULLY_APPROVED);
        } else {
            // Move to next level
            workflow.setCurrentLevelIndex(nextLevelIndex);
            ApprovalLevel nextLevel = workflow.getRequiredLevels().get(nextLevelIndex);
            WorkflowStatus nextStatus = getStatusForLevel(nextLevel, false);
            workflow.setStatus(nextStatus);

            log.info("Workflow {} approved level {}, moving to {}", workflowId, currentLevel, nextLevel);

            // Update contract status
            updateContractStatus(workflow.getContractId(), nextStatus);
        }

        // Save
        return workflowRepository.save(workflow);
    }

    /**
     * Reject current level
     */
    public ContractApprovalWorkflow reject(
        String workflowId,
        String userId,
        String userName,
        String userEmail,
        String userRole,
        List<String> userPermissions,
        String comment
    ) {
        log.info("Rejecting workflow: {} by user: {}", workflowId, userId);

        // Validate comment
        if (comment == null || comment.trim().length() < 10) {
            throw new IllegalArgumentException("Comment is required for rejection (minimum 10 characters)");
        }

        // Load workflow
        ContractApprovalWorkflow workflow = workflowRepository.findById(workflowId)
            .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));

        // Validate can reject
        if (!canApprove(workflow, userId, userRole, userPermissions)) {
            throw new IllegalStateException("User does not have permission to reject this level");
        }

        // Get current level
        ApprovalLevel currentLevel = workflow.getCurrentLevel();

        // Create rejection record
        ApprovalRecord record = ApprovalRecord.builder()
            .id(UUID.randomUUID().toString())
            .level(currentLevel)
            .action(ApprovalAction.REJECTED)
            .approvedBy(userId)
            .approverName(userName)
            .approverEmail(userEmail)
            .approverRole(userRole)
            .approverPermissions(userPermissions)
            .actionAt(LocalDateTime.now())
            .comment(comment)
            .build();

        // Add record
        workflow.addApprovalRecord(record);

        // Set status to REJECTED
        workflow.setStatus(WorkflowStatus.REJECTED);
        workflow.setCompletedAt(LocalDateTime.now());

        log.info("Workflow {} rejected at level {} by {}", workflowId, currentLevel, userName);

        // Update contract status
        updateContractStatusWithRejection(workflow.getContractId(), userName, comment);

        // Save
        return workflowRepository.save(workflow);
    }

    /**
     * Get workflow by contract ID
     */
    public ContractApprovalWorkflow getWorkflowByContractId(String contractId) {
        return workflowRepository.findByContractId(contractId)
            .orElse(null);
    }

    /**
     * Get workflow history for contract
     */
    public List<ContractApprovalWorkflow> getWorkflowHistory(String contractId) {
        return workflowRepository.findAllByContractIdOrderByCreatedAtDesc(contractId);
    }

    /**
     * Get pending approvals for organization
     */
    public Page<ContractApprovalWorkflow> getPendingApprovals(String organizationId, Pageable pageable) {
        return workflowRepository.findPendingWorkflowsByOrganization(organizationId, pageable);
    }

    // Helper Methods

    private Double extractContractValue(FileEntity contract) {
        try {
            Map<String, Object> contractData = contract.getContract();
            if (contractData != null && contractData.containsKey("totalValue")) {
                Object value = contractData.get("totalValue");
                if (value instanceof Number) {
                    return ((Number) value).doubleValue();
                }
            }
        } catch (Exception e) {
            log.error("Error extracting contract value", e);
        }
        return 0.0;
    }

    private WorkflowStatus getStatusForLevel(ApprovalLevel level, boolean approved) {
        switch (level) {
            case LEGAL:
                return approved ? WorkflowStatus.LEGAL_APPROVED : WorkflowStatus.LEGAL_REVIEW;
            case FINANCE:
                return approved ? WorkflowStatus.FINANCE_APPROVED : WorkflowStatus.FINANCE_REVIEW;
            case EXECUTIVE:
                return approved ? WorkflowStatus.EXECUTIVE_APPROVED : WorkflowStatus.EXECUTIVE_REVIEW;
            default:
                return WorkflowStatus.PENDING_APPROVAL;
        }
    }

    private boolean canApprove(
        ContractApprovalWorkflow workflow,
        String userId,
        String userRole,
        List<String> userPermissions
    ) {
        ApprovalLevel currentLevel = workflow.getCurrentLevel();
        if (currentLevel == null) {
            return false;
        }

        // OWNER can approve everything
        if ("OWNER".equals(userRole)) {
            return true;
        }

        // MANAGER needs corresponding permission
        if ("MANAGER".equals(userRole) && userPermissions != null) {
            String requiredPermission = "approve:" + currentLevel.name().toLowerCase();
            return userPermissions.contains(requiredPermission);
        }

        return false;
    }

    private void updateContractStatus(String contractId, WorkflowStatus status) {
        FileEntity contract = fileRepository.findById(contractId).orElse(null);
        if (contract != null) {
            Map<String, Object> overview = contract.getOverview();
            overview.put("approvalStatus", status.name());
            overview.put("approvalStatusUpdatedAt", LocalDateTime.now().toString());
            fileRepository.save(contract);
        }
    }

    private void updateContractStatusWithRejection(String contractId, String rejectedBy, String reason) {
        FileEntity contract = fileRepository.findById(contractId).orElse(null);
        if (contract != null) {
            Map<String, Object> overview = contract.getOverview();
            overview.put("approvalStatus", "REJECTED");
            overview.put("rejectedAt", LocalDateTime.now().toString());
            overview.put("rejectedBy", rejectedBy);
            overview.put("rejectionReason", reason);
            fileRepository.save(contract);
        }
    }
}
