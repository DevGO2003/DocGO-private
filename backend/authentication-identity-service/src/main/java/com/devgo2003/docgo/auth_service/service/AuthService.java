package com.devgo2003.docgo.auth_service.service;

import com.devgo2003.docgo.auth_service.entity.User;
import com.devgo2003.docgo.auth_service.entity.Role;
import com.devgo2003.docgo.auth_service.model.AuthResponse;
import com.devgo2003.docgo.auth_service.repository.UserRepository;
import com.devgo2003.docgo.auth_service.security.JwtUtil;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import io.jsonwebtoken.Claims;
import org.springframework.beans.factory.annotation.Autowired;
import com.devgo2003.docgo.auth_service.security.TokenBlacklist;
import com.devgo2003.docgo.auth_service.service.AuthEventService;
import jakarta.servlet.http.HttpServletRequest;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(String username, String email, String password) {
        // Check if username or email already exists
        if (userRepository.findByUsername(username).isPresent()) {
            return new AuthResponse(false, "Username already exists", null, null, null);
        }
        
        if (userRepository.findByEmail(email).isPresent()) {
            return new AuthResponse(false, "Email already exists", null, null, null);
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.EMPLOYEE)
                .build();
        
        User savedUser = userRepository.save(user);
        
        AuthResponse.UserInfo userInfo = createUserInfo(savedUser);
        
        String accessToken = jwtUtil.generateAccessToken(savedUser.getUsername(), Map.of(
            "userId", savedUser.getUserId(),
            "role", savedUser.getRole().name(),
            "tokenVersion", savedUser.getTokenVersion()
        ));
        String refreshToken = jwtUtil.generateRefreshToken(savedUser.getUsername());
        return new AuthResponse(true, "User registered successfully", accessToken, userInfo, refreshToken);
    }

    public AuthResponse login(String username, String password) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (passwordEncoder.matches(password, user.getPasswordHash())) {
                        user.updateLastLogin();
                        userRepository.save(user);
                        AuthResponse.UserInfo userInfo = createUserInfo(user);
                        String accessToken = jwtUtil.generateAccessToken(user.getUsername(), Map.of(
                            "userId", user.getUserId(),
                            "role", user.getRole().name(),
                            "tokenVersion", user.getTokenVersion()
                        ));
                        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());
                        return new AuthResponse(true, "Login successful", accessToken, userInfo, refreshToken);
                    } else {
                        user.incrementFailedLoginAttempts();
                        userRepository.save(user);
                        return new AuthResponse(false, "Invalid password", null, null, null);
                    }
                })
                .orElse(new AuthResponse(false, "User not found", null, null, null));
    }

    public Claims parseRefreshClaims(String token) {
        return jwtUtil.parseClaims(token);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public String generateAccessFor(User user) {
        return jwtUtil.generateAccessToken(user.getUsername(), Map.of(
                "userId", user.getUserId(),
                "role", user.getRole().name()
        ));
    }

    public String generateRefreshFor(User user) {
        return jwtUtil.generateRefreshToken(user.getUsername());
    }

    // Blacklist helpers
    @Autowired
    private TokenBlacklist tokenBlacklistService;
    
    @Autowired
    private AuthEventService authEventService;
    
    public void blacklist(String token, java.time.Instant expiry) {
        tokenBlacklistService.blacklist(token, expiry);
    }

    public java.util.Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    /**
     * Create UserInfo from User entity with all fields
     */
    private AuthResponse.UserInfo createUserInfo(User user) {
        // Extract firstName and lastName from fullName if available
        String firstName = "";
        String lastName = "";
        if (user.getFullName() != null && !user.getFullName().trim().isEmpty()) {
            String[] nameParts = user.getFullName().trim().split("\\s+");
            if (nameParts.length > 0) {
                firstName = nameParts[0];
                if (nameParts.length > 1) {
                    lastName = String.join(" ", java.util.Arrays.copyOfRange(nameParts, 1, nameParts.length));
                }
            }
        }

        return new AuthResponse.UserInfo(
            user.getUserId(),
            user.getUsername(),
            user.getEmail(),
            user.getRole().name(),
            firstName,
            lastName,
            user.getStatus().name(),
            user.getFullName(),
            user.getDepartment(),
            user.getPosition(),
            user.getAvatarUrl(),
            user.getApprovalLevel(),
            user.getMaxContractValue()
        );
    }

    /**
     * Create AuthResponse with token expiration info
     */
    public AuthResponse createAuthResponse(boolean success, String message, String token, User user, String refreshToken) {
        AuthResponse.UserInfo userInfo = createUserInfo(user);
        return new AuthResponse(success, message, token, userInfo, refreshToken, 3600L, "Bearer");
    }

    /**
     * Login with Kafka event publishing
     */
    public AuthResponse loginWithEvents(String username, String password, HttpServletRequest request) {
        return userRepository.findByUsername(username)
                .map(user -> {
                    if (passwordEncoder.matches(password, user.getPasswordHash())) {
                        user.updateLastLogin();
                        userRepository.save(user);
                        
                        // Publish login success event
                        authEventService.publishLoginEvent(user, request, true, null);
                        
                        AuthResponse.UserInfo userInfo = createUserInfo(user);
                        String accessToken = jwtUtil.generateAccessToken(user.getUsername(), Map.of(
                            "userId", user.getUserId(),
                            "role", user.getRole().name(),
                            "tokenVersion", user.getTokenVersion()
                        ));
                        String refreshToken = jwtUtil.generateRefreshToken(user.getUsername());
                        return new AuthResponse(true, "Login successful", accessToken, userInfo, refreshToken, 3600L, "Bearer");
                    } else {
                        user.incrementFailedLoginAttempts();
                        userRepository.save(user);
                        
                        // Publish login failure event
                        authEventService.publishLoginEvent(user, request, false, "Invalid password");
                        
                        return new AuthResponse(false, "Invalid password", null, null, null);
                    }
                })
                .orElseGet(() -> {
                    // Publish login failure event for non-existent user
                    User dummyUser = User.builder()
                            .userId(0L)
                            .username(username)
                            .email("")
                            .build();
                    authEventService.publishLoginEvent(dummyUser, request, false, "User not found");
                    
                    return new AuthResponse(false, "User not found", null, null, null);
                });
    }

    /**
     * Register with Kafka event publishing
     */
    public AuthResponse registerWithEvents(String username, String email, String password, HttpServletRequest request) {
        // Check if username or email already exists
        if (userRepository.findByUsername(username).isPresent()) {
            // Publish registration failure event
            User dummyUser = User.builder()
                    .userId(0L)
                    .username(username)
                    .email(email)
                    .build();
            authEventService.publishRegisterEvent(dummyUser, request, false, "Username already exists");
            
            return new AuthResponse(false, "Username already exists", null, null, null);
        }
        
        if (userRepository.findByEmail(email).isPresent()) {
            // Publish registration failure event
            User dummyUser = User.builder()
                    .userId(0L)
                    .username(username)
                    .email(email)
                    .build();
            authEventService.publishRegisterEvent(dummyUser, request, false, "Email already exists");
            
            return new AuthResponse(false, "Email already exists", null, null, null);
        }

        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role(Role.EMPLOYEE)
                .build();
        
        User savedUser = userRepository.save(user);
        
        // Publish registration success event
        authEventService.publishRegisterEvent(savedUser, request, true, null);
        
        AuthResponse.UserInfo userInfo = createUserInfo(savedUser);
        
        String accessToken = jwtUtil.generateAccessToken(savedUser.getUsername(), Map.of(
            "userId", savedUser.getUserId(),
            "role", savedUser.getRole().name(),
            "tokenVersion", savedUser.getTokenVersion()
        ));
        String refreshToken = jwtUtil.generateRefreshToken(savedUser.getUsername());
        return new AuthResponse(true, "User registered successfully", accessToken, userInfo, refreshToken, 3600L, "Bearer");
    }

    /**
     * Logout with Kafka event publishing
     */
    public void logoutWithEvents(User user, String token, HttpServletRequest request) {
        try {
            String rawToken = token.replace("Bearer ", "");
            var claims = jwtUtil.parseClaims(rawToken);
            var expiry = claims.getExpiration().toInstant();
            tokenBlacklistService.blacklist(rawToken, expiry);
            
            // Publish logout event
            authEventService.publishLogoutEvent(user, request);
        } catch (Exception e) {
            // Still publish logout event even if token parsing fails
            authEventService.publishLogoutEvent(user, request);
        }
    }

    /**
     * Refresh token with Kafka event publishing
     */
    public AuthResponse refreshTokenWithEvents(String refreshToken, HttpServletRequest request) {
        try {
            String token = refreshToken.replace("Bearer ", "");
            var claims = jwtUtil.parseClaims(token);
            var username = claims.getSubject();
            var userOpt = userRepository.findByUsername(username);
            
            if (userOpt.isPresent()) {
                var user = userOpt.get();
                var accessToken = jwtUtil.generateAccessToken(user.getUsername(), Map.of(
                        "userId", user.getUserId(),
                        "role", user.getRole().name(),
                        "tokenVersion", user.getTokenVersion()
                ));
                var newRefreshToken = jwtUtil.generateRefreshToken(user.getUsername());
                
                // Publish refresh token success event
                authEventService.publishRefreshTokenEvent(user, request, true, null);
                
                return createAuthResponse(true, "Token refreshed successfully", accessToken, user, newRefreshToken);
            } else {
                // Publish refresh token failure event
                User dummyUser = User.builder()
                        .userId(0L)
                        .username(username)
                        .email("")
                        .build();
                authEventService.publishRefreshTokenEvent(dummyUser, request, false, "User not found");
                
                return new AuthResponse(false, "Invalid refresh token", null, null, null);
            }
        } catch (Exception e) {
            // Publish refresh token failure event
            User dummyUser = User.builder()
                    .userId(0L)
                    .username("unknown")
                    .email("")
                    .build();
            authEventService.publishRefreshTokenEvent(dummyUser, request, false, e.getMessage());
            
            return new AuthResponse(false, "Invalid refresh token: " + e.getMessage(), null, null, null);
        }
    }
}
