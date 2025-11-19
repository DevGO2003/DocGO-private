package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.dto.RepositoryDTO;
import com.devgo2003.docgo.repository_service.dto.RepositoryMemberDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import com.devgo2003.docgo.repository_service.service.IRepositoryService;
import com.devgo2003.docgo.repository_service.service.RepositoryMemberService;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
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
import org.springframework.security.core.context.SecurityContextHolder;

import jakarta.validation.Valid;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/repository-management-service/repositories")
@Tag(name = "Repository Management", description = "API quản lý kho lưu trữ tài liệu")
@RequiredArgsConstructor
@Slf4j
public class RepositoryManagementController {

    private final IRepositoryService repositoryService;
    private final RepositoryMemberService repositoryMemberService;
    private final FileRepository fileRepository;

    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả repositories")
    public ResponseEntity<RestResponse<Page<RepositoryDTO>>> getAllRepositories(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String searchTerm
    ) {
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
        // Lấy userId từ SecurityContext nếu không truyền qua query
        String currentUserId = userId;
        if (currentUserId == null) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.devgo2003.docgo.repository_service.security.GatewayUserAuthenticationFilter.GatewayUserPrincipal p) {
                currentUserId = p.userId;
            }
        }
        if (currentUserId == null) {
            currentUserId = "anonymous";
        }
        
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
        // Lấy userId từ SecurityContext nếu không truyền qua query
        String currentUserId = userId;
        if (currentUserId == null) {
            var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.devgo2003.docgo.repository_service.security.GatewayUserAuthenticationFilter.GatewayUserPrincipal p) {
                currentUserId = p.userId;
            }
        }
        if (currentUserId == null) {
            currentUserId = "anonymous";
        }
        
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
    }

    @GetMapping("/organization")
    @Operation(summary = "Lấy danh sách repositories tổ chức mà user tham gia")
    public ResponseEntity<RestResponse<Page<RepositoryDTO>>> getOrganizationRepositories(
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "12") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection,
            @Parameter(description = "Từ khóa tìm kiếm") @RequestParam(required = false) String searchTerm,
            @Parameter(description = "ID của tổ chức (optional)") @RequestParam(required = false) String organizationId
    ) {
        // Lấy userId từ SecurityContext
        String currentUserId = null;
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof com.devgo2003.docgo.repository_service.security.GatewayUserAuthenticationFilter.GatewayUserPrincipal p) {
            currentUserId = p.userId;
        }
        if (currentUserId == null) {
            currentUserId = "anonymous";
        }
        
        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<RepositoryDTO> repositories;
        
        // Nếu có organizationId cụ thể, lấy repos của org đó
        if (organizationId != null && !organizationId.isEmpty()) {
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                repositories = repositoryService.searchOrganizationRepositories(searchTerm, organizationId, pageable);
            } else {
                repositories = repositoryService.getOrganizationRepositories(organizationId, pageable);
            }
        } else {
            // Nếu không có organizationId, lấy TẤT CẢ repos ORGANIZATION mà user là owner
            // (tạm thời dùng cách này, sau có thể cải thiện bằng cách gọi organization-service để lấy danh sách org của user)
            if (searchTerm != null && !searchTerm.trim().isEmpty()) {
                repositories = repositoryService.searchUserOrganizationRepositories(searchTerm, currentUserId, pageable);
            } else {
                repositories = repositoryService.getUserOrganizationRepositories(currentUserId, pageable);
            }
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
    }

    @GetMapping("/public")
    @Operation(summary = "Lấy danh sách repositories công khai")
    public ResponseEntity<RestResponse<Page<RepositoryDTO>>> getPublicRepositories(
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
                repositories = repositoryService.searchPublicRepositories(searchTerm, pageable);
            } else {
                repositories = repositoryService.getPublicRepositories(pageable);
            }

            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã lấy danh sách repositories công khai thành công")
                .data(repositories)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/public")
                .build());

        } catch (Exception e) {
            log.error("Error getting public repositories", e);
            return ResponseEntity.ok(RestResponse.<Page<RepositoryDTO>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy danh sách repositories công khai: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/public")
                .build());
        }
    }

    @GetMapping("/{id}/members")
    @Operation(summary = "Lấy danh sách members của repository")
    public ResponseEntity<RestResponse<Page<RepositoryMemberDTO>>> getRepositoryMembers(
            @Parameter(description = "ID của repository") @PathVariable String id,
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "20") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<RepositoryMemberDTO> members = repositoryMemberService.getRepositoryMembers(id, pageable);

            return ResponseEntity.ok(RestResponse.<Page<RepositoryMemberDTO>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Repository members retrieved successfully")
                .data(members)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id + "/members")
                .build());

        } catch (Exception e) {
            log.error("Error getting repository members", e);
            return ResponseEntity.ok(RestResponse.<Page<RepositoryMemberDTO>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Failed to retrieve repository members: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id + "/members")
                .build());
        }
    }

    @GetMapping("/{id}/activity")
    @Operation(summary = "Lấy activity log của repository")
    public ResponseEntity<RestResponse<Map<String, Object>>> getRepositoryActivity(
            @Parameter(description = "ID của repository") @PathVariable String id,
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        try {
            // TODO: Implement real repository activity functionality
            // This should query activity_logs or similar collection
            var activities = new java.util.ArrayList<Map<String, Object>>();

            var result = new java.util.HashMap<String, Object>();
            result.put("content", activities);
            result.put("totalElements", 0);
            result.put("totalPages", 0);
            result.put("size", size);
            result.put("number", page);
            result.put("first", true);
            result.put("last", true);

            return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Repository activity retrieved successfully")
                .data(result)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id + "/activity")
                .build());

        } catch (Exception e) {
            log.error("Error getting repository activity", e);
            return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Failed to retrieve repository activity: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + id + "/activity")
                .build());
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết repository theo ID (kèm top 5 files mới nhất)")
    public ResponseEntity<RestResponse<RepositoryDTO>> getRepository(
            @Parameter(description = "ID của repository cần lấy") @PathVariable String id) {
        
        try {
            return repositoryService.getRepositoryById(id)
                .map(repository -> {
                    // Lấy top 5 files mới nhất theo updatedAt
                    List<Map<String, Object>> topFiles = new java.util.ArrayList<>();
                    if (repository.getFiles() != null && !repository.getFiles().isEmpty()) {
                        topFiles = repository.getFiles().stream()
                            .sorted((f1, f2) -> {
                                Object t1 = f1.get("updatedAt");
                                Object t2 = f2.get("updatedAt");
                                if (t1 != null && t2 != null) {
                                    return ((Comparable) t2).compareTo(t1);  // Descending
                                }
                                return 0;
                            })
                            .limit(5)
                            .collect(java.util.stream.Collectors.toList());
                    }
                    repository.setFiles(topFiles);
                    
                    return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                        .apiVersion("v1")
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("Đã lấy thông tin repository thành công")
                        .data(repository)
                        .timestamp(Instant.now())
                        .requestId(UUID.randomUUID().toString())
                        .path("/api/v1/repository-management-service/repositories/" + id)
                        .build());
                })
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
            // Lấy userId từ SecurityContext (được Gateway tiêm qua X-User-Id)
            String currentUserId = null;
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof com.devgo2003.docgo.repository_service.security.GatewayUserAuthenticationFilter.GatewayUserPrincipal p) {
                currentUserId = p.userId;
            }

            // Gán ownerUserId nếu body không truyền
            if (repository.getOwnerUserId() == null || repository.getOwnerUserId().isBlank()) {
                repository.setOwnerUserId(currentUserId);
            }

            // Suy ra type nếu thiếu
            if (repository.getType() == null) {
                if (repository.getOrganizationId() != null && !repository.getOrganizationId().isBlank()) {
                    repository.setType(RepositoryEntity.RepositoryType.ORGANIZATION);
                } else {
                    repository.setType(RepositoryEntity.RepositoryType.PERSONAL);
                }
            }

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

    @GetMapping("/{repositoryId}/files")
    @Operation(summary = "Lấy danh sách files của repository")
    public ResponseEntity<RestResponse<Page<FileEntity>>> getRepositoryFiles(
            @Parameter(description = "ID của repository") @PathVariable String repositoryId,
            @Parameter(description = "Số trang (bắt đầu từ 0)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Kích thước trang") @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Sắp xếp theo trường") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Hướng sắp xếp (ASC/DESC)") @RequestParam(defaultValue = "DESC") String sortDirection
    ) {
        try {
            // Validate repository exists
            if (repositoryService.getRepositoryById(repositoryId).isEmpty()) {
                return ResponseEntity.ok(RestResponse.<Page<FileEntity>>builder()
                    .apiVersion("v1")
                    .statusCode(404)
                    .shortMessage("Not Found")
                    .description("Repository không tồn tại")
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/files")
                    .build());
            }

            // Get files with pagination
            Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            Page<FileEntity> files = fileRepository.findByRepositoryIdAndIsDeletedFalse(repositoryId, pageable);

            return ResponseEntity.ok(RestResponse.<Page<FileEntity>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Danh sách files của repository đã được lấy thành công")
                .data(files)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/files")
                .build());

        } catch (Exception e) {
            log.error("Error getting repository files: {}", repositoryId, e);
            return ResponseEntity.ok(RestResponse.<Page<FileEntity>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi lấy danh sách files: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/files")
                .build());
        }
    }

    @GetMapping("/{repositoryId}/files/{fileId}")
    @Operation(summary = "Lấy chi tiết file trong repository (validate repositoryId)")
    public ResponseEntity<RestResponse<RepositoryDTO>> getFileInRepository(
            @Parameter(description = "ID của repository") @PathVariable String repositoryId,
            @Parameter(description = "ID của file") @PathVariable String fileId) {
        
        try {
            // Lấy repository
            return repositoryService.getRepositoryById(repositoryId)
                .map(repository -> {
                    // Kiểm tra file có thuộc repository này không
                    if (repository.getFiles() != null) {
                        boolean fileExists = repository.getFiles().stream()
                            .anyMatch(f -> fileId.equals(f.get("id")));
                        
                        if (!fileExists) {
                            return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                                .apiVersion("v1")
                                .statusCode(404)
                                .shortMessage("Not Found")
                                .description("File không thuộc repository này")
                                .data(null)
                                .timestamp(Instant.now())
                                .requestId(UUID.randomUUID().toString())
                                .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/files/" + fileId)
                                .build());
                        }
                    }
                    
                    return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                        .apiVersion("v1")
                        .statusCode(200)
                        .shortMessage("Success")
                        .description("File hợp lệ trong repository")
                        .data(repository)
                        .timestamp(Instant.now())
                        .requestId(UUID.randomUUID().toString())
                        .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/files/" + fileId)
                        .build());
                })
                .orElse(ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                    .apiVersion("v1")
                    .statusCode(404)
                    .shortMessage("Not Found")
                    .description("Repository không tồn tại")
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/files/" + fileId)
                    .build()));

        } catch (Exception e) {
            log.error("Error validating file in repository: {} - {}", repositoryId, fileId, e);
            return ResponseEntity.ok(RestResponse.<RepositoryDTO>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi kiểm tra file: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/files/" + fileId)
                .build());
        }
    }

    @DeleteMapping("/organization/{organizationId}/delete-all")
    @Operation(summary = "Xóa tất cả repositories của organization (cascade delete)")
    public ResponseEntity<RestResponse<Void>> deleteAllByOrganization(
            @Parameter(description = "ID của organization") @PathVariable String organizationId
    ) {
        log.info("Deleting all repositories for organization: {}", organizationId);
        
        try {
            repositoryService.hardDeleteAllByOrganization(organizationId);
            
            return ResponseEntity.ok(RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã xóa tất cả repositories của organization")
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/organization/" + organizationId + "/delete-all")
                .build());
        } catch (Exception e) {
            log.error("Error deleting repositories for organization: {}", organizationId, e);
            return ResponseEntity.ok(RestResponse.<Void>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi xóa repositories: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/organization/" + organizationId + "/delete-all")
                .build());
        }
    }

    @PatchMapping("/{repositoryId}/members/{memberId}/permissions")
    @Operation(summary = "Cập nhật quyền của thành viên trong repository")
    public ResponseEntity<RestResponse<Map<String, Object>>> updateMemberPermissions(
            @Parameter(description = "ID của repository") @PathVariable String repositoryId,
            @Parameter(description = "ID của member") @PathVariable String memberId,
            @RequestBody Map<String, Boolean> permissionsUpdate
    ) {
        try {
            log.info("Updating permissions for member {} in repository {}", memberId, repositoryId);
            
            // Validate input
            if (permissionsUpdate == null || permissionsUpdate.isEmpty()) {
                return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                    .apiVersion("v1")
                    .statusCode(400)
                    .shortMessage("Bad Request")
                    .description("Permissions update data is required")
                    .data(null)
                    .timestamp(Instant.now())
                    .requestId(UUID.randomUUID().toString())
                    .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/members/" + memberId + "/permissions")
                    .build());
            }

            // TODO: Implement actual permission update logic
            // This would typically involve:
            // 1. Verify user has admin rights for the repository
            // 2. Update member permissions in database
            // 3. Emit event for permission change
            
            Map<String, Object> response = new java.util.HashMap<>();
            response.put("memberId", memberId);
            response.put("repositoryId", repositoryId);
            response.put("permissions", permissionsUpdate);
            response.put("updatedAt", Instant.now());

            return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Đã cập nhật quyền thành viên thành công")
                .data(response)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/members/" + memberId + "/permissions")
                .build());
        } catch (Exception e) {
            log.error("Error updating member permissions: {}", e.getMessage(), e);
            return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Lỗi khi cập nhật quyền: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/" + repositoryId + "/members/" + memberId + "/permissions")
                .build());
        }
    }

    @PostMapping("/admin/migrate-owners")
    @Operation(summary = "Migration: Thêm owner vào members cho tất cả repository hiện có")
    public ResponseEntity<RestResponse<Map<String, Object>>> migrateRepositoryOwners() {
        log.info("Starting migration: Adding owners as members to all repositories");
        
        try {
            int fixed = repositoryService.migrateOwnersToMembers();
            
            return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(200)
                .shortMessage("Success")
                .description("Migration completed successfully")
                .data(Map.of(
                    "totalFixed", fixed,
                    "message", "Added " + fixed + " owners to repository members"
                ))
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/admin/migrate-owners")
                .build());
        } catch (Exception e) {
            log.error("Error during migration: {}", e.getMessage(), e);
            return ResponseEntity.ok(RestResponse.<Map<String, Object>>builder()
                .apiVersion("v1")
                .statusCode(500)
                .shortMessage("Internal Server Error")
                .description("Migration failed: " + e.getMessage())
                .data(null)
                .timestamp(Instant.now())
                .requestId(UUID.randomUUID().toString())
                .path("/api/v1/repository-management-service/repositories/admin/migrate-owners")
                .build());
        }
    }
}
