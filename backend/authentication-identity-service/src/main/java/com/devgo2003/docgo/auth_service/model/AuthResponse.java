package com.devgo2003.docgo.auth_service.model;

import com.devgo2003.docgo.auth_service.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class AuthResponse {
    private boolean success;
    private String message;
    private String token; // access token
    private UserInfo user;
    private String refreshToken; // newly added refresh token

    public AuthResponse(boolean success, String message, String token, UserInfo user, String refreshToken) {
        this.success = success;
        this.message = message;
        this.token = token;
        this.user = user;
        this.refreshToken = refreshToken;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long userId;
        private String username;
        private String email;
        private String role;
    }
}
