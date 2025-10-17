package com.devgo2003.docgo.backend.user_service.dto;

import lombok.Builder;
import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationRoleCreateRequest {

    @NotBlank(message = "Tên vai trò không được để trống")
    private String name;
    private String displayName;
    private String description;
    private Set<String> permissionIds;
}


