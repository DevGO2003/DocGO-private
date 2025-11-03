package com.devgo2003.docgo.repository_service.dto;

import com.devgo2003.docgo.repository_service.entity.RepositoryMemberEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryMemberDTO {
    
    private String id;
    private String repositoryId;
    private String userId;
    private String username;
    private String email;
    private String role;
    private RepositoryMemberEntity.RepositoryPermissions permissions;
    private String status;
    private String invitedBy;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
    private LocalDateTime leftAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static RepositoryMemberDTO fromEntity(RepositoryMemberEntity entity) {
        return RepositoryMemberDTO.builder()
            .id(entity.getId())
            .repositoryId(entity.getRepositoryId())
            .userId(entity.getUserId())
            .username(entity.getUsername())
            .email(entity.getEmail())
            .role(entity.getRole())
            .permissions(entity.getPermissions())
            .status(entity.getStatus() != null ? entity.getStatus().name() : null)
            .invitedBy(entity.getInvitedBy())
            .invitedAt(entity.getInvitedAt())
            .joinedAt(entity.getJoinedAt())
            .leftAt(entity.getLeftAt())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }
}
