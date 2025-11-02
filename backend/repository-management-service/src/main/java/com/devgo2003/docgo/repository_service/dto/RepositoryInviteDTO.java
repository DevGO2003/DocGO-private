package com.devgo2003.docgo.repository_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryInviteDTO {
    private String id;
    private String token;
    private String inviteLink; // Full URL: https://app.com/invite/{token}
    private String repositoryId;
    private String repositoryName;
    private String invitedBy;
    private String inviterName;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isExpired;
    private Boolean isUsed;
    private String usedBy;
    private LocalDateTime usedAt;
}
