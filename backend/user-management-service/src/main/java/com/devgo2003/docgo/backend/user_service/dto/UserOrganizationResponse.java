package com.devgo2003.docgo.backend.user_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserOrganizationResponse {
    private String organizationId;
    private String organizationName;
    private String organizationCode;
    private String myRole;  // "owner", "manager", "member"
    private List<String> myPermissions;
    private Boolean isActive;  // Tổ chức đang active
    private Integer memberCount;
    private LocalDateTime joinedAt;
}
