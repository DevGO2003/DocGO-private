package com.devgo2003.docgo.auth_service.controller;

import com.devgo2003.docgo.auth_service.common.response.RestResponse;
import com.devgo2003.docgo.auth_service.model.AuthResponse;
import com.devgo2003.docgo.auth_service.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/authentication-identity-service/auth")
@RequiredArgsConstructor
@Tag(name = "OAuth2", description = "OAuth2 Google authentication endpoints")
public class OAuth2Controller {

    private final AuthService authService;

    @Value("${GOOGLE_CLIENT_ID:}")
    private String googleClientId;

    @Value("${GOOGLE_PROJECT_ID:}")
    private String googleProjectId;

    @Value("${GOOGLE_REDIRECT_URI:}")
    private String googleRedirectUri;

    @GetMapping("/oauth2/test")
    @Operation(
        summary = "OAuth2 Test", 
        description = """
        🔹 Đầu vào
        
        Không có tham số đầu vào
        
        🔹 Đầu ra
        
        📝 data
        Loại: object
        Mô tả: Thông tin cấu hình OAuth2 Google
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK)
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Map<String, Object>>> oauth2Test() {
        String requestId = UUID.randomUUID().toString();
        
        Map<String, Object> testData = Map.of(
            "message", "OAuth2 test endpoint is working",
            "timestamp", ZonedDateTime.now().toString(),
            "oauth2_enabled", !googleClientId.isEmpty(),
            "google_oauth_available", !googleClientId.isEmpty(),
            "google_client_id", googleClientId.isEmpty() ? "Not configured" : googleClientId.substring(0, 20) + "...",
            "google_project_id", googleProjectId.isEmpty() ? "Not configured" : googleProjectId,
            "google_redirect_uri", googleRedirectUri.isEmpty() ? "Not configured" : googleRedirectUri,
            "endpoints", Map.of(
                "authorization_url", "/api/v1/authentication-identity-service/auth/oauth2/authorization/google",
                "callback_url", "/login/oauth2/code/google",
                "test_url", "/api/v1/authentication-identity-service/auth/oauth2/test"
            )
        );
        
        return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("OAuth2 test endpoint hoạt động bình thường")
                .data(testData)
                .timestamp(ZonedDateTime.now())
                .requestId(requestId)
                .path("/api/v1/authentication-identity-service/auth/oauth2/test")
                .build());
    }

    @GetMapping("/oauth2/authorization/google")
    @Operation(
        summary = "Google OAuth2 Authorization", 
        description = """
        🔹 Đầu vào
        
        Không có tham số đầu vào
        
        🔹 Đầu ra
        
        🔄 Redirect
        Loại: HTTP Redirect (302)
        Mô tả: Tự động chuyển hướng đến Google OAuth2 authorization server
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (302: Found - Redirect)
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Map<String, Object>>> googleOAuth2Authorization() {
        String requestId = UUID.randomUUID().toString();
        
        if (googleClientId.isEmpty()) {
            return ResponseEntity.badRequest().body(RestResponse.<Map<String, Object>>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Google OAuth2 chưa được cấu hình")
                    .data(Map.of("error", "Google OAuth2 not configured"))
                    .timestamp(ZonedDateTime.now())
                    .requestId(requestId)
                    .path("/api/v1/authentication-identity-service/auth/oauth2/authorization/google")
                    .build());
        }
        
        // This endpoint will be handled by Spring Security OAuth2
        // The actual redirect happens automatically
        Map<String, Object> responseData = Map.of(
            "message", "Redirecting to Google OAuth2 authorization",
            "google_auth_url", "https://accounts.google.com/o/oauth2/auth",
            "client_id", googleClientId.substring(0, 20) + "...",
            "redirect_uri", googleRedirectUri,
            "note", "This endpoint is handled by Spring Security OAuth2"
        );
        
        return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Sẽ chuyển hướng đến Google OAuth2 authorization server")
                .data(responseData)
                .timestamp(ZonedDateTime.now())
                .requestId(requestId)
                .path("/api/v1/authentication-identity-service/auth/oauth2/authorization/google")
                .build());
    }

