package com.devgo2003.docgo.backend.user_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationPermissionUpdateRequest {
    private String name;
    private String displayName;
    private String description;
    private String resource;
    private String action;
}





