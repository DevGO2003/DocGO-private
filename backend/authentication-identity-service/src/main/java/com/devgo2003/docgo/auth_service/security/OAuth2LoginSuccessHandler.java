package com.devgo2003.docgo.auth_service.security;

import com.devgo2003.docgo.auth_service.entity.Role;
import com.devgo2003.docgo.auth_service.entity.User;
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
        DefaultOAuth2User oAuth2User = (DefaultOAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().getOrDefault("email", "");
        String name = (String) oAuth2User.getAttributes().getOrDefault("name", "");
        String username = email != null && !email.isEmpty() ? email : name;

        User user = userRepository.findByUsername(username)
                .orElseGet(() -> userRepository.save(User.builder()
                        .username(username)
                        .email(email)
                        .passwordHash("")
                        .role(Role.EMPLOYEE)
                        .build()));

        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(user.getUserId(), user.getUsername(), user.getEmail(), user.getRole().name());
        String accessToken = jwtUtil.generateAccessToken(user.getUsername(), Map.of(
                "userId", user.getUserId(),
                "role", user.getRole().name()
        ));
        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());

        String body = "{\n" +
                "  \"apiVersion\": \"v1\",\n" +
                "  \"statusCode\": 200,\n" +
                "  \"shortMessage\": \"Success\",\n" +
                "  \"description\": \"Đăng nhập OAuth2 thành công.\",\n" +
                "  \"data\": {\n" +
                "    \"success\": true,\n" +
                "    \"message\": \"OAuth2 login successful\",\n" +
                "    \"token\": \"" + accessToken + "\",\n" +
                "    \"refreshToken\": \"" + refreshToken + "\",\n" +
                "    \"user\": {\n" +
                "      \"userId\": " + userInfo.getUserId() + ",\n" +
                "      \"username\": \"" + userInfo.getUsername() + "\",\n" +
                "      \"email\": \"" + userInfo.getEmail() + "\",\n" +
                "      \"role\": \"" + userInfo.getRole() + "\"\n" +
                "    }\n" +
                "  },\n" +
                "  \"timestamp\": \"" + ZonedDateTime.now().toString() + "\",\n" +
                "  \"requestId\": \"" + UUID.randomUUID().toString() + "\",\n" +
                "  \"path\": \"" + request.getRequestURI() + "\"\n" +
                "}";

        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType("application/json");
        response.getWriter().write(body);
    }
}


