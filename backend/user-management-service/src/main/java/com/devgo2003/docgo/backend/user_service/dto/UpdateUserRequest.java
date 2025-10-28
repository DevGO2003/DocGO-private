package com.devgo2003.docgo.backend.user_service.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import jakarta.validation.constraints.Email;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {
    
    private String firstName;
    
    private String lastName;
    
    @Email(message = "Email phải hợp lệ")
    private String email;
    
    private String phone;
    
    private String profilePicture;
    
    private String avatarUrl;
}
