package com.devgo2003.docgo.backend.user_service.controller;

import com.devgo2003.docgo.backend.user_service.common.response.RestResponse;
import com.devgo2003.docgo.backend.user_service.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/user-management-service/dashboard")
@Tag(name = "Dashboard", description = "API thống kê dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardController {

    private final AuthService authService;
    private final RestTemplate restTemplate;

    @Value("${services.repository-management-service.url:http://localhost:8082}")
    private String repositoryServiceUrl;

    @Value("${services.automation-service.url:http://localhost:8083}")
    private String automationServiceUrl;

    @GetMapping("/stats")
    @Operation(summary = "Lấy thống kê dashboard cho user hiện tại")
    public ResponseEntity<RestResponse<Map<String, Object>>> getDashboardStats(
            @RequestHeader(value = "X-User-Id", required = false) String userId
    ) {
        try {
            // Get current user ID from security context if not provided
            String currentUserId = userId;
            if (currentUserId == null || currentUserId.trim().isEmpty()) {
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null && auth.getPrincipal() instanceof com.devgo2003.docgo.backend.user_service.security.JwtAuthenticationFilter.JwtUserPrincipal p) {
                    currentUserId = p.getUserId();
                }
            }

            if (currentUserId == null || currentUserId.trim().isEmpty()) {
                currentUserId = "anonymous";
            }

            Map<String, Object> stats = new HashMap<>();

            // Get repositories count from repository service
            try {
                String repoUrl = repositoryServiceUrl + "/api/v1/repository-management-service/repositories/my?page=0&size=1&userId=" + currentUserId;
                var repoResponse = restTemplate.getForEntity(repoUrl, Map.class);
                if (repoResponse.getStatusCode().is2xxSuccessful() && repoResponse.getBody() != null) {
                    Map<String, Object> data = (Map<String, Object>) repoResponse.getBody().get("data");
                    if (data != null && data.containsKey("totalElements")) {
                        stats.put("repositories", data.get("totalElements"));
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to get repositories count for user {}: {}", currentUserId, e.getMessage());
                stats.put("repositories", 0);
            }

            // Get files count from repository service
            try {
                String filesUrl = repositoryServiceUrl + "/api/v1/repository-management-service/files?page=0&size=1&userId=" + currentUserId;
                var filesResponse = restTemplate.getForEntity(filesUrl, Map.class);
                if (filesResponse.getStatusCode().is2xxSuccessful() && filesResponse.getBody() != null) {
                    Map<String, Object> data = (Map<String, Object>) filesResponse.getBody().get("data");
                    if (data != null && data.containsKey("totalElements")) {
                        stats.put("files", data.get("totalElements"));
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to get files count for user {}: {}", currentUserId, e.getMessage());
                stats.put("files", 0);
            }

            // Get organizations count (user's organizations)
            try {
                String orgUrl = "/api/v1/user-management-service/organizations/my?page=0&size=1"; // Relative URL for same service
                var orgResponse = restTemplate.getForEntity(orgUrl, Map.class);
                if (orgResponse.getStatusCode().is2xxSuccessful() && orgResponse.getBody() != null) {
                    Map<String, Object> data = (Map<String, Object>) orgResponse.getBody().get("data");
                    if (data != null && data.containsKey("totalElements")) {
                        stats.put("organizations", data.get("totalElements"));
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to get organizations count for user {}: {}", currentUserId, e.getMessage());
                stats.put("organizations", 0);
            }

            // Get contracts stats from repository service
            try {
                String contractsUrl = repositoryServiceUrl + "/api/v1/repository-management-service/files?page=0&size=1000&userId=" + currentUserId + "&documentType=CONTRACT";
                var contractsResponse = restTemplate.getForEntity(contractsUrl, Map.class);
                if (contractsResponse.getStatusCode().is2xxSuccessful() && contractsResponse.getBody() != null) {
                    Map<String, Object> data = (Map<String, Object>) contractsResponse.getBody().get("data");
                    if (data != null && data.containsKey("content")) {
                        java.util.List<Map<String, Object>> contracts = (java.util.List<Map<String, Object>>) data.get("content");
                        long totalContracts = contracts.size();
                        long pendingContracts = contracts.stream()
                            .filter(c -> "PENDING_APPROVAL".equals(c.get("status")))
                            .count();
                        long approvedContracts = contracts.stream()
                            .filter(c -> "APPROVED".equals(c.get("status")))
                            .count();

                        stats.put("totalContracts", totalContracts);
                        stats.put("pendingContracts", pendingContracts);
                        stats.put("approvedContracts", approvedContracts);
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to get contracts stats for user {}: {}", currentUserId, e.getMessage());
                stats.put("totalContracts", 0);
                stats.put("pendingContracts", 0);
                stats.put("approvedContracts", 0);
            }

            // Set defaults for missing stats
            stats.putIfAbsent("repositories", 0);
            stats.putIfAbsent("files", 0);
            stats.putIfAbsent("organizations", 0);
            stats.putIfAbsent("totalContracts", 0);
            stats.putIfAbsent("pendingContracts", 0);
            stats.putIfAbsent("approvedContracts", 0);

            return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Dashboard statistics retrieved successfully")
                .data(stats)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/user-management-service/dashboard/stats")
                .build());

        } catch (Exception e) {
            log.error("Error getting dashboard stats", e);
            return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Failed to retrieve dashboard statistics: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/user-management-service/dashboard/stats")
                .build());
        }
    }
}
