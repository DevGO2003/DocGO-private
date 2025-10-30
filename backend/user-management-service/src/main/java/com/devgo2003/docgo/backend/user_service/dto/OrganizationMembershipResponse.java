package com.devgo2003.docgo.backend.user_service.dto;

import com.devgo2003.docgo.backend.user_service.entity.OrganizationMembership;
import lombok.Builder;
import lombok.Data;

import java.util.Set;
import java.time.LocalDateTime;

@Data
@Builder
public class OrganizationMembershipResponse {
    private String id;
    private String organizationId;
    private String userId;
    private Set<String> roleIds;
    private boolean isAdmin;
    private OrganizationMembership.MembershipStatus status;
    private String invitedBy;
    private LocalDateTime invitedAt;
    private LocalDateTime joinedAt;
    private LocalDateTime createdAt;
    private String token; // Invitation token for accepting/rejecting
    
    // User information
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String role; // Simple role string for display

    public static OrganizationMembershipResponse fromEntity(OrganizationMembership membership) {
        if (membership == null) {
            return null;
        }
        return OrganizationMembershipResponse.builder()
                .id(membership.getId())
                .organizationId(membership.getOrganizationId())
                .userId(membership.getUserId())
                .roleIds(membership.getRoleIds())
                .isAdmin(Boolean.TRUE.equals(membership.getIsAdmin()))
                .status(membership.getStatus())
                .invitedBy(membership.getInvitedBy())
                .invitedAt(membership.getInvitedAt())
                .joinedAt(membership.getJoinedAt())
                .createdAt(membership.getCreatedAt())
                .role(membership.getSimpleRole())
                .build();
    }
}


