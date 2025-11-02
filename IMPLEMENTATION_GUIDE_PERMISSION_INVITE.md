# 🚀 Implementation Guide - Permission & Invite System

## 📊 Tổng quan

System này cho phép:
1. **Permission Management**: Quản lý quyền truy cập repository (Upload, View, Delete)
2. **Invite System**: Mời thành viên vào repository
   - Personal Repo: Mời qua link
   - Organization Repo: Chọn từ members của org

---

## 🏗️ PHẦN 1: BACKEND

### 1.1. Entities ✅

#### RepositoryEntity (Đã có - line 108-123)
```java
public static class RepositoryPermission {
    private String userId;
    private String role; // OWNER, ADMIN, EDITOR, VIEWER
    private List<String> permissions; // UPLOAD, VIEW, DELETE
    private String grantedBy;
    private LocalDateTime grantedAt;
}
```

#### RepositoryInviteEntity ✅ (Đã tạo)
```java
@Document(collection = "repository_invites")
public class RepositoryInviteEntity {
    private String id;
    private String token; // UUID
    private String repositoryId;
    private String invitedBy;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isUsed;
    private String usedBy;
    private LocalDateTime usedAt;
    private Boolean isRevoked;
}
```

---

### 1.2. Repository Interfaces (Cần tạo)

**File**: `repository/RepositoryInviteRepository.java`
```java
package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.RepositoryInviteEntity;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface RepositoryInviteRepository extends MongoRepository<RepositoryInviteEntity, String> {
    
    Optional<RepositoryInviteEntity> findByToken(String token);
    
    List<RepositoryInviteEntity> findByRepositoryIdAndIsRevokedFalse(String repositoryId);
    
    List<RepositoryInviteEntity> findByInvitedByAndIsRevokedFalse(String invitedBy);
    
    Optional<RepositoryInviteEntity> findByTokenAndIsUsedFalseAndIsRevokedFalse(String token);
}
```

---

### 1.3. DTOs (Cần tạo)

