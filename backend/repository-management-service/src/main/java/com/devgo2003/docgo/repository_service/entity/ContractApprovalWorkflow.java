package com.devgo2003.docgo.repository_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Contract Approval Workflow Entity
 * Quản lý workflow phê duyệt hợp đồng theo sequential approval
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "contract_approval_workflows")
public class ContractApprovalWorkflow {

    @Id
    private String id;

    // Contract Information
    @Field("contractId")
    private String contractId;

    @Field("contractTitle")
    private String contractTitle;

    @Field("contractValue")
    private Double contractValue;

    // Organization Context
    @Field("organizationId")
    private String organizationId;

    @Field("repositoryId")
    private String repositoryId;

    // Workflow Configuration
    @Field("requiredLevels")
    @Builder.Default
    private List<ApprovalLevel> requiredLevels = new ArrayList<>();

    @Field("currentLevelIndex")
    @Builder.Default
    private Integer currentLevelIndex = 0;

    @Field("status")
    private WorkflowStatus status;

    // Approval Records
    @Field("approvals")
    @Builder.Default
    private List<ApprovalRecord> approvals = new ArrayList<>();

    // Creator Information
    @Field("createdBy")
    private String createdBy;

    @Field("createdByName")
    private String createdByName;

    @Field("createdByEmail")
    private String createdByEmail;

    // Timestamps
    @Field("createdAt")
    private LocalDateTime createdAt;

    @Field("submittedAt")
    private LocalDateTime submittedAt;

    @Field("completedAt")
    private LocalDateTime completedAt;

    @Field("lastActionAt")
    private LocalDateTime lastActionAt;

    // Metadata
    @Field("metadata")
    private Map<String, Object> metadata;

    /**
     * Approval Level Enum
     */
    public enum ApprovalLevel {
        LEGAL,      // Phê duyệt pháp lý
        FINANCE,    // Phê duyệt tài chính
        EXECUTIVE   // Phê duyệt điều hành
    }

    /**
     * Workflow Status Enum
     */
    public enum WorkflowStatus {
        DRAFT,
        PENDING_APPROVAL,
        LEGAL_REVIEW,
        LEGAL_APPROVED,
        FINANCE_REVIEW,
        FINANCE_APPROVED,
        EXECUTIVE_REVIEW,
        EXECUTIVE_APPROVED,
        FULLY_APPROVED,
        REJECTED,
        CANCELLED
    }

    /**
     * Approval Record (Embedded Document)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApprovalRecord {

        @Field("id")
        private String id;

        @Field("level")
        private ApprovalLevel level;

        @Field("action")
        private ApprovalAction action;

        // Approver Information
        @Field("approvedBy")
        private String approvedBy;

        @Field("approverName")
        private String approverName;

        @Field("approverEmail")
        private String approverEmail;

        @Field("approverRole")
        private String approverRole;

        @Field("approverPermissions")
        private List<String> approverPermissions;

        // Action Details
        @Field("actionAt")
        private LocalDateTime actionAt;

        @Field("comment")
        private String comment;

        // Audit Information
        @Field("ipAddress")
        private String ipAddress;

        @Field("userAgent")
        private String userAgent;
    }

    /**
     * Approval Action Enum
     */
    public enum ApprovalAction {
        APPROVED,
        REJECTED
    }

    // Helper Methods

    /**
     * Get current approval level
     */
    public ApprovalLevel getCurrentLevel() {
        if (currentLevelIndex >= requiredLevels.size()) {
            return null;
        }
        return requiredLevels.get(currentLevelIndex);
    }

    /**
     * Check if workflow is completed
     */
    public boolean isCompleted() {
        return status == WorkflowStatus.FULLY_APPROVED ||
               status == WorkflowStatus.REJECTED ||
               status == WorkflowStatus.CANCELLED;
    }

    /**
     * Check if workflow is pending
     */
    public boolean isPending() {
        return status != null && 
               status.name().contains("REVIEW") && 
               !isCompleted();
    }

    /**
     * Get completed levels
     */
    public List<ApprovalLevel> getCompletedLevels() {
        List<ApprovalLevel> completed = new ArrayList<>();
        for (ApprovalRecord record : approvals) {
            if (record.getAction() == ApprovalAction.APPROVED) {
                completed.add(record.getLevel());
            }
        }
        return completed;
    }

    /**
     * Get remaining levels
     */
    public List<ApprovalLevel> getRemainingLevels() {
        List<ApprovalLevel> completed = getCompletedLevels();
        List<ApprovalLevel> remaining = new ArrayList<>();
        for (ApprovalLevel level : requiredLevels) {
            if (!completed.contains(level)) {
                remaining.add(level);
            }
        }
        return remaining;
    }

    /**
     * Add approval record
     */
    public void addApprovalRecord(ApprovalRecord record) {
        if (this.approvals == null) {
            this.approvals = new ArrayList<>();
        }
        this.approvals.add(record);
        this.lastActionAt = LocalDateTime.now();
    }
}
