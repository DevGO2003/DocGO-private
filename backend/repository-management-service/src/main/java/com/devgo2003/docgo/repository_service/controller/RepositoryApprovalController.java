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
@RequestMapping("/api/v1/repository-management-service/files/{fileId}/approvals")
@Tag(name = "Repository Management - Approvals", description = "API quản lý quy trình phê duyệt cho tệp")
public class RepositoryApprovalController {

    @GetMapping
    @Operation(summary = "Lấy danh sách các yêu cầu phê duyệt cho tệp (tạm thời)")
    public ResponseEntity<RestResponse<String>> getFileApprovals(@PathVariable String fileId) {
        return ResponseEntity.ok(RestResponse.<String>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Test endpoint - chưa implement đầy đủ")
            .data("Approvals for file " + fileId)
                .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/api/v1/repository-management-service/files/" + fileId + "/approvals")
            .build());
    }
}