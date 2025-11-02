# 🔗 Invite Service Implementation Guide

## Service Interface

**File**: `service/IRepositoryInviteService.java`

```java
package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.dto.RepositoryInviteDTO;
import java.util.List;

public interface IRepositoryInviteService {
    
    RepositoryInviteDTO createInvite(String repositoryId, String invitedBy, Integer expiresInDays);
    
    List<RepositoryInviteDTO> getRepositoryInvites(String repositoryId, String currentUserId);
    
    RepositoryInviteDTO getInviteByToken(String token);
    
    void acceptInvite(String token, String userId);
    
    void revokeInvite(String inviteId, String revokedBy);
    
    void cleanupExpiredInvites();
}
```

---

## Service Implementation

**File**: `service/impl/RepositoryInviteServiceImpl.java`

```java
package com.devgo2003.docgo.repository_service.service.impl;

import com.devgo2003.docgo.repository_service.dto.RepositoryInviteDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.entity.RepositoryInviteEntity;
import com.devgo2003.docgo.repository_service.repository.RepositoryRepository;
import com.devgo2003.docgo.repository_service.repository.RepositoryInviteRepository;
import com.devgo2003.docgo.repository_service.service.IRepositoryInviteService;
import com.devgo2003.docgo.repository_service.service.IRepositoryPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class RepositoryInviteServiceImpl implements IRepositoryInviteService {

    private final RepositoryRepository repositoryRepository;
    private final RepositoryInviteRepository inviteRepository;
    private final IRepositoryPermissionService permissionService;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    @Override
    public RepositoryInviteDTO createInvite(String repositoryId, String invitedBy, Integer expiresInDays) {
        log.info("Creating invite for repository: {} by user: {}", repositoryId, invitedBy);

        RepositoryEntity repository = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found"));

        // Only allow personal repositories to create invite links
        if (!repository.isPersonal()) {
            throw new RuntimeException("Invite links are only available for personal repositories");
        }

        // Check if user is owner
        if (!repository.getOwnerUserId().equals(invitedBy)) {
            throw new RuntimeException("Only repository owner can create invites");
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = expiresInDays != null 
            ? LocalDateTime.now().plusDays(expiresInDays)
            : LocalDateTime.now().plusDays(7); // Default 7 days

        RepositoryInviteEntity invite = RepositoryInviteEntity.builder()
            .token(token)
            .repositoryId(repositoryId)
            .repositoryName(repository.getName())
            .invitedBy(invitedBy)
            .createdAt(LocalDateTime.now())
            .expiresAt(expiresAt)
            .isUsed(false)
            .isRevoked(false)
            .build();

        RepositoryInviteEntity saved = inviteRepository.save(invite);
        log.info("Created invite with token: {}", token);

        return toDTO(saved);
    }

    @Override
    public List<RepositoryInviteDTO> getRepositoryInvites(String repositoryId, String currentUserId) {
        RepositoryEntity repository = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found"));

        // Check if user is owner or has ADMIN permission
        if (!repository.getOwnerUserId().equals(currentUserId) && 
            !permissionService.hasPermission(repositoryId, currentUserId, "ADMIN")) {
            throw new RuntimeException("Insufficient permissions");
        }

        List<RepositoryInviteEntity> invites = inviteRepository.findByRepositoryIdAndIsRevokedFalse(repositoryId);
        return invites.stream()
            .map(this::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public RepositoryInviteDTO getInviteByToken(String token) {
        log.info("Getting invite by token: {}", token);

        RepositoryInviteEntity invite = inviteRepository.findByToken(token)
            .orElseThrow(() -> new RuntimeException("Invite not found"));

        if (invite.getIsRevoked()) {
            throw new RuntimeException("This invite has been revoked");
        }

        if (invite.getIsUsed()) {
            throw new RuntimeException("This invite has already been used");
        }

        if (invite.isExpired()) {
            throw new RuntimeException("This invite has expired");
        }

        return toDTO(invite);
    }

    @Override
    public void acceptInvite(String token, String userId) {
        log.info("User {} accepting invite with token: {}", userId, token);

        RepositoryInviteEntity invite = inviteRepository.findByTokenAndIsUsedFalseAndIsRevokedFalse(token)
            .orElseThrow(() -> new RuntimeException("Invalid or expired invite"));

        if (!invite.isValid()) {
            throw new RuntimeException("Invite is no longer valid");
        }

        String repositoryId = invite.getRepositoryId();

        // Check if user already has access
        RepositoryEntity repository = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found"));

        boolean alreadyHasAccess = repository.getPermissions().stream()
            .anyMatch(p -> p.getUserId().equals(userId));

        if (alreadyHasAccess) {
            throw new RuntimeException("User already has access to this repository");
        }

        // Grant default permissions (VIEW only for invited users)
        permissionService.addPermission(
            repositoryId,
            userId,
            Arrays.asList("VIEW"),
            invite.getInvitedBy()
        );

        // Mark invite as used
        invite.setIsUsed(true);
        invite.setUsedBy(userId);
        invite.setUsedAt(LocalDateTime.now());
        inviteRepository.save(invite);

        log.info("User {} successfully joined repository {} via invite", userId, repositoryId);
    }

    @Override
    public void revokeInvite(String inviteId, String revokedBy) {
        log.info("Revoking invite: {} by user: {}", inviteId, revokedBy);

        RepositoryInviteEntity invite = inviteRepository.findById(inviteId)
            .orElseThrow(() -> new RuntimeException("Invite not found"));

        // Check if user has permission to revoke
        RepositoryEntity repository = repositoryRepository.findByIdAndIsDeletedFalse(invite.getRepositoryId())
            .orElseThrow(() -> new RuntimeException("Repository not found"));

        if (!repository.getOwnerUserId().equals(revokedBy) && 
            !permissionService.hasPermission(invite.getRepositoryId(), revokedBy, "ADMIN")) {
            throw new RuntimeException("Insufficient permissions");
        }

        invite.setIsRevoked(true);
        invite.setRevokedBy(revokedBy);
        invite.setRevokedAt(LocalDateTime.now());
        inviteRepository.save(invite);

        log.info("Invite {} revoked successfully", inviteId);
    }

    @Override
    public void cleanupExpiredInvites() {
        log.info("Cleaning up expired invites");
        // This can be called by a scheduled job
        // For now, we just log. Implementation can delete or mark as expired.
    }

    private RepositoryInviteDTO toDTO(RepositoryInviteEntity entity) {
        String inviteLink = baseUrl + "/invite/" + entity.getToken();

        return RepositoryInviteDTO.builder()
            .id(entity.getId())
            .token(entity.getToken())
            .inviteLink(inviteLink)
            .repositoryId(entity.getRepositoryId())
            .repositoryName(entity.getRepositoryName())
            .invitedBy(entity.getInvitedBy())
            .inviterName(entity.getInviterName())
            .createdAt(entity.getCreatedAt())
            .expiresAt(entity.getExpiresAt())
            .isExpired(entity.isExpired())
            .isUsed(entity.getIsUsed())
            .usedBy(entity.getUserdBy())
            .usedAt(entity.getUsedAt())
            .build();
    }
}
```