    @GetMapping("/oauth2/callback/google")
    @Operation(
        summary = "Google OAuth2 Callback", 
        description = """
        🔹 Đầu vào
        
        🔄 code (query parameter)
        Loại: string
        Mô tả: Authorization code từ Google OAuth2
        
        🔄 state (query parameter)
        Loại: string
        Mô tả: State parameter để bảo mật
        
        🔹 Đầu ra
        
        🔄 Redirect
        Loại: HTTP Redirect (302)
        Mô tả: Tự động chuyển hướng đến frontend với JWT tokens
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (302: Found - Redirect)
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Map<String, Object>>> googleOAuth2Callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String error) {
        String requestId = UUID.randomUUID().toString();
        
        if (error != null) {
            return ResponseEntity.badRequest().body(RestResponse.<Map<String, Object>>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("OAuth2 Error")
                    .description("Google OAuth2 authorization failed: " + error)
                    .data(Map.of("error", error, "state", state))
                    .timestamp(ZonedDateTime.now())
                    .requestId(requestId)
                    .path("/api/v1/authentication-identity-service/auth/oauth2/callback/google")
                    .build());
        }
        
        if (code == null || code.isEmpty()) {
            return ResponseEntity.badRequest().body(RestResponse.<Map<String, Object>>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Authorization code không được cung cấp")
                    .data(Map.of("error", "Missing authorization code"))
                    .timestamp(ZonedDateTime.now())
                    .requestId(requestId)
                    .path("/api/v1/authentication-identity-service/auth/oauth2/callback/google")
                    .build());
        }
        
        // This endpoint will be handled by Spring Security OAuth2
        // The actual token exchange and user creation happens in OAuth2LoginSuccessHandler
        Map<String, Object> responseData = Map.of(
            "message", "OAuth2 callback received",
            "code_received", !code.isEmpty(),
            "state", state != null ? state : "Not provided",
            "note", "This endpoint is handled by Spring Security OAuth2 and OAuth2LoginSuccessHandler"
        );
        
        return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("OAuth2 callback đã được xử lý")
                .data(responseData)
                .timestamp(ZonedDateTime.now())
                .requestId(requestId)
                .path("/api/v1/authentication-identity-service/auth/oauth2/callback/google")
                .build());
    }

    @GetMapping("/oauth2/config")
    @Operation(
        summary = "OAuth2 Configuration Info", 
        description = """
        🔹 Đầu vào
        
        Không có tham số đầu vào
        
        🔹 Đầu ra
        
        📝 data
        Loại: object
        Mô tả: Thông tin cấu hình OAuth2 Google (không bao gồm client_secret)
        
        📊 apiVersion
        Loại: string
        Mô tả: Phiên bản API (v1)
        
        🔢 statusCode
        Loại: integer
        Mô tả: Mã trạng thái HTTP (200: OK)
        
        📋 shortMessage
        Loại: string
        Mô tả: Thông báo ngắn gọn về kết quả
        
        📖 description
        Loại: string
        Mô tả: Mô tả chi tiết về kết quả xử lý
        
        🕒 timestamp
        Loại: string (ISO-8601)
        Mô tả: Thời gian xử lý yêu cầu
        
        🆔 requestId
        Loại: string (UUID)
        Mô tả: Định danh duy nhất của yêu cầu
        
        🛣️ path
        Loại: string
        Mô tả: Đường dẫn API được gọi
        """
    )
    public ResponseEntity<RestResponse<Map<String, Object>>> oauth2Config() {
        String requestId = UUID.randomUUID().toString();
        
        Map<String, Object> configData = Map.of(
            "google_client_id", googleClientId.isEmpty() ? "Not configured" : googleClientId,
            "google_project_id", googleProjectId.isEmpty() ? "Not configured" : googleProjectId,
            "google_auth_uri", "https://accounts.google.com/o/oauth2/auth",
            "google_token_uri", "https://oauth2.googleapis.com/token",
            "google_redirect_uri", googleRedirectUri.isEmpty() ? "Not configured" : googleRedirectUri,
            "google_javascript_origins", "http://localhost:8001,http://localhost:3000",
            "oauth2_enabled", !googleClientId.isEmpty(),
            "endpoints", Map.of(
                "authorization", "/api/v1/authentication-identity-service/auth/oauth2/authorization/google",
                "callback", "/login/oauth2/code/google",
                "test", "/api/v1/authentication-identity-service/auth/oauth2/test",
                "config", "/api/v1/authentication-identity-service/auth/oauth2/config"
            )
        );
        
        return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Thông tin cấu hình OAuth2 Google")
                .data(configData)
                .timestamp(ZonedDateTime.now())
                .requestId(requestId)
                .path("/api/v1/authentication-identity-service/auth/oauth2/config")
                .build());
    }
}
