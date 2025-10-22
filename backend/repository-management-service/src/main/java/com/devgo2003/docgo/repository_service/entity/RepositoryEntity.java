package com.devgo2003.docgo.repository_service.entity;

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
 * Repository Entity - Kho lưu trữ hợp đồng trong Organization
 * Giống như GitHub Repository, mỗi org có nhiều repos để tổ chức contracts
 */
@Document(collection = "repositories")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RepositoryEntity {

    @org.springframework.data.annotation.Id
    private String id;

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("organization_id")
    private String organizationId;

    /**
     * Type: contracts, legal, hr, finance, sales, custom
     */
    @Field("type")
    private String type;

    @Field("category")
    private String category;

    @Field("tags")
    private List<String> tags;

    /**
     * Visibility:
     * - private: Chỉ members có quyền mới thấy
     * - internal: Tất cả members trong org thấy
     * - public: Public (nếu cần)
     */
    @Field("visibility")
    @Builder.Default
    private String visibility = "private";

    @Field("access_control")
    private AccessControl accessControl;

    @Field("settings")
    private RepositorySettings settings;

    // Statistics
    @Field("contract_count")
    @Builder.Default
    private Integer contractCount = 0;

    @Field("total_value")
    @Builder.Default
    private Double totalValue = 0.0;

    @Field("currency")
    @Builder.Default
    private String currency = "VND";

    @Field("last_activity_at")
    private LocalDateTime lastActivityAt;

    // Audit
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

    @Field("deleted_at")
    private LocalDateTime deletedAt;

    /**
     * Access Control - Phân quyền truy cập repository
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccessControl {
        /**
         * Roles có quyền xem
         */
        @Field("viewer_roles")
        private List<String> viewerRoles;

        /**
         * Roles có quyền chỉnh sửa
         */
        @Field("editor_roles")
        private List<String> editorRoles;

        /**
         * Roles có quyền phê duyệt
         */
        @Field("approver_roles")
        private List<String> approverRoles;

        /**
         * Specific users có quyền (ngoài roles)
         */
        @Field("viewer_users")
        private List<String> viewerUsers;

        @Field("editor_users")
        private List<String> editorUsers;

        @Field("approver_users")
        private List<String> approverUsers;
    }

    /**
     * Repository Settings
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RepositorySettings {
        /**
         * Yêu cầu phê duyệt khi upload contract vào repo này
         */
        @Field("require_approval")
        @Builder.Default
        private Boolean requireApproval = true;

        /**
         * Cho phép versioning
         */
        @Field("allow_versioning")
        @Builder.Default
        private Boolean allowVersioning = true;

        /**
         * Tự động archive contracts cũ
         */
        @Field("auto_archive")
        @Builder.Default
        private Boolean autoArchive = false;

        /**
         * Số ngày lưu trữ (nếu auto_archive = true)
         */
        @Field("retention_days")
        private Integer retentionDays;

        /**
         * Workflow ID mặc định cho repo này
         * Nếu null thì dùng workflow của organization
         */
        @Field("default_workflow_id")
        private String defaultWorkflowId;

        /**
         * Cho phép members tạo contract trong repo này
         */
        @Field("allow_member_create")
        @Builder.Default
        private Boolean allowMemberCreate = true;

        /**
         * Yêu cầu template khi tạo contract
         */
        @Field("require_template")
        @Builder.Default
        private Boolean requireTemplate = false;

        /**
         * Template IDs được phép dùng
         */
        @Field("allowed_templates")
        private List<String> allowedTemplates;
    }
}
