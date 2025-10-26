package com.devgo2003.docgo.backend.user_service.entity;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.Builder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Document(collection = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @org.springframework.data.annotation.Id
    private String id;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    private String firstName;
    private String lastName;
    private String phone;

    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Builder.Default
    private UserRole role = UserRole.USER;

    private LocalDateTime lastLogin;

    @Builder.Default
    private Boolean emailVerified = false;

    private String profilePicture;
    private String organizationId;
    private java.util.List<String> organizationIds;
    private String activeOrganizationId;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private String createdBy;
    private String updatedBy;

    // Additional fields for full functionality
    private Set<String> roleIds;
    private Set<String> permissionIds;

    @Builder.Default
    private Integer loginAttempts = 0;

    @Builder.Default
    private Boolean twoFactorEnabled = false;

    private String twoFactorSecret;
    private String avatarUrl;
    private List<String> groups;
    private LocalDateTime lockedUntil;

    public enum UserStatus {
        ACTIVE,
        INACTIVE,
        SUSPENDED,
        DELETED
    }

    public enum UserRole {
        ADMIN,
        USER,
        MODERATOR
    }
}
