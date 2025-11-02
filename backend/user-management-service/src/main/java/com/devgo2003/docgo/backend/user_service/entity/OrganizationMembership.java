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
import java.util.Set;

@Document(collection = "organization_memberships")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationMembership {

    @org.springframework.data.annotation.Id
    private String id;

    @Field("organization_id")
    private String organizationId;

    @Field("user_id")
    private String userId;

    @Field("role_ids")
    private Set<String> roleIds; // Legacy - deprecated

    @Field("role")
    private String role; // OWNER, ADMIN, MANAGER, MEMBER

    @Field("simple_role")
    private String simpleRole; // Legacy - deprecated

    @Field("permissions")
    private List<String> permissions; // Direct permissions list

    @Field("status")
    @Builder.Default
    private MembershipStatus status = MembershipStatus.PENDING;

    @Field("is_admin")
    @Builder.Default
    private Boolean isAdmin = false;

    @Field("invited_by")
    private String invitedBy;

    @Field("invited_at")
    private LocalDateTime invitedAt;

    @Field("joined_at")
    private LocalDateTime joinedAt;

    @Field("left_at")
    private LocalDateTime leftAt;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum MembershipStatus {
        PENDING,
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        LEFT
    }
}