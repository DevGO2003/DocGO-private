package com.devgo2003.docgo.backend.user_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationMemberInviteRequest {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    // Legacy field - for backward compatibility
    private Set<String> roleIds;
    
    // New fields - role name and direct permissions
    private String role; // OWNER, ADMIN, MANAGER, MEMBER
    private List<String> permissions; // Direct permissions list
}


