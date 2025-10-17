package com.devgo2003.docgo.backend.user_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationMemberUpdateRequest {
    private Set<String> roleIds;
    private Boolean isAdmin;
}


