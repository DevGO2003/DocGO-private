package com.devgo2003.docgo.repository_service.service.impl;

import com.devgo2003.docgo.repository_service.dto.RepositoryPermissionDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.repository.RepositoryRepository;
import com.devgo2003.docgo.repository_service.service.IRepositoryPermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
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

        if (repository.getPermissions() == null) {
            return List.of();
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
        if (repository.getPermissions() != null) {
            boolean exists = repository.getPermissions().stream()
                .anyMatch(p -> p.getUserId().equals(userId));
            
            if (exists) {
                throw new RuntimeException("User already has permissions in this repository");
            }
        }

        RepositoryEntity.RepositoryPermission permission = RepositoryEntity.RepositoryPermission.builder()
            .userId(userId)
            .role(determineRole(permissions))
            .permissions(permissions)
            .grantedBy(grantedBy)
            .grantedAt(LocalDateTime.now())
            .build();

        if (repository.getPermissions() == null) {
            repository.setPermissions(new java.util.ArrayList<>());
        }
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
        try {
            addPermission(repositoryId, userId, Arrays.asList("VIEW", "DELETE"), grantedBy);
        } catch (RuntimeException e) {
            // User might already have permissions
            log.warn("Could not grant default permissions to user {}: {}", userId, e.getMessage());
        }
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
