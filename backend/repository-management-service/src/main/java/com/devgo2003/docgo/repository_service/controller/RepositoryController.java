package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.service.core.IFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private IFileService fileService;

    @GetMapping
    @Operation(summary = "Lấy danh sách files với phân trang và lọc")
    public ResponseEntity<RestResponse<Page<FileEntity>>> getAllFiles(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "ID của repository để lọc") @RequestParam(required = false) String repositoryId
    ) {
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            Page<FileEntity> files = fileService.getAllFiles(pageable);
            
            return ResponseEntity.ok(RestResponse.<Page<FileEntity>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách files thành công")
                .data(files)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files")
                .build());
                
        } catch (Exception e) {
            return ResponseEntity.ok(RestResponse.<Page<FileEntity>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy danh sách files: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files")
                .build());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết file theo ID")
    public ResponseEntity<RestResponse<FullFileResponseDto>> getFile(
            @Parameter(description = "ID của file cần lấy") 
            @PathVariable String id) {
        
        try {
            FullFileResponseDto fileDto = fileService.getFileDtoById(id).orElse(null);
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