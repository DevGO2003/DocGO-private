package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * HealthController - Health check endpoints
 * 
 * Provides health check endpoints for monitoring and load balancers
 * Available at: /actuator/health and /health
 */
@RestController
@RequestMapping("/actuator")
@Tag(name = "Health Check", description = "API kiểm tra trạng thái service")
public class HealthController {

    @GetMapping("/health")
    @Operation(summary = "Kiểm tra trạng thái service")
    public ResponseEntity<RestResponse<Map<String, Object>>> health() {
        Map<String, Object> healthData = new HashMap<>();
        healthData.put("status", "UP");
        healthData.put("service", "repository-management-service");
        healthData.put("version", "1.0.0");
        healthData.put("timestamp", Instant.now().toString());
        healthData.put("uptime", System.currentTimeMillis());
        
        return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Service is healthy")
            .data(healthData)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/actuator/health")
            .build());
    }

    @GetMapping("/info")
    @Operation(summary = "Thông tin service")
    public ResponseEntity<RestResponse<Map<String, Object>>> info() {
        Map<String, Object> infoData = new HashMap<>();
        infoData.put("name", "Repository Management Service");
        infoData.put("description", "API quản lý kho lưu trữ tài liệu cho hệ thống DocGO");
        infoData.put("version", "1.0.0");
        infoData.put("port", 8002);
        infoData.put("docs", "http://localhost:8002/docs");
        
        return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Service information")
            .data(infoData)
            .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/actuator/info")
            .build());
    }
}
