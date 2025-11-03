package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.dto.RepositoryPermissionDTO;
import com.devgo2003.docgo.repository_service.service.IRepositoryPermissionService;
import com.devgo2003.docgo.repository_service.common.response.RestResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/repository-management-service/repositories/{repositoryId}/permissions")
@RequiredArgsConstructor
public class RepositoryPermissionController {

    private final IRepositoryPermissionService permissionService;

    @GetMapping
    public ResponseEntity<RestResponse<List<RepositoryPermissionDTO>>> getPermissions(
            @PathVariable String repositoryId,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        List<RepositoryPermissionDTO> permissions = permissionService.getPermissions(repositoryId, currentUserId);
        return ResponseEntity.ok(RestResponse.success(permissions));
    }

    @PostMapping
    public ResponseEntity<RestResponse<RepositoryPermissionDTO>> addPermission(
            @PathVariable String repositoryId,
            @RequestBody AddPermissionRequest request,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        RepositoryPermissionDTO permission = permissionService.addPermission(
            repositoryId, 
            request.getUserId(), 
            request.getPermissions(),
            currentUserId
        );
        return ResponseEntity.ok(RestResponse.success(permission));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<RestResponse<RepositoryPermissionDTO>> updatePermission(
            @PathVariable String repositoryId,
            @PathVariable String userId,
            @RequestBody UpdatePermissionRequest request,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        RepositoryPermissionDTO permission = permissionService.updatePermission(
            repositoryId,
            userId,
            request.getPermissions(),
            currentUserId
        );
        return ResponseEntity.ok(RestResponse.success(permission));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<RestResponse<Void>> removePermission(
            @PathVariable String repositoryId,
            @PathVariable String userId,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        permissionService.removePermission(repositoryId, userId, currentUserId);
        return ResponseEntity.ok(RestResponse.success(null));
    }

    @Data
    public static class AddPermissionRequest {
        private String userId;
        private List<String> permissions; // ["UPLOAD", "VIEW", "DELETE"]
    }

    @Data
    public static class UpdatePermissionRequest {
        private List<String> permissions;
    }
}
