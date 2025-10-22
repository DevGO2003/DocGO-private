package com.devgo2003.docgo.backend.user_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Workflow Instance Entity - Instance của workflow đang chạy cho một contract cụ thể
 */
@Document(collection = "workflow_instances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowInstanceEntity {

    @org.springframework.data.annotation.Id
    private String id;

    @Field("contract_id")
    private String contractId;

    @Field("workflow_id")
    private String workflowId;

    @Field("organization_id")
    private String organizationId;

    @Field("current_step")
    private Integer currentStep;

    @Field("steps")
    private List<StepInstance> steps;

    /**
     * Status:
     * - in_progress: Đang chạy
     * - completed: Hoàn thành (approved)
     * - rejected: Bị từ chối
     * - changes_requested: Yêu cầu chỉnh sửa
     * - cancelled: Bị hủy
     * - timeout: Quá hạn
     */
    @Field("status")
    private String status;

    @Field("created_by")
    private String createdBy;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("completed_at")
    private LocalDateTime completedAt;

    /**
     * Step Instance - Instance của một step trong workflow
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StepInstance {
        @Field("order")
        private Integer order;

        @Field("name")
        private String name;

        @Field("description")
        private String description;

        /**
         * Status:
         * - pending: Chưa bắt đầu
         * - in_progress: Đang chạy
         * - completed: Hoàn thành
         * - rejected: Bị từ chối
         * - changes_requested: Yêu cầu chỉnh sửa
         * - skipped: Bị skip (do enabled condition = false)
         * - timeout: Quá hạn
         */
        @Field("status")
        private String status;

        @Field("approvals")
        private List<Approval> approvals;

        @Field("started_at")
        private LocalDateTime startedAt;

        @Field("completed_at")
        private LocalDateTime completedAt;

        @Field("timeout_at")
        private LocalDateTime timeoutAt;

        @Field("escalated")
        @Builder.Default
        private Boolean escalated = false;

        @Field("escalated_at")
        private LocalDateTime escalatedAt;

        @Field("escalated_to")
        private List<String> escalatedTo;
    }

    /**
     * Approval - Một approval action từ user
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Approval {
        @Field("user_id")
        private String userId;

        @Field("user_name")
        private String userName;

        @Field("user_role")
        private String userRole;

        /**
         * Action:
         * - approve: Phê duyệt
         * - reject: Từ chối
         * - request_changes: Yêu cầu chỉnh sửa
         */
        @Field("action")
        private String action;

        @Field("comment")
        private String comment;

        @Field("timestamp")
        private LocalDateTime timestamp;

        @Field("metadata")
        private Object metadata; // Thông tin thêm (review form, etc.)
    }
}
