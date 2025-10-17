package com.devgo2003.docgo.backend.user_service.dto;

import com.devgo2003.docgo.backend.user_service.entity.OrganizationRole;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class OrganizationRoleResponse {
    private String id;
    private String organizationId;
    private String name;
    private String displayName;
    private String description;
    private List<String> permissionIds;

    public static OrganizationRoleResponse fromEntity(OrganizationRole role) {
        if (role == null) {
            return null;
        }
        return OrganizationRoleResponse.builder()
                .id(role.getId())
                .organizationId(role.getOrganizationId())
                .name(role.getName())
                .displayName(role.getDisplayName())
                .description(role.getDescription())
                .permissionIds(role.getPermissionIds() == null ? null : role.getPermissionIds().stream().toList())
                .build();
    }
}


