package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.service.FileService;
import org.springframework.beans.factory.annotation.Autowired;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repository-management-service/files")
@Tag(name = "Repository Management - Files", description = "API quản lý các tệp trong kho lưu trữ")
public class RepositoryController {

    @Autowired
    private FileService fileService;

    @GetMapping("/test")
    @Operation(summary = "Test endpoint đơn giản")
    public ResponseEntity<RestResponse<String>> testEndpoint() {
        return ResponseEntity.ok(RestResponse.<String>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Test endpoint hoạt động từ RepositoryController!")
            .data("Hello from RepositoryController!")
                .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/api/v1/repository-management-service/files/test")
            .build());
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách files (tạm thời)")
    public ResponseEntity<RestResponse<String>> getAllFiles() {
        return ResponseEntity.ok(RestResponse.<String>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Test endpoint - chưa implement đầy đủ")
            .data("Test data for files list")
                .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/api/v1/repository-management-service/files")
            .build());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết file theo ID")
    public ResponseEntity<RestResponse<FullFileResponseDto>> getFile(
            @Parameter(description = "ID của file cần lấy") 
            @PathVariable String id) {
        
        try {
            FullFileResponseDto fileDto = fileService.getFullFileById(id);
            if (fileDto == null) {
                return ResponseEntity.ok(RestResponse.<FullFileResponseDto>builder()
                    .apiVersion("v1")
                    .statusCode(404)
                    .shortMessage("Not Found")
                    .description("Không tìm thấy file với ID: " + id)
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/files/" + id)
                    .build());
            }
            
            return ResponseEntity.ok(RestResponse.<FullFileResponseDto>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy thông tin file thành công")
                .data(fileDto)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id)
                .build());
                
        } catch (Exception e) {
            return ResponseEntity.ok(RestResponse.<FullFileResponseDto>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy thông tin file: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id)
                .build());
        }
    }
}