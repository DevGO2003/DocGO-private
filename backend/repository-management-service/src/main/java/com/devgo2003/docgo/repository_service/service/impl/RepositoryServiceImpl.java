package com.devgo2003.docgo.repository_service.service.impl;

import com.devgo2003.docgo.repository_service.dto.RepositoryDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.RepositoryRepository;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.service.IRepositoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.core.ParameterizedTypeReference;

@Service
@Slf4j
public class RepositoryServiceImpl implements IRepositoryService {

    private final RepositoryRepository repositoryRepository;
    private final FileRepository fileRepository;
    private final RestTemplate restTemplate;
    
    @Value("${user.management.service.url:http://localhost:8001}")
    private String userManagementServiceUrl;
    
    public RepositoryServiceImpl(RepositoryRepository repositoryRepository, 
                                  FileRepository fileRepository,
                                  RestTemplate restTemplate) {
        this.repositoryRepository = repositoryRepository;
        this.fileRepository = fileRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public Page<RepositoryDTO> getAllRepositories(Pageable pageable) {
        log.info("Getting all repositories with pagination: {}", pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByTypeAndIsDeletedFalse(
            RepositoryEntity.RepositoryType.PERSONAL, pageable
        );
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public Page<RepositoryDTO> getMyRepositories(String userId, Pageable pageable) {
        log.info("Getting repositories for user: {} with pagination: {}", userId, pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByOwnerUserIdAndIsDeletedFalse(userId, pageable);
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public Page<RepositoryDTO> getPersonalRepositories(String userId, Pageable pageable) {
        log.info("Getting personal repositories for user: {} with pagination: {}", userId, pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByTypeAndOwnerUserIdAndIsDeletedFalse(
            RepositoryEntity.RepositoryType.PERSONAL, userId, pageable
        );
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public Page<RepositoryDTO> getOrganizationRepositories(String organizationId, Pageable pageable) {
        log.info("Getting organization repositories for org: {} with pagination: {}", organizationId, pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByTypeAndOrganizationIdAndIsDeletedFalse(
            RepositoryEntity.RepositoryType.ORGANIZATION, organizationId, pageable
        );
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public Page<RepositoryDTO> getUserOrganizationRepositories(String userId, Pageable pageable) {
        log.info("Getting all organization repositories for user: {} with pagination: {}", userId, pageable);
        
        try {
            // Call user-management-service để lấy danh sách organizations của user
            List<String> organizationIds = getUserOrganizationIds(userId);
            
            if (organizationIds.isEmpty()) {
                log.info("User {} has no organizations", userId);
                return Page.empty(pageable);
            }
            
            log.info("User {} belongs to {} organizations", userId, organizationIds.size());
            
            // Query repos thuộc các organizations này
            Page<RepositoryEntity> entities = repositoryRepository.findByTypeOrganizationAndOrganizationIdIn(
                organizationIds, pageable
            );
            return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
        } catch (Exception e) {
            log.error("Error getting user organizations from user-management-service: {}", e.getMessage());
            // Fallback: lấy repos mà user là owner
            log.info("Fallback to owner-based query");
            Page<RepositoryEntity> entities = repositoryRepository.findByTypeAndOwnerUserIdAndIsDeletedFalse(
                RepositoryEntity.RepositoryType.ORGANIZATION, userId, pageable
            );
            return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
        }
    }
    
    @SuppressWarnings("unchecked")
    private List<String> getUserOrganizationIds(String userId) {
        try {
            String url = userManagementServiceUrl + "/api/v1/users/" + userId + "/organizations?page=0&size=100";
            log.info("Calling user-management-service: {}", url);
            
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("data")) {
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data != null && data.containsKey("content")) {
                    List<Map<String, Object>> organizations = (List<Map<String, Object>>) data.get("content");
                    return organizations.stream()
                        .map(org -> (String) org.get("id"))
                        .filter(id -> id != null)
                        .collect(Collectors.toList());
                }
            }
            return new ArrayList<>();
        } catch (Exception e) {
            log.error("Failed to fetch user organizations: {}", e.getMessage());
            throw e;
        }
    }
    
    /**
     * Enrich RepositoryDTOs with ownerName by calling User Management Service
     */
    @SuppressWarnings("unchecked")
    private Page<RepositoryDTO> enrichWithUserNames(Page<RepositoryDTO> page) {
        try {
            // Collect unique owner user IDs
            List<String> ownerIds = page.getContent().stream()
                .map(RepositoryDTO::getOwnerUserId)
                .filter(id -> id != null && !id.isEmpty())
                .distinct()
                .collect(Collectors.toList());
            
            if (ownerIds.isEmpty()) {
                return page;
            }
            
            // Call User Management Service bulk API
            String url = userManagementServiceUrl + "/api/v1/user-management-service/users/bulk?ids=" + String.join(",", ownerIds);
            log.info("Fetching user names from: {}", url);
            
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            if (response != null && response.containsKey("data")) {
                List<Map<String, Object>> users = (List<Map<String, Object>>) response.get("data");
                
                // Create userId -> userName map
                Map<String, String> userNameMap = users.stream()
                    .collect(Collectors.toMap(
                        user -> (String) user.get("id"),
                        user -> {
                            String firstName = (String) user.get("firstName");
                            String lastName = (String) user.get("lastName");
                            String username = (String) user.get("username");
                            
                            if (firstName != null && lastName != null) {
                                return firstName + " " + lastName;
                            } else if (firstName != null) {
                                return firstName;
                            } else if (lastName != null) {
                                return lastName;
                            } else if (username != null) {
                                return username;
                            }
                            return "Unknown User";
                        },
                        (existing, replacement) -> existing // Keep first value if duplicate
                    ));
                
                // Populate ownerName
                page.getContent().forEach(dto -> {
                    String ownerName = userNameMap.get(dto.getOwnerUserId());
                    if (ownerName != null) {
                        dto.setOwnerName(ownerName);
                    }
                });
            }
            
            return page;
        } catch (Exception e) {
            log.warn("Failed to enrich with user names: {}", e.getMessage());
            // Return original page if enrichment fails
            return page;
        }
    }

    @Override
    public Optional<RepositoryDTO> getRepositoryById(String id) {
        log.info("Getting repository by id: {}", id);
        return repositoryRepository.findByIdAndIsDeletedFalse(id)
            .map(repo -> {
                RepositoryDTO dto = RepositoryDTO.fromEntity(repo);
                
                // Lấy top 5 files mới nhất theo updatedAt
                try {
                    Pageable pageable = PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "updatedAt"));
                    Page<FileEntity> filesPage = fileRepository.findByRepositoryIdAndIsDeletedFalse(id, pageable);
                    
                    List<Map<String, Object>> topFiles = filesPage.getContent().stream()
                        .map(file -> {
                            Map<String, Object> fileMap = new java.util.HashMap<>();
                            fileMap.put("id", file.getId());
                            fileMap.put("name", file.getOverview() != null ? file.getOverview().get("title") : "Unknown");
                            fileMap.put("updatedAt", file.getUpdatedAt());
                            fileMap.put("createdAt", file.getCreatedAt());
                            fileMap.put("size", file.getMetadata() != null ? file.getMetadata().get("file.size") : null);
                            fileMap.put("contentType", file.getOverview() != null ? file.getOverview().get("contentType") : null);
                            return fileMap;
                        })
                        .collect(java.util.stream.Collectors.toList());
                    
                    dto.setFiles(topFiles);
                } catch (Exception e) {
                    log.warn("Failed to load files for repository {}: {}", id, e.getMessage());
                    dto.setFiles(new java.util.ArrayList<>());
                }
                
                return dto;
            });
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
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public Page<RepositoryDTO> searchPersonalRepositories(String searchTerm, String userId, Pageable pageable) {
        log.info("Searching personal repositories for user: {} with term: {}", userId, searchTerm);
        Page<RepositoryEntity> entities = repositoryRepository.searchPersonalRepositories(searchTerm, userId, pageable);
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public Page<RepositoryDTO> searchOrganizationRepositories(String searchTerm, String organizationId, Pageable pageable) {
        log.info("Searching organization repositories for org: {} with term: {}", organizationId, searchTerm);
        Page<RepositoryEntity> entities = repositoryRepository.searchOrganizationRepositories(searchTerm, organizationId, pageable);
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public Page<RepositoryDTO> searchUserOrganizationRepositories(String searchTerm, String userId, Pageable pageable) {
        log.info("Searching all organization repositories for user: {} with term: {}", userId, searchTerm);
        
        try {
            // Call user-management-service để lấy danh sách organizations của user
            List<String> organizationIds = getUserOrganizationIds(userId);
            
            if (organizationIds.isEmpty()) {
                log.info("User {} has no organizations", userId);
                return Page.empty(pageable);
            }
            
            log.info("User {} belongs to {} organizations", userId, organizationIds.size());
            
            // Search repos thuộc các organizations này
            Page<RepositoryEntity> entities = repositoryRepository.searchOrganizationRepositoriesByIds(
                searchTerm, organizationIds, pageable
            );
            return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
        } catch (Exception e) {
            log.error("Error getting user organizations from user-management-service: {}", e.getMessage());
            // Fallback: search repos mà user là owner
            log.info("Fallback to owner-based search");
            Page<RepositoryEntity> entities = repositoryRepository.searchUserOrganizationRepositories(searchTerm, userId, pageable);
            return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
        }
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

    @Override
    public Page<RepositoryDTO> getPublicRepositories(Pageable pageable) {
        log.info("Getting public repositories with pagination: {}", pageable);
        Page<RepositoryEntity> entities = repositoryRepository.findByIsPublicTrueAndIsDeletedFalse(pageable);
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public Page<RepositoryDTO> searchPublicRepositories(String searchTerm, Pageable pageable) {
        log.info("Searching public repositories with term: {} and pagination: {}", searchTerm, pageable);
        Page<RepositoryEntity> entities = repositoryRepository.searchPublicRepositories(searchTerm, pageable);
        return enrichWithUserNames(entities.map(RepositoryDTO::fromEntity));
    }

    @Override
    public void hardDeleteAllByOrganization(String organizationId) {
        log.info("Hard deleting all repositories for organization: {}", organizationId);
        
        // Find all repositories of this organization (including deleted ones)
        List<RepositoryEntity> repositories = repositoryRepository.findByOrganizationId(organizationId);
        
        if (repositories.isEmpty()) {
            log.info("No repositories found for organization: {}", organizationId);
            return;
        }
        
        // Hard delete all repositories
        repositoryRepository.deleteAll(repositories);
        log.info("Hard deleted {} repositories for organization: {}", repositories.size(), organizationId);
    }
}
