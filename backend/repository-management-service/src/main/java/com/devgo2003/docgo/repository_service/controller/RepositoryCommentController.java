package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repository-management-service/files/{fileId}/comments")
@Tag(name = "Repository Management - Comments", description = "API quản lý bình luận cho tệp")
public class RepositoryCommentController {

    @GetMapping
    @Operation(summary = "Lấy danh sách bình luận cho tệp (tạm thời)")
    public ResponseEntity<RestResponse<String>> getFileComments(@PathVariable String fileId) {
        return ResponseEntity.ok(RestResponse.<String>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Test endpoint - chưa implement đầy đủ")
            .data("Comments for file " + fileId)
                .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/api/v1/repository-management-service/files/" + fileId + "/comments")
            .build());
    }
}