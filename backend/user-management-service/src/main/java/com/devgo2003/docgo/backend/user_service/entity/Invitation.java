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
import java.util.Set;

@Document(collection = "invitations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invitation {

    @org.springframework.data.annotation.Id
    private String id;

    @Field("organization_id")
    private String organizationId;

    @Field("email")
    private String email;

    @Field("role_ids")
    private Set<String> roleIds;

    @Field("status")
    @Builder.Default
    private InvitationStatus status = InvitationStatus.PENDING;

    @Field("invited_by")
    private String invitedBy;

    @Field("expires_at")
    private LocalDateTime expiresAt;

    @Field("accepted_at")
    private LocalDateTime acceptedAt;

    @Field("declined_at")
    private LocalDateTime declinedAt;

    @Field("token")
    private String token;

    @Field("created_at")
    @CreatedDate
    private LocalDateTime createdAt;

    @Field("updated_at")
    @LastModifiedDate
    private LocalDateTime updatedAt;

    public enum InvitationStatus {
        PENDING,
        ACCEPTED,
        DECLINED,
        EXPIRED,
        CANCELLED
    }
}