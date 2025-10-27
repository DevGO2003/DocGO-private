package com.devgo2003.docgo.repository_service.service.impl;

import com.devgo2003.docgo.repository_service.dto.RepositoryDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.repository.RepositoryRepository;
import com.devgo2003.docgo.repository_service.service.IRepositoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class RepositoryServiceImpl implements IRepositoryService {

    private final RepositoryRepository repositoryRepository;

    @Override
    public Page<RepositoryDTO> getAllRepositories(Pageable pageable) {
        log.info("Getting all repositories with pagination: {}", pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByTypeAndIsDeletedFalse(
            RepositoryEntity.RepositoryType.PERSONAL, pageable
        );
        return entities.map(RepositoryDTO::fromEntity);
    }

    @Override
    public Page<RepositoryDTO> getMyRepositories(String userId, Pageable pageable) {
        log.info("Getting repositories for user: {} with pagination: {}", userId, pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByOwnerUserIdAndIsDeletedFalse(userId, pageable);
        return entities.map(RepositoryDTO::fromEntity);
    }

    @Override
    public Page<RepositoryDTO> getPersonalRepositories(String userId, Pageable pageable) {
        log.info("Getting personal repositories for user: {} with pagination: {}", userId, pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByTypeAndOwnerUserIdAndIsDeletedFalse(
            RepositoryEntity.RepositoryType.PERSONAL, userId, pageable
        );
        return entities.map(RepositoryDTO::fromEntity);
    }

    @Override
    public Page<RepositoryDTO> getOrganizationRepositories(String organizationId, Pageable pageable) {
        log.info("Getting organization repositories for org: {} with pagination: {}", organizationId, pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByTypeAndOrganizationIdAndIsDeletedFalse(
            RepositoryEntity.RepositoryType.ORGANIZATION, organizationId, pageable
        );
        return entities.map(RepositoryDTO::fromEntity);
    }

    @Override
    public Optional<RepositoryDTO> getRepositoryById(String id) {
        log.info("Getting repository by id: {}", id);
        return repositoryRepository.findByIdAndIsDeletedFalse(id)
            .map(RepositoryDTO::fromEntity);
    }

    @Override
    public RepositoryDTO createRepository(RepositoryEntity repository) {
        log.info("Creating new repository: {}", repository.getName());
        
        // Set audit fields
        repository.setId(UUID.randomUUID().toString());
        repository.setCreatedAt(LocalDateTime.now());
        repository.setUpdatedAt(LocalDateTime.now());
        repository.setCreatedBy(repository.getOwnerUserId());
        repository.setUpdatedBy(repository.getOwnerUserId());
        repository.setIsDeleted(false);

        // Set default settings if not provided
        if (repository.getSettings() == null) {
            repository.setSettings(RepositoryEntity.RepositorySettings.builder().build());
        }

        RepositoryEntity saved = repositoryRepository.save(repository);
        log.info("Repository created successfully with id: {}", saved.getId());
        return RepositoryDTO.fromEntity(saved);
    }

    @Override
    public RepositoryDTO updateRepository(String id, RepositoryEntity repository) {
        log.info("Updating repository: {}", id);
        
        RepositoryEntity existing = repositoryRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Repository not found: " + id));

        // Update fields
        existing.setName(repository.getName());
        existing.setDescription(repository.getDescription());
        existing.setIsPublic(repository.getIsPublic());
        existing.setMetadata(repository.getMetadata());
        existing.setSettings(repository.getSettings());
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy(repository.getUpdatedBy());

        RepositoryEntity saved = repositoryRepository.save(existing);
        log.info("Repository updated successfully: {}", saved.getId());
        return RepositoryDTO.fromEntity(saved);
    }

    @Override
    public void deleteRepository(String id) {
        log.info("Deleting repository: {}", id);
        
        RepositoryEntity existing = repositoryRepository.findByIdAndIsDeletedFalse(id)
            .orElseThrow(() -> new RuntimeException("Repository not found: " + id));

        existing.setIsDeleted(true);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy("system"); // TODO: Get from authentication context

        repositoryRepository.save(existing);
        log.info("Repository deleted successfully: {}", id);
    }

    @Override
    public RepositoryDTO restoreRepository(String id) {
        log.info("Restoring repository: {}", id);
        
        RepositoryEntity existing = repositoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Repository not found: " + id));

        existing.setIsDeleted(false);
        existing.setUpdatedAt(LocalDateTime.now());
        existing.setUpdatedBy("system"); // TODO: Get from authentication context

        RepositoryEntity saved = repositoryRepository.save(existing);
        log.info("Repository restored successfully: {}", saved.getId());
        return RepositoryDTO.fromEntity(saved);
    }

    @Override
    public Page<RepositoryDTO> searchRepositories(String searchTerm, Pageable pageable) {
        log.info("Searching repositories with term: {}", searchTerm);
        Page<RepositoryEntity> entities = repositoryRepository.searchRepositories(searchTerm, pageable);
        return entities.map(RepositoryDTO::fromEntity);
    }

    @Override
    public Page<RepositoryDTO> searchPersonalRepositories(String searchTerm, String userId, Pageable pageable) {
        log.info("Searching personal repositories for user: {} with term: {}", userId, searchTerm);
        Page<RepositoryEntity> entities = repositoryRepository.searchPersonalRepositories(searchTerm, userId, pageable);
        return entities.map(RepositoryDTO::fromEntity);
    }

    @Override
    public Page<RepositoryDTO> searchOrganizationRepositories(String searchTerm, String organizationId, Pageable pageable) {
        log.info("Searching organization repositories for org: {} with term: {}", organizationId, searchTerm);
        Page<RepositoryEntity> entities = repositoryRepository.searchOrganizationRepositories(searchTerm, organizationId, pageable);
        return entities.map(RepositoryDTO::fromEntity);
    }

    @Override
    public boolean existsByName(String name, String ownerUserId) {
        return repositoryRepository.findByNameAndOwnerUserIdAndIsDeletedFalse(name, ownerUserId).isPresent();
    }

    @Override
    public boolean existsByNameForOrganization(String name, String organizationId) {
        return repositoryRepository.findByNameAndOrganizationIdAndIsDeletedFalse(name, organizationId).isPresent();
    }

    @Override
    public long countPersonalRepositories(String userId) {
        return repositoryRepository.countByTypeAndOwnerUserIdAndIsDeletedFalse(
            RepositoryEntity.RepositoryType.PERSONAL, userId
        );
    }

    @Override
    public long countOrganizationRepositories(String organizationId) {
        return repositoryRepository.countByTypeAndOrganizationIdAndIsDeletedFalse(
            RepositoryEntity.RepositoryType.ORGANIZATION, organizationId
        );
    }

    @Override
    public boolean hasPermission(String repositoryId, String userId, String permission) {
        Optional<RepositoryEntity> repo = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId);
        return repo.map(entity -> entity.hasPermission(userId, permission)).orElse(false);
    }

    @Override
    public void addPermission(String repositoryId, String userId, String role, List<String> permissions) {
        RepositoryEntity repo = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found: " + repositoryId));

        RepositoryEntity.RepositoryPermission newPermission = RepositoryEntity.RepositoryPermission.builder()
            .userId(userId)
            .role(role)
            .permissions(permissions)
            .grantedBy("system") // TODO: Get from authentication context
            .grantedAt(LocalDateTime.now())
            .build();

        repo.getPermissions().add(newPermission);
        repo.setUpdatedAt(LocalDateTime.now());
        repo.setUpdatedBy("system");

        repositoryRepository.save(repo);
        log.info("Added permission for user: {} on repository: {}", userId, repositoryId);
    }

    @Override
    public void removePermission(String repositoryId, String userId) {
        RepositoryEntity repo = repositoryRepository.findByIdAndIsDeletedFalse(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found: " + repositoryId));

        repo.getPermissions().removeIf(permission -> permission.getUserId().equals(userId));
        repo.setUpdatedAt(LocalDateTime.now());
        repo.setUpdatedBy("system");

        repositoryRepository.save(repo);
        log.info("Removed permission for user: {} on repository: {}", userId, repositoryId);
    }
}
