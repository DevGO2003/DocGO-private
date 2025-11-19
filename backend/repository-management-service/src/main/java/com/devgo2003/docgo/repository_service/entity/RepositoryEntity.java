package com.devgo2003.docgo.repository_service.entity;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "repositories")
public class RepositoryEntity {

    @Id
    private String id;

    @Field("name")
    private String name;

    @Field("description")
    private String description;

    @Field("type")
    private RepositoryType type;

    @Field("ownerUserId")
    private String ownerUserId;

    @Field("organizationId")
    private String organizationId; // null for personal repositories

    @Field("isPublic")
    private Boolean isPublic;

    @Field("isDeleted")
    private Boolean isDeleted;

    @Field("createdAt")
    private LocalDateTime createdAt;

    @Field("updatedAt")
    private LocalDateTime updatedAt;

    @Field("createdBy")
    private String createdBy;

    @Field("updatedBy")
    private String updatedBy;

    @Field("metadata")
    private Map<String, Object> metadata;

    @Field("settings")
    private RepositorySettings settings;

    @Field("permissions")
    private List<RepositoryPermission> permissions;
    
    @Field("members")
    @Builder.Default
    private List<RepositoryMember> members = new ArrayList<>();

    // Repository Type Enum
    public enum RepositoryType {
        PERSONAL,
        ORGANIZATION
    }

    // Repository Settings
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RepositorySettings {
        @Field("allowFileUpload")
        @Builder.Default
        private Boolean allowFileUpload = true;

        @Field("maxFileSize")
        @Builder.Default
        private Long maxFileSize = 10485760L; // 10MB default

        @Field("allowedFileTypes")
        private List<String> allowedFileTypes;

        @Field("enableVersioning")
        @Builder.Default
        private Boolean enableVersioning = true;

        @Field("enableComments")
        @Builder.Default
        private Boolean enableComments = true;

        @Field("enableTags")
        @Builder.Default
        private Boolean enableTags = true;
    }

    // Repository Permission (Legacy - for backward compatibility)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RepositoryPermission {
        @Field("userId")
        private String userId;

        @Field("role")
        private String role; // OWNER, ADMIN, EDITOR, VIEWER

        @Field("permissions")
        private List<String> permissions; // READ, WRITE, DELETE, ADMIN

        @Field("grantedBy")
        private String grantedBy;

        @Field("grantedAt")
        private LocalDateTime grantedAt;
    }
    
    // Repository Member (Full member info)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RepositoryMember {
        @Field("userId")
        private String userId;
        
        @Field("username")
        private String username;
        
        @Field("email")
        private String email;

        @Field("role")
        private String role; // OWNER, ADMIN, MEMBER, VIEWER

        @Field("status")
        private String status; // ACTIVE, PENDING, SUSPENDED, LEFT
        
        @Field("permissions")
        @Builder.Default
        private MemberPermissions permissions = new MemberPermissions();

        @Field("invitedBy")
        private String invitedBy;
        
        @Field("invitedAt")
        private LocalDateTime invitedAt;

        @Field("joinedAt")
        private LocalDateTime joinedAt;
        
        @Field("leftAt")
        private LocalDateTime leftAt;
    }
    
    // Member Permissions
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MemberPermissions {
        @Builder.Default
        private Boolean canView = true;
        
        @Builder.Default
        private Boolean canUpload = false;
        
        @Builder.Default
        private Boolean canEdit = false;
        
        @Builder.Default
        private Boolean canDelete = false;
        
        @Builder.Default
        private Boolean canManageMembers = false;
        
        @Builder.Default
        private Boolean canManageSettings = false;
    }

    // Helper methods
    public boolean isPersonal() {
        return RepositoryType.PERSONAL.equals(this.type);
    }

    public boolean isOrganization() {
        return RepositoryType.ORGANIZATION.equals(this.type);
    }

    public boolean hasPermission(String userId, String permission) {
        if (ownerUserId.equals(userId)) {
            return true; // Owner has all permissions
        }

        return permissions.stream()
            .filter(p -> p.getUserId().equals(userId))
            .anyMatch(p -> p.getPermissions().contains(permission));
    }
}
