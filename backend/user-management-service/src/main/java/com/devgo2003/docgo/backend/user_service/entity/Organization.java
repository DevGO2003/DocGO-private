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

    private String name;
    private String code;
    private String description;
    private String address;
    private String phone;
    private String email;
    private String website;

    @Builder.Default
    private OrganizationStatus status = OrganizationStatus.ACTIVE;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String createdBy;
    private String updatedBy;
    private LocalDateTime deletedAt;
    private List<String> userIds;
    private String ownerUserId;
    private List<String> adminUserIds;

    @Builder.Default
    private Integer memberCount = 0;

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
        @Builder.Default
        private Boolean allowMemberInvite = true;

        @Builder.Default
        private Boolean requireAdminApproval = false;

        private Integer maxMembers;
        private Map<String, Object> customSettings;
    }
}