---

## Configuration

**File**: `application.properties` (thêm vào)

```properties
# App Base URL for invite links
app.base-url=http://localhost:3000
```

**File**: `application-prod.properties`

```properties
app.base-url=https://your-production-domain.com
```

---

## Scheduled Job (Optional - Cleanup Expired Invites)

**File**: `scheduler/InviteCleanupScheduler.java`

```java
package com.devgo2003.docgo.repository_service.scheduler;

import com.devgo2003.docgo.repository_service.service.IRepositoryInviteService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class InviteCleanupScheduler {

    private final IRepositoryInviteService inviteService;

    // Run every day at 2 AM
    @Scheduled(cron = "0 0 2 * * *")
    public void cleanupExpiredInvites() {
        log.info("Running scheduled invite cleanup");
        inviteService.cleanupExpiredInvites();
    }
}
```

---

## API Endpoints Summary

### Permission APIs:
```
GET    /api/v1/repository-management-service/repositories/{id}/permissions
POST   /api/v1/repository-management-service/repositories/{id}/permissions
PUT    /api/v1/repository-management-service/repositories/{id}/permissions/{userId}
DELETE /api/v1/repository-management-service/repositories/{id}/permissions/{userId}
```

### Invite APIs:
```
POST   /api/v1/repository-management-service/repositories/{id}/invites
GET    /api/v1/repository-management-service/repositories/{id}/invites
GET    /api/v1/repository-management-service/invites/{token}
POST   /api/v1/repository-management-service/invites/{token}/accept
DELETE /api/v1/repository-management-service/invites/{inviteId}
```

---

## Testing

### Test Create Invite:
```bash
curl -X POST http://localhost:8002/api/v1/repository-management-service/repositories/REPO_ID/invites \
  -H "X-User-ID: USER_ID" \
  -H "Content-Type: application/json" \
  -d '{"expiresInDays": 7}'
```

### Test Accept Invite:
```bash
curl -X POST http://localhost:8002/api/v1/repository-management-service/invites/TOKEN/accept \
  -H "X-User-ID: NEW_USER_ID"
```

### Test Add Permission:
```bash
curl -X POST http://localhost:8002/api/v1/repository-management-service/repositories/REPO_ID/permissions \
  -H "X-User-ID: OWNER_ID" \
  -H "Content-Type: application/json" \
  -d '{"userId": "TARGET_USER_ID", "permissions": ["UPLOAD", "VIEW", "DELETE"]}'
```

---

**Backend Implementation Complete!** ✅

Next: Frontend Implementation (see IMPLEMENTATION_GUIDE_FRONTEND.md)
