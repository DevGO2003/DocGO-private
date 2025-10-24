package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.common.exception.FileNotFoundException;
import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import com.devgo2003.docgo.repository_service.dto.response.FileResponse;
import com.devgo2003.docgo.repository_service.dto.response.FileListResponse;
import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.dto.request.FileCreateRequest;
import com.devgo2003.docgo.repository_service.dto.request.FileUpdateRequest;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.service.core.IFileService;
import com.devgo2003.docgo.repository_service.service.validation.IFileValidationService;
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

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repository-management-service/files")
@Tag(name = "Repository Management - Files", description = "API quản lý các tệp trong kho lưu trữ")
public class RepositoryController {

    @Autowired
    private IFileService fileService;
    
    @Autowired
    private IFileValidationService validationService;

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

    @PostMapping
    @Operation(summary = "Tạo file mới")
    public ResponseEntity<RestResponse<FileResponse>> createFile(
            @Valid @RequestBody FileCreateRequest request) {
        
        try {
            // Validate request
            List<String> validationErrors = validationService.validateFileCreation(request);
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(RestResponse.<FileResponse>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Dữ liệu đầu vào không hợp lệ: " + String.join(", ", validationErrors))
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/files")
                    .build());
            }
            
            // Create file entity from request
            FileEntity fileEntity = FileEntity.builder()
                .overview(createOverviewFromRequest(request))
                .metadata(request.getMetadata() != null ? request.getMetadata() : new java.util.HashMap<>())
                .storage(request.getStorage() != null ? request.getStorage() : new java.util.HashMap<>())
                .security(request.getSecurity() != null ? request.getSecurity() : new java.util.HashMap<>())
                .build();
            
            // Set audit information
            fileEntity.setCreatedAt(java.time.LocalDateTime.now());
            fileEntity.setCreatedBy(request.getOwnerUserId());
            fileEntity.setUpdatedAt(java.time.LocalDateTime.now());
            fileEntity.setUpdatedBy(request.getOwnerUserId());
            fileEntity.setIsDeleted(false);
            
            // Save file
            FileEntity savedFile = fileService.createFile(fileEntity);
            
            // Convert to response DTO
            FileResponse response = convertToFileResponse(savedFile);
            
            return ResponseEntity.status(201).body(RestResponse.<FileResponse>builder()
                .apiVersion("v1")
                .statusCode(201)
                .shortMessage("Created")
                .description("Đã tạo file thành công")
                .data(response)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files")
                .build());
                
        } catch (Exception e) {
            return ResponseEntity.ok(RestResponse.<FileResponse>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi tạo file: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files")
                .build());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật file")
    public ResponseEntity<RestResponse<FileResponse>> updateFile(
            @Parameter(description = "ID của file cần cập nhật") 
            @PathVariable String id,
            @Valid @RequestBody FileUpdateRequest request) {
        
        try {
            // Validate file ID
            if (!validationService.isValidFileId(id)) {
                throw new FileNotFoundException("Invalid file ID format: " + id);
            }
            
            // Get existing file
            FileEntity existingFile = fileService.getFileById(id)
                .orElseThrow(() -> new FileNotFoundException("File not found with ID: " + id));
            
            // Validate update request
            List<String> validationErrors = validationService.validateFileUpdate(request, existingFile);
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(RestResponse.<FileResponse>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Dữ liệu đầu vào không hợp lệ: " + String.join(", ", validationErrors))
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/files/" + id)
                    .build());
            }
            
            // Update file with new data
            updateFileFromRequest(existingFile, request);
            existingFile.setUpdatedAt(java.time.LocalDateTime.now());
            existingFile.setUpdatedBy("system"); // TODO: Get from authentication context
            
            // Save updated file
            FileEntity updatedFile = fileService.updateFile(id, existingFile);
            
            // Convert to response DTO
            FileResponse response = convertToFileResponse(updatedFile);
            
            return ResponseEntity.ok(RestResponse.<FileResponse>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã cập nhật file thành công")
                .data(response)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id)
                .build());
                
        } catch (FileNotFoundException e) {
            return ResponseEntity.ok(RestResponse.<FileResponse>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description(e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id)
                .build());
        } catch (Exception e) {
            return ResponseEntity.ok(RestResponse.<FileResponse>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi cập nhật file: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id)
                .build());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa file (soft delete)")
    public ResponseEntity<RestResponse<Void>> deleteFile(
            @Parameter(description = "ID của file cần xóa") 
            @PathVariable String id) {
        
        try {
            // Validate file ID
            if (!validationService.isValidFileId(id)) {
                throw new FileNotFoundException("Invalid file ID format: " + id);
            }
            
            // Get existing file
            FileEntity existingFile = fileService.getFileById(id)
                .orElseThrow(() -> new FileNotFoundException("File not found with ID: " + id));
            
            // Validate file status for deletion
            List<String> validationErrors = validationService.validateFileStatus(existingFile, "DELETE");
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(RestResponse.<Void>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Không thể xóa file: " + String.join(", ", validationErrors))
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/files/" + id)
                    .build());
            }
            
            // Perform soft delete
            existingFile.setIsDeleted(true);
            existingFile.setUpdatedAt(java.time.LocalDateTime.now());
            existingFile.setUpdatedBy("system"); // TODO: Get from authentication context
            fileService.updateFile(id, existingFile);
            
            return ResponseEntity.ok(RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã xóa file thành công")
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id)
                .build());
                
        } catch (FileNotFoundException e) {
            return ResponseEntity.ok(RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description(e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id)
                .build());
        } catch (Exception e) {
            return ResponseEntity.ok(RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi xóa file: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id)
                .build());
        }
    }

    @PutMapping("/{id}/restore")
    @Operation(summary = "Khôi phục file đã xóa")
    public ResponseEntity<RestResponse<FileResponse>> restoreFile(
            @Parameter(description = "ID của file cần khôi phục") 
            @PathVariable String id) {
        
        try {
            // Validate file ID
            if (!validationService.isValidFileId(id)) {
                throw new FileNotFoundException("Invalid file ID format: " + id);
            }
            
            // Get existing file
            FileEntity existingFile = fileService.getFileById(id)
                .orElseThrow(() -> new FileNotFoundException("File not found with ID: " + id));
            
            // Validate file status for restoration
            List<String> validationErrors = validationService.validateFileStatus(existingFile, "RESTORE");
            if (!validationErrors.isEmpty()) {
                return ResponseEntity.badRequest().body(RestResponse.<FileResponse>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Không thể khôi phục file: " + String.join(", ", validationErrors))
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/files/" + id + "/restore")
                    .build());
            }
            
            // Restore file
            existingFile.setIsDeleted(false);
            existingFile.setUpdatedAt(java.time.LocalDateTime.now());
            existingFile.setUpdatedBy("system"); // TODO: Get from authentication context
            FileEntity restoredFile = fileService.updateFile(id, existingFile);
            
            // Convert to response DTO
            FileResponse response = convertToFileResponse(restoredFile);
            
            return ResponseEntity.ok(RestResponse.<FileResponse>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã khôi phục file thành công")
                .data(response)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id + "/restore")
                .build());
                
        } catch (FileNotFoundException e) {
            return ResponseEntity.ok(RestResponse.<FileResponse>builder()
                .apiVersion("v1")
                .statusCode(404)
                .shortMessage("Not Found")
                .description(e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id + "/restore")
                .build());
        } catch (Exception e) {
            return ResponseEntity.ok(RestResponse.<FileResponse>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi khôi phục file: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/files/" + id + "/restore")
                .build());
        }
    }

    // ==================== HELPER METHODS ====================

    private java.util.Map<String, Object> createOverviewFromRequest(FileCreateRequest request) {
        java.util.Map<String, Object> overview = new java.util.HashMap<>();
        overview.put("title", request.getTitle());
        overview.put("documentType", request.getDocumentType());
        overview.put("ownerUserId", request.getOwnerUserId());
        overview.put("language", request.getLanguage());
        overview.put("region", request.getRegion());
        overview.put("description", request.getDescription());
        overview.put("status", "UPLOADED");
        return overview;
    }

    private void updateFileFromRequest(FileEntity file, FileUpdateRequest request) {
        if (request.getTitle() != null) {
            file.setName(request.getTitle());
        }
        if (request.getDocumentType() != null) {
            file.setDocumentType(request.getDocumentType());
        }
        if (request.getLanguage() != null) {
            file.setLanguage(request.getLanguage());
        }
        if (request.getRegion() != null) {
            file.setRegion(request.getRegion());
        }
        if (request.getDescription() != null) {
            file.getOverview().put("description", request.getDescription());
        }
        
        // Update sections if provided
        if (request.getOverview() != null) {
            file.getOverview().putAll(request.getOverview());
        }
        if (request.getMetadata() != null) {
            file.getMetadata().putAll(request.getMetadata());
        }
        if (request.getContract() != null) {
            file.getContract().putAll(request.getContract());
        }
        if (request.getContent() != null) {
            file.getContent().putAll(request.getContent());
        }
        if (request.getStorage() != null) {
            file.getStorage().putAll(request.getStorage());
        }
        if (request.getSecurity() != null) {
            file.getSecurity().putAll(request.getSecurity());
        }
        if (request.getVersioning() != null) {
            file.getVersioning().putAll(request.getVersioning());
        }
        if (request.getAudit() != null) {
            file.getAudit().putAll(request.getAudit());
        }
    }

    private FileResponse convertToFileResponse(FileEntity file) {
        return FileResponse.builder()
            .id(file.getId())
            .title(file.getName())
            .documentType(file.getDocumentType())
            .status(file.getStatus())
            .ownerUserId(file.getOwnerUserId())
            .language(file.getLanguage())
            .region(file.getRegion())
            .description((String) file.getOverview().get("description"))
            .mimeType(file.getMimeType())
            .size(file.getSize())
            .createdAt(file.getCreatedAt())
            .updatedAt(file.getUpdatedAt())
            .createdBy(file.getCreatedBy())
            .updatedBy(file.getUpdatedBy())
            .isDeleted(file.getIsDeleted())
            .overview(file.getOverview())
            .metadata(file.getMetadata())
            .build();
    }
}