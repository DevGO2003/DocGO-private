package com.devgo2003.docgo.repository_service.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "repository_invites")
public class RepositoryInviteEntity {

    @Id
    private String id;

    @Field("token")
    private String token; // UUID for invite link

    @Field("repositoryId")
    private String repositoryId;

    @Field("repositoryName")
    private String repositoryName;

    @Field("invitedBy")
    private String invitedBy; // User ID who created the invite

    @Field("inviterName")
    private String inviterName; // Name of inviter for display

    @Field("invitedTo")
    private String invitedTo; // Target user ID (for personal invites only)

    @Field("permissions")
    private List<String> permissions; // Permissions to grant (e.g., ["VIEW", "UPLOAD"])

    @Field("isPersonalInvite")
    @Builder.Default
    private Boolean isPersonalInvite = false; // true = personal invite with notification, false = link invite

    @Field("createdAt")
    private LocalDateTime createdAt;

    @Field("expiresAt")
    private LocalDateTime expiresAt;

    @Field("isUsed")
    @Builder.Default
    private Boolean isUsed = false;

    @Field("usedBy")
    private String usedBy; // User ID who accepted the invite

    @Field("usedAt")
    private LocalDateTime usedAt;

    @Field("isRevoked")
    @Builder.Default
    private Boolean isRevoked = false;

    @Field("revokedAt")
    private LocalDateTime revokedAt;

    @Field("revokedBy")
    private String revokedBy;

    // Helper methods
    public boolean isValid() {
        if (isUsed || isRevoked) {
            return false;
        }
        return expiresAt == null || LocalDateTime.now().isBefore(expiresAt);
    }

    public boolean isExpired() {
        return expiresAt != null && LocalDateTime.now().isAfter(expiresAt);
    }
}
