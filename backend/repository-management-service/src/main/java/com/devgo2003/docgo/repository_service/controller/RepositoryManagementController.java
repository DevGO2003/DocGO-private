package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.dto.RepositoryDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import com.devgo2003.docgo.repository_service.service.IRepositoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repository-management-service/repositories")
@Tag(name = "Repository Management", description = "API quản lý kho lưu trữ tài liệu")
@RequiredArgsConstructor
@Slf4j
public class RepositoryManagementController {

    private final IRepositoryService repositoryService;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả repositories")
    public ResponseEntity<RestResponse<Page<RepositoryDTO>>> getAllRepositories(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String searchTerm
    ) {
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<RepositoryDTO> repositories;
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                repositories = repositoryService.searchRepositories(searchTerm, pageable);
            } else {
                repositories = repositoryService.getAllRepositories(pageable);
            }

            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách repositories thành công")
                .data(repositories)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories")
                .build());

        } catch (Exception e) {
            log.error("Error getting all repositories", e);
            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy danh sách repositories: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories")
                .build());
        }
    }

    @GetMapping("/my")
    @Operation(summary = "Lấy danh sách repositories của tôi")
    public ResponseEntity<RestResponse<Page<RepositoryDTO>>> getMyRepositories(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "ID của user") @RequestParam(required = false) String userId
    ) {
        try {
            // TODO: Get userId from authentication context
            String currentUserId = userId != null ? userId : "default-user";
            
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<RepositoryDTO> repositories;
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                repositories = repositoryService.searchPersonalRepositories(searchTerm, currentUserId, pageable);
            } else {
                repositories = repositoryService.getMyRepositories(currentUserId, pageable);
            }

            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách repositories của tôi thành công")
                .data(repositories)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/my")
                .build());

        } catch (Exception e) {
            log.error("Error getting my repositories", e);
            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy danh sách repositories của tôi: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/my")
                .build());
        }
    }

    @GetMapping("/personal")
    @Operation(summary = "Lấy danh sách repositories cá nhân")
    public ResponseEntity<RestResponse<Page<RepositoryDTO>>> getPersonalRepositories(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "ID của user") @RequestParam(required = false) String userId
    ) {
        try {
            // TODO: Get userId from authentication context
            String currentUserId = userId != null ? userId : "default-user";
            
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<RepositoryDTO> repositories;
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                repositories = repositoryService.searchPersonalRepositories(searchTerm, currentUserId, pageable);
            } else {
                repositories = repositoryService.getPersonalRepositories(currentUserId, pageable);
            }

            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách repositories cá nhân thành công")
                .data(repositories)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/personal")
                .build());

        } catch (Exception e) {
            log.error("Error getting personal repositories", e);
            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy danh sách repositories cá nhân: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/personal")
                .build());
        }
    }

    @GetMapping("/organization")
    @Operation(summary = "Lấy danh sách repositories tổ chức")
    public ResponseEntity<RestResponse<Page<RepositoryDTO>>> getOrganizationRepositories(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "ID của tổ chức") @RequestParam(required = false) String organizationId
    ) {
        try {
            // TODO: Get organizationId from user context or default
            String currentOrgId = organizationId != null ? organizationId : "default-org";
            
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<RepositoryDTO> repositories;
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                repositories = repositoryService.searchOrganizationRepositories(searchTerm, currentOrgId, pageable);
            } else {
                repositories = repositoryService.getOrganizationRepositories(currentOrgId, pageable);
            }

            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách repositories tổ chức thành công")
                .data(repositories)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/organization")
                .build());

        } catch (Exception e) {
            log.error("Error getting organization repositories", e);
            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy danh sách repositories tổ chức: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/organization")
                .build());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết repository theo ID")
    public ResponseEntity<RestResponse<RepositoryDTO>> getRepository(
            @Parameter(description = "ID của repository cần lấy") @PathVariable String id) {
        
        try {
            return repositoryService.getRepositoryById(id)
                .map(repository -> ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                    .apiVersion("v1")
                    .statusCode(200)
                    .shortMessage("Success")
                    .description("Đã lấy thông tin repository thành công")
                    .data(repository)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories/" + id)
                    .build()))
                .orElse(ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                    .apiVersion("v1")
                    .statusCode(404)
                    .shortMessage("Not Found")
                    .description("Không tìm thấy repository với ID: " + id)
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories/" + id)
                    .build()));

        } catch (Exception e) {
            log.error("Error getting repository by id: {}", id, e);
            return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy thông tin repository: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id)
                .build());
        }
    }

    @PostMapping
    @Operation(summary = "Tạo repository mới")
    public ResponseEntity<RestResponse<RepositoryDTO>> createRepository(
            @Valid @RequestBody RepositoryEntity repository) {
        
        try {
            // Validate repository name uniqueness
            if (repository.isPersonal() && repositoryService.existsByName(repository.getName(), repository.getOwnerUserId())) {
                return ResponseEntity.badRequest().body(RestResponse.<RepositoryDTO>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Repository name already exists for this user")
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories")
                    .build());
            }

            if (repository.isOrganization() && repositoryService.existsByNameForOrganization(repository.getName(), repository.getOrganizationId())) {
                return ResponseEntity.badRequest().body(RestResponse.<RepositoryDTO>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Repository name already exists for this organization")
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories")
                    .build());
            }

            RepositoryDTO created = repositoryService.createRepository(repository);
            
            return ResponseEntity.status(201).body(RestResponse.<RepositoryDTO>builder()
                .apiVersion("v1")
                .statusCode(201)
                .shortMessage("Created")
                .description("Đã tạo repository thành công")
                .data(created)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories")
                .build());

        } catch (Exception e) {
            log.error("Error creating repository", e);
            return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi tạo repository: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories")
                .build());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Cập nhật repository")
    public ResponseEntity<RestResponse<RepositoryDTO>> updateRepository(
            @Parameter(description = "ID của repository cần cập nhật") @PathVariable String id,
            @Valid @RequestBody RepositoryEntity repository) {
        
        try {
            RepositoryDTO updated = repositoryService.updateRepository(id, repository);
            
            return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã cập nhật repository thành công")
                .data(updated)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id)
                .build());

        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                    .apiVersion("v1")
                    .statusCode(404)
                    .shortMessage("Not Found")
                    .description(e.getMessage())
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories/" + id)
                    .build());
            }
            throw e;
        } catch (Exception e) {
            log.error("Error updating repository: {}", id, e);
            return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi cập nhật repository: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id)
                .build());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa repository (soft delete)")
    public ResponseEntity<RestResponse<Void>> deleteRepository(
            @Parameter(description = "ID của repository cần xóa") @PathVariable String id) {
        
        try {
            repositoryService.deleteRepository(id);
            
            return ResponseEntity.ok(RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã xóa repository thành công")
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id)
                .build());

        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.ok(RestResponse.<Void>builder()
                    .apiVersion("v1")
                    .statusCode(404)
                    .shortMessage("Not Found")
                    .description(e.getMessage())
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories/" + id)
                    .build());
            }
            throw e;
        } catch (Exception e) {
            log.error("Error deleting repository: {}", id, e);
            return ResponseEntity.ok(RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi xóa repository: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id)
                .build());
        }
    }
}
