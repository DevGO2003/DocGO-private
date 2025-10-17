package com.devgo2003.docgo.backend.user_service.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrganizationTransferOwnershipRequest {
    @NotBlank
    private String newOwnerId;
}





