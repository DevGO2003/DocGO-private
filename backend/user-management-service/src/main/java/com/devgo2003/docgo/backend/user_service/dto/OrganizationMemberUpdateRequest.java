package com.devgo2003.docgo.backend.user_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationMemberUpdateRequest {
    // Legacy fields (deprecated)
    @Deprecated
    private Set<String> roleIds;
    @Deprecated
    private Boolean isAdmin;
    
    // New fields for organization-specific roles and permissions
    private String role; // OWNER, MANAGER, MEMBER
    private List<String> permissions; // Direct permissions list
}


