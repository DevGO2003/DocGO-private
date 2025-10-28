package com.devgo2003.docgo.backend.user_service.dto;

import com.devgo2003.docgo.backend.user_service.entity.User;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStatusRequest {
    
    @NotNull(message = "Status is required")
    private User.UserStatus status;
}
