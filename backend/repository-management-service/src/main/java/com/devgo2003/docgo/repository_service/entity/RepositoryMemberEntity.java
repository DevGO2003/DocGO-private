package com.devgo2003.docgo.repository_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "repository_members")
@CompoundIndexes({
    @CompoundIndex(name = "repo_user_idx", def = "{'repositoryId': 1, 'userId': 1}", unique = true)
})
public class RepositoryMemberEntity {
    
    @Id
    private String id;
    
    @Indexed
    private String repositoryId;
    
    @Indexed
    private String userId;
    
    private String username;
    private String email;
    
    // Role in this specific repository (OWNER, ADMIN, MEMBER, VIEWER)
    private String role;
    
    // Permissions for this repository
    @Builder.Default
    private RepositoryPermissions permissions = new RepositoryPermissions();
    
    private MembershipStatus status;
    
    private String invitedBy;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public enum MembershipStatus {
        PENDING,
        ACTIVE,
        SUSPENDED,
        LEFT
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RepositoryPermissions {
        @Builder.Default
        private boolean canView = true;
        
        @Builder.Default
        private boolean canUpload = false;
        
        @Builder.Default
        private boolean canEdit = false;
        
        @Builder.Default
        private boolean canDelete = false;
        
        @Builder.Default
        private boolean canManageMembers = false;
        
        @Builder.Default
        private boolean canManageSettings = false;
    }
}
