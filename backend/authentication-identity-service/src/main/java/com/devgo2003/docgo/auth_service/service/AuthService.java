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
        
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
            savedUser.getUserId(),
            savedUser.getUsername(),
            savedUser.getEmail(),
            savedUser.getRole().name()
        );
        
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
                        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                            user.getUserId(),
                            user.getUsername(),
                            user.getEmail(),
                            user.getRole().name()
                        );
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
    public void blacklist(String token, java.time.Instant expiry) {
        tokenBlacklistService.blacklist(token, expiry);
    }

    public java.util.Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public User save(User user) {
        return userRepository.save(user);
    }
}
