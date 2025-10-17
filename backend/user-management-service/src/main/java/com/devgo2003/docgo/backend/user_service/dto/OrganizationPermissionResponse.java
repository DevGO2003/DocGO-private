package com.devgo2003.docgo.backend.user_service.dto;

import com.devgo2003.docgo.backend.user_service.entity.OrganizationPermission;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationPermissionResponse {
    private String id;
    private String organizationId;
    private String name;
    private String displayName;
    private String description;
    private String resource;
    private String action;

    public static OrganizationPermissionResponse fromEntity(OrganizationPermission permission) {
        if (permission == null) {
            return null;
        }
        return OrganizationPermissionResponse.builder()
                .id(permission.getId())
                .organizationId(permission.getOrganizationId())
                .name(permission.getName())
                .displayName(permission.getDisplayName())
                .description(permission.getDescription())
                .resource(permission.getResource())
                .action(permission.getAction())
                .build();
    }
}


