package com.devgo2003.docgo.backend.user_service.dto;

import com.devgo2003.docgo.backend.user_service.entity.Invitation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {
    
    private String id;
    private String organizationId;
    private String organizationName;  // ✅ Thêm tên organization
    private String email;
    private Set<String> roleIds;
    private Invitation.InvitationStatus status;
    private String invitedBy;
    private String invitedByName;  // ✅ Thêm tên người mời
    private LocalDateTime expiresAt;
    private LocalDateTime acceptedAt;
    private LocalDateTime declinedAt;
    private LocalDateTime createdAt;  // ✅ Đảm bảo không null
    private LocalDateTime updatedAt;
    
    /**
     * Convert từ Invitation entity
     * NOTE: organizationName và invitedByName phải được set thủ công
     */
    public static InvitationResponse fromEntity(Invitation invitation) {
        if (invitation == null) {
            return null;
        }
        
        return InvitationResponse.builder()
                .id(invitation.getId())
                .organizationId(invitation.getOrganizationId())
                .email(invitation.getEmail())
                .roleIds(invitation.getRoleIds())
                .status(invitation.getStatus())
                .invitedBy(invitation.getInvitedBy())
                .expiresAt(invitation.getExpiresAt())
                .acceptedAt(invitation.getAcceptedAt())
                .declinedAt(invitation.getDeclinedAt())
                .createdAt(invitation.getCreatedAt() != null ? invitation.getCreatedAt() : LocalDateTime.now())
                .updatedAt(invitation.getUpdatedAt())
                // organizationName và invitedByName phải được set sau
                .build();
    }
}
