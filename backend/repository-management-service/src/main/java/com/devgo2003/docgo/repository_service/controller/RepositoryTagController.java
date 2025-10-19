package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.file_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repository-management-service/tags")
@Tag(name = "Repository Management - Tags", description = "API quản lý các thẻ (tags) cho tệp")
public class RepositoryTagController {

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả các thẻ (tạm thời)")
    public ResponseEntity<RestResponse<String>> getAllTags() {
        return ResponseEntity.ok(RestResponse.<String>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Test endpoint - chưa implement đầy đủ")
            .data("All tags")
                .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/api/v1/repository-management-service/tags")
            .build());
    }

    @GetMapping("/files/{fileId}")
    @Operation(summary = "Lấy danh sách thẻ của một tệp cụ thể (tạm thời)")
    public ResponseEntity<RestResponse<String>> getFileTags(@PathVariable String fileId) {
        return ResponseEntity.ok(RestResponse.<String>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Test endpoint - chưa implement đầy đủ")
            .data("Tags for file " + fileId)
                .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/api/v1/repository-management-service/tags/files/" + fileId)
            .build());
    }
}