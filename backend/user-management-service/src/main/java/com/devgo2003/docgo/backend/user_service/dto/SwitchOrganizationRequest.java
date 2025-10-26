package com.devgo2003.docgo.backend.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SwitchOrganizationRequest {
    
    @NotBlank(message = "Organization ID is required")
    private String organizationId;
}
