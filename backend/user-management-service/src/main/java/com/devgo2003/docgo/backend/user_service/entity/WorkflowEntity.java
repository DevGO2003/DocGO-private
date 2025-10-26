package com.devgo2003.docgo.backend.user_service.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Workflow Entity - Định nghĩa quy trình phê duyệt cho Organization
 * Unified Workflow: 1 workflow duy nhất, tự động enable/disable steps dựa vào điều kiện
 */
@Document(collection = "workflows")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowEntity {

    @org.springframework.data.annotation.Id
    private String id;

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("organization_id")
    private String organizationId;

    @Field("steps")
    private List<WorkflowStep> steps;

    @Field("settings")
    private WorkflowSettings settings;

    @Field("is_default")
    @Builder.Default
    private Boolean isDefault = false;

    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Field("created_by")
    private String createdBy;

    @Field("updated_by")
    private String updatedBy;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    /**
     * Workflow Step - Một bước trong quy trình
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkflowStep {
        @Field("order")
        private Integer order;

        @Field("name")
        private String name;

        @Field("description")
        private String description;

        /**
         * Điều kiện để step này được enable
         * Format: { "type": "value_threshold", "field": "value", "operator": ">=", "value": 100000000 }
         * hoặc: { "type": "always", "value": true }
         */
        @Field("enabled_condition")
        private EnabledCondition enabledCondition;

        /**
         * Loại step:
         * - sequential: Chạy tuần tự
         * - parallel: Chạy song song (tất cả phải approve)
         * - any: Chỉ cần 1 người approve
         */
        @Field("type")
        private String type;

        @Field("approvers")
        private Approvers approvers;

        @Field("timeout_hours")
        private Integer timeoutHours;

        @Field("escalate_to")
        private List<String> escalateTo;

        @Field("actions")
        private List<String> actions; // approve, reject, request_changes
    }

    /**
     * Enabled Condition - Điều kiện để step được enable
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EnabledCondition {
        @Field("type")
        private String type; // always, value_threshold, contract_type, department, custom

        @Field("field")
        private String field; // value, type, department, etc.

        @Field("operator")
        private String operator; // >=, <=, ==, !=, in, not_in

        @Field("value")
        private Object value; // Giá trị để so sánh
    }

    /**
     * Approvers - Người có quyền approve
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Approvers {
        @Field("roles")
        private List<String> roles;

        @Field("specific_users")
        private List<String> specificUsers;

        @Field("min_approvals")
        private Integer minApprovals;
    }

    /**
     * Workflow Settings
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WorkflowSettings {
        @Field("allow_skip")
        @Builder.Default
        private Boolean allowSkip = false;

        @Field("require_comment")
        @Builder.Default
        private Boolean requireComment = true;

        @Field("notify_on_each_step")
        @Builder.Default
        private Boolean notifyOnEachStep = true;

        @Field("auto_escalate")
        @Builder.Default
        private Boolean autoEscalate = true;
    }
}
