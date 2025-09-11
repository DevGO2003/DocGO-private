package com.devgo2003.docgo.auth_service.security;

import com.devgo2003.docgo.auth_service.entity.Role;
import com.devgo2003.docgo.auth_service.entity.User;
import com.devgo2003.docgo.auth_service.entity.UserStatus;
import com.devgo2003.docgo.auth_service.model.AuthResponse;
import com.devgo2003.docgo.auth_service.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public OAuth2LoginSuccessHandler(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        try {
            DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
            String email = (String) oAuth2User.getAttributes().getOrDefault("email", "");
            String name = (String) oAuth2User.getAttributes().getOrDefault("name", "");
            String username = email != null && !email.isEmpty() ? email : name;

            // Log OAuth2 user info for debugging
            System.out.println("OAuth2 User Info:");
            System.out.println("Email: " + email);
            System.out.println("Name: " + name);
            System.out.println("Username: " + username);
            System.out.println("All attributes: " + oAuth2User.getAttributes());

            // Find or create user
            User user = userRepository.findByUsername(username)
                    .orElseGet(() -> {
                        System.out.println("Creating new user for OAuth2: " + username);
                        return userRepository.save(User.builder()
                                .username(username)
                                .email(email)
                                .passwordHash("") // OAuth2 users don't need password
                                .role(Role.EMPLOYEE)
                                .status(UserStatus.ACTIVE)
                                .build());
                    });

            // Generate JWT tokens
            AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(user.getUserId(), user.getUsername(), user.getEmail(), user.getRole().name());
            String accessToken = jwtUtil.generateAccessToken(user.getUsername(), Map.of(
                    "userId", user.getUserId(),
                    "role", user.getRole().name()
            ));
            String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

            System.out.println("Generated tokens for user: " + username);
            System.out.println("Access token: " + accessToken.substring(0, 20) + "...");

            // Redirect to frontend with tokens as URL parameters
            String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:3000") + 
                    "/auth/oauth/callback" +
                    "?token=" + java.net.URLEncoder.encode(accessToken, "UTF-8") +
                    "&refreshToken=" + java.net.URLEncoder.encode(refreshToken, "UTF-8") +
                    "&success=true" +
                    "&username=" + java.net.URLEncoder.encode(username, "UTF-8");
            
            System.out.println("Redirecting to: " + frontendUrl);
            response.sendRedirect(frontendUrl);
            
        } catch (Exception e) {
            System.err.println("OAuth2 success handler error: " + e.getMessage());
            e.printStackTrace();
            
            // Redirect to frontend with error
            String frontendUrl = System.getenv().getOrDefault("FRONTEND_URL", "http://localhost:3000") + 
                    "/auth/login?error=oauth_error";
            response.sendRedirect(frontendUrl);
        }
    }
}


