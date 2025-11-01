package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.dto.RepositoryDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface IRepositoryService {

    // Basic CRUD operations
    Page<RepositoryDTO> getAllRepositories(Pageable pageable);
    Page<RepositoryDTO> getMyRepositories(String userId, Pageable pageable);
    Page<RepositoryDTO> getPersonalRepositories(String userId, Pageable pageable);
    Page<RepositoryDTO> getOrganizationRepositories(String organizationId, Pageable pageable);
    Page<RepositoryDTO> getUserOrganizationRepositories(String userId, Pageable pageable);
    Optional<RepositoryDTO> getRepositoryById(String id);
    RepositoryDTO createRepository(RepositoryEntity repository);
    RepositoryDTO updateRepository(String id, RepositoryEntity repository);
    void deleteRepository(String id);
    RepositoryDTO restoreRepository(String id);

    // Search operations
    Page<RepositoryDTO> searchRepositories(String searchTerm, Pageable pageable);
    Page<RepositoryDTO> searchPersonalRepositories(String searchTerm, String userId, Pageable pageable);
    Page<RepositoryDTO> searchOrganizationRepositories(String searchTerm, String organizationId, Pageable pageable);
    Page<RepositoryDTO> searchUserOrganizationRepositories(String searchTerm, String userId, Pageable pageable);
    Page<RepositoryDTO> getPublicRepositories(Pageable pageable);
    Page<RepositoryDTO> searchPublicRepositories(String searchTerm, Pageable pageable);

    // Utility operations
    boolean existsByName(String name, String ownerUserId);
    boolean existsByNameForOrganization(String name, String organizationId);
    long countPersonalRepositories(String userId);
    long countOrganizationRepositories(String organizationId);

    // Permission operations
    boolean hasPermission(String repositoryId, String userId, String permission);
    void addPermission(String repositoryId, String userId, String role, List<String> permissions);
    void removePermission(String repositoryId, String userId);
}
