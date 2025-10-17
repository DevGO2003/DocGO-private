package com.devgo2003.docgo.backend.user_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationRoleUpdateRequest {
    private String name;
    private String displayName;
    private String description;
    private Set<String> permissionIds;
}


