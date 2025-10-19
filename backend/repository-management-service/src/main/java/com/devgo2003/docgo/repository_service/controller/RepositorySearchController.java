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
@RequestMapping("/api/v1/repository-management-service/search")
@Tag(name = "Repository Management - Search", description = "API tìm kiếm nâng cao trong kho lưu trữ")
public class RepositorySearchController {

    @GetMapping
    @Operation(summary = "Tìm kiếm tệp trong kho lưu trữ (tạm thời)")
    public ResponseEntity<RestResponse<String>> searchFiles(@RequestParam String query) {
        return ResponseEntity.ok(RestResponse.<String>builder()
            .apiVersion("v1")
            .statusCode(200)
            .shortMessage("Success")
            .description("Test endpoint - chưa implement đầy đủ")
            .data("Search results for " + query)
                .timestamp(Instant.now())
            .requestId(UUID.randomUUID().toString())
            .path("/api/v1/repository-management-service/search?query=" + query)
            .build());
    }
}