**File**: `dto/RepositoryPermissionDTO.java`
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryPermissionDTO {
    private String userId;
    private String userName; // Enrich from User Service
    private String role;
    private List<String> permissions; // UPLOAD, VIEW, DELETE
    private String grantedBy;
    private String grantedByName; // Enrich from User Service
    private LocalDateTime grantedAt;
}
```

**File**: `dto/RepositoryInviteDTO.java`
```java
package com.devgo2003.docgo.repository_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RepositoryInviteDTO {
    private String id;
    private String token;
    private String inviteLink; // Full URL: https://app.com/invite/{token}
    private String repositoryId;
    private String repositoryName;
    private String invitedBy;
    private String inviterName;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private Boolean isExpired;
    private Boolean isUsed;
    private String usedBy;
    private LocalDateTime usedAt;
}
```

---

### 1.4. Controllers (Cần tạo)

#### **File**: `controller/RepositoryPermissionController.java`

```java
package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.dto.RepositoryPermissionDTO;
import com.devgo2003.docgo.repository_service.service.IRepositoryPermissionService;
import com.devgo2003.docgo.repository_service.common.response.ApiResponse;
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
    public ResponseEntity<ApiResponse<List<RepositoryPermissionDTO>>> getPermissions(
            @PathVariable String repositoryId,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        List<RepositoryPermissionDTO> permissions = permissionService.getPermissions(repositoryId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(permissions));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RepositoryPermissionDTO>> addPermission(
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
        return ResponseEntity.ok(ApiResponse.success(permission));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<RepositoryPermissionDTO>> updatePermission(
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
        return ResponseEntity.ok(ApiResponse.success(permission));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> removePermission(
            @PathVariable String repositoryId,
            @PathVariable String userId,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        permissionService.removePermission(repositoryId, userId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
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
```

#### **File**: `controller/RepositoryInviteController.java`

```java
package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.dto.RepositoryInviteDTO;
import com.devgo2003.docgo.repository_service.service.IRepositoryInviteService;
import com.devgo2003.docgo.repository_service.common.response.ApiResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/v1/repository-management-service")
@RequiredArgsConstructor
public class RepositoryInviteController {

    private final IRepositoryInviteService inviteService;

    // Create invite link (Personal repository only)
    @PostMapping("/repositories/{repositoryId}/invites")
    public ResponseEntity<ApiResponse<RepositoryInviteDTO>> createInvite(
            @PathVariable String repositoryId,
            @RequestBody CreateInviteRequest request,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        RepositoryInviteDTO invite = inviteService.createInvite(
            repositoryId,
            currentUserId,
            request.getExpiresInDays()
        );
        return ResponseEntity.ok(ApiResponse.success(invite));
    }

    // Get all invites for a repository
    @GetMapping("/repositories/{repositoryId}/invites")
    public ResponseEntity<ApiResponse<List<RepositoryInviteDTO>>> getRepositoryInvites(
            @PathVariable String repositoryId,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        List<RepositoryInviteDTO> invites = inviteService.getRepositoryInvites(repositoryId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(invites));
    }

    // Get invite info by token (public - no auth needed)
    @GetMapping("/invites/{token}")
    public ResponseEntity<ApiResponse<RepositoryInviteDTO>> getInviteByToken(
            @PathVariable String token
    ) {
        RepositoryInviteDTO invite = inviteService.getInviteByToken(token);
        return ResponseEntity.ok(ApiResponse.success(invite));
    }

    // Accept invite (user clicks on invite link)
    @PostMapping("/invites/{token}/accept")
    public ResponseEntity<ApiResponse<Void>> acceptInvite(
            @PathVariable String token,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        inviteService.acceptInvite(token, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    // Revoke invite
    @DeleteMapping("/invites/{inviteId}")
    public ResponseEntity<ApiResponse<Void>> revokeInvite(
            @PathVariable String inviteId,
            @RequestHeader("X-User-ID") String currentUserId
    ) {
        inviteService.revokeInvite(inviteId, currentUserId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @Data
    public static class CreateInviteRequest {
        private Integer expiresInDays = 7; // Default 7 days
    }
}
```

---

### 1.5. Services (Cần tạo)

#### **File**: `service/IRepositoryPermissionService.java`

```java
package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.dto.RepositoryPermissionDTO;
import java.util.List;

public interface IRepositoryPermissionService {
    
    List<RepositoryPermissionDTO> getPermissions(String repositoryId, String currentUserId);
    
    RepositoryPermissionDTO addPermission(String repositoryId, String userId, List<String> permissions, String grantedBy);
    
    RepositoryPermissionDTO updatePermission(String repositoryId, String userId, List<String> permissions, String updatedBy);
    
    void removePermission(String repositoryId, String userId, String removedBy);
    
    boolean hasPermission(String repositoryId, String userId, String permission);
    
    void grantDefaultPermissions(String repositoryId, String userId, String grantedBy);
}
```

#### **File**: `service/impl/RepositoryPermissionServiceImpl.java`

```java
package com.devgo2003.docgo.repository_service.service.impl;

import com.devgo2003.docgo.repository_service.dto.RepositoryPermissionDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.repository.RepositoryRepository;
import com.devgo2003.docgo.repository_service.service.IRepositoryPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RepositoryPermissionServiceImpl implements IRepositoryPermissionService {

    private final RepositoryRepository repositoryRepository;

    @Override
    public List<RepositoryPermissionDTO> getPermissions(String repositoryId, String currentUserId) {
        RepositoryEntity repository = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found"));

        // Check if user has permission to view permissions
        if (!repository.getOwnerUserId().equals(currentUserId) && 
            !hasPermission(repositoryId, currentUserId, "ADMIN")) {
            throw new RuntimeException("Insufficient permissions");
        }

        return repository.getPermissions().stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public RepositoryPermissionDTO addPermission(String repositoryId, String userId, List<String> permissions, String grantedBy) {
        RepositoryEntity repository = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found"));

        // Check if user has permission to grant permissions
        if (!repository.getOwnerUserId().equals(grantedBy) && 
            !hasPermission(repositoryId, grantedBy, "ADMIN")) {
            throw new RuntimeException("Insufficient permissions to grant access");
        }

        // Check if user already has permission
        boolean exists = repository.getPermissions().stream()
            .anyMatch(p -> p.getUserId().equals(userId));
        
        if (exists) {
            throw new RuntimeException("User already has permissions in this repository");
        }

        RepositoryEntity.RepositoryPermission permission = RepositoryEntity.RepositoryPermission.builder()
            .userId(userId)
            .role(determineRole(permissions))
            .permissions(permissions)
            .grantedBy(grantedBy)
            .grantedAt(LocalDateTime.now())
            .build();

        repository.getPermissions().add(permission);
        repository.setUpdatedAt(LocalDateTime.now());
        repositoryRepository.save(repository);

        log.info("Added permission for user {} in repository {}", userId, repositoryId);
        return toDTO(permission);
    }

    @Override
    public RepositoryPermissionDTO updatePermission(String repositoryId, String userId, List<String> permissions, String updatedBy) {
        RepositoryEntity repository = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found"));

        // Check if user has permission to update permissions
        if (!repository.getOwnerUserId().equals(updatedBy) && 
            !hasPermission(repositoryId, updatedBy, "ADMIN")) {
            throw new RuntimeException("Insufficient permissions");
        }

        RepositoryEntity.RepositoryPermission permission = repository.getPermissions().stream()
            .filter(p -> p.getUserId().equals(userId))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Permission not found"));

        permission.setPermissions(permissions);
        permission.setRole(determineRole(permissions));
        repository.setUpdatedAt(LocalDateTime.now());
        repositoryRepository.save(repository);

        log.info("Updated permission for user {} in repository {}", userId, repositoryId);
        return toDTO(permission);
    }

    @Override
    public void removePermission(String repositoryId, String userId, String removedBy) {
        RepositoryEntity repository = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found"));

        // Check if user has permission to remove permissions
        if (!repository.getOwnerUserId().equals(removedBy) && 
            !hasPermission(repositoryId, removedBy, "ADMIN")) {
            throw new RuntimeException("Insufficient permissions");
        }

        repository.getPermissions().removeIf(p -> p.getUserId().equals(userId));
        repository.setUpdatedAt(LocalDateTime.now());
        repositoryRepository.save(repository);

        log.info("Removed permission for user {} from repository {}", userId, repositoryId);
    }

    @Override
    public boolean hasPermission(String repositoryId, String userId, String permission) {
        return repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .map(repo -> repo.hasPermission(userId, permission))
            .orElse(false);
    }

    @Override
    public void grantDefaultPermissions(String repositoryId, String userId, String grantedBy) {
        // Grant default VIEW and DELETE permissions to uploader
        addPermission(repositoryId, userId, Arrays.asList("VIEW", "DELETE"), grantedBy);
    }

    private String determineRole(List<String> permissions) {
        if (permissions.contains("UPLOAD") && permissions.contains("VIEW") && permissions.contains("DELETE")) {
            return "EDITOR";
        } else if (permissions.contains("VIEW") && permissions.contains("DELETE")) {
            return "CONTRIBUTOR";
        } else if (permissions.contains("VIEW")) {
            return "VIEWER";
        }
        return "CUSTOM";
    }

    private RepositoryPermissionDTO toDTO(RepositoryEntity.RepositoryPermission permission) {
        return RepositoryPermissionDTO.builder()
            .userId(permission.getUserId())
            .role(permission.getRole())
            .permissions(permission.getPermissions())
            .grantedBy(permission.getGrantedBy())
            .grantedAt(permission.getGrantedAt())
            .build();
    }
}
```

**Tiếp theo phần Invite Service và Frontend sẽ tạo file riêng do quá dài...**

