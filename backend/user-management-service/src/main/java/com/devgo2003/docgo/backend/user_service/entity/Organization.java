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
import java.util.Map;

@Document(collection = "organizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    @org.springframework.data.annotation.Id
    private String id;

    @Field("name")
    private String name;

    @Field("code")
    private String code;

    @Field("description")
    private String description;

    @Field("address")
    private String address;

    @Field("phone")
    private String phone;

    @Field("email")
    private String email;

    @Field("website")
    private String website;

    @Field("status")
    @Builder.Default
    private OrganizationStatus status = OrganizationStatus.ACTIVE;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Field("created_by")
    private String createdBy;

    @Field("updated_by")
    private String updatedBy;

    @Field("deleted_at")
    private LocalDateTime deletedAt;

    @Field("user_ids")
    private List<String> userIds;

    @Field("owner_user_id")
    private String ownerUserId;

    @Field("admin_user_ids")
    private List<String> adminUserIds;

    @Field("member_count")
    @Builder.Default
    private Integer memberCount = 0;

    @Field("settings")
    private OrganizationSettings settings;

    public enum OrganizationStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        DELETED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrganizationSettings {
        @Field("allow_member_invite")
        @Builder.Default
        private Boolean allowMemberInvite = true;

        @Field("require_admin_approval")
        @Builder.Default
        private Boolean requireAdminApproval = false;

        @Field("max_members")
        private Integer maxMembers;

        @Field("custom_settings")
        private Map<String, Object> customSettings;
    }
}
