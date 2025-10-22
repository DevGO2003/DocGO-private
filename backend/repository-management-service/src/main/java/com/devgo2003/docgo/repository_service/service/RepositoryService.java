package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.repository.RepositoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RepositoryService {

    private final RepositoryRepository repositoryRepository;
    private final FileRepository fileRepository;

    /**
     * Tạo repository mới
     */
    @Transactional
    public RepositoryEntity createRepository(String organizationId, String name, 
                                            String description, String type,
                                            String createdBy) {
        log.info("Creating repository: {} for organization: {}", name, organizationId);

        // Check duplicate name
        if (repositoryRepository.existsByOrganizationIdAndName(organizationId, name)) {
            throw new RuntimeException("Repository name already exists: " + name);
        }

        RepositoryEntity repository = RepositoryEntity.builder()
                .name(name)
                .description(description)
                .organizationId(organizationId)
                .type(type)
                .visibility("private")
                .accessControl(createDefaultAccessControl())
                .settings(createDefaultSettings())
                .contractCount(0)
                .totalValue(0.0)
                .currency("VND")
                .createdBy(createdBy)
                .lastActivityAt(LocalDateTime.now())
                .build();

        return repositoryRepository.save(repository);
    }

    private RepositoryEntity.AccessControl createDefaultAccessControl() {
        return RepositoryEntity.AccessControl.builder()
                .viewerRoles(List.of("member", "manager", "admin"))
                .editorRoles(List.of("manager", "admin"))
                .approverRoles(List.of("approver", "manager", "admin"))
                .build();
    }

    private RepositoryEntity.RepositorySettings createDefaultSettings() {
        return RepositoryEntity.RepositorySettings.builder()
                .requireApproval(true)
                .allowVersioning(true)
                .autoArchive(false)
                .allowMemberCreate(true)
                .requireTemplate(false)
                .build();
    }

    /**
     * Get repository by ID
     */
    public RepositoryEntity getRepository(String repositoryId) {
        return repositoryRepository.findById(repositoryId)
                .orElseThrow(() -> new RuntimeException("Repository not found: " + repositoryId));
    }

    /**
     * Get repositories by organization
     */
    public List<RepositoryEntity> getRepositoriesByOrganization(String organizationId) {
        return repositoryRepository.findByOrganizationIdAndDeletedAtIsNull(organizationId);
    }

    /**
     * Update repository
     */
    @Transactional
    public RepositoryEntity updateRepository(String repositoryId, String name, 
                                            String description, String updatedBy) {
        RepositoryEntity repository = getRepository(repositoryId);

        if (name != null) {
            repository.setName(name);
        }
        if (description != null) {
            repository.setDescription(description);
        }
        repository.setUpdatedBy(updatedBy);

        return repositoryRepository.save(repository);
    }

    /**
     * Delete repository (soft delete)
     */
    @Transactional
    public void deleteRepository(String repositoryId, String deletedBy) {
        RepositoryEntity repository = getRepository(repositoryId);
        repository.setDeletedAt(LocalDateTime.now());
        repository.setUpdatedBy(deletedBy);
        repositoryRepository.save(repository);

        log.info("Repository {} deleted by {}", repositoryId, deletedBy);
    }

    /**
     * Add contract to repository
     */
    @Transactional
    public void addContractToRepository(String repositoryId, String contractId) {
        RepositoryEntity repository = getRepository(repositoryId);
        FileEntity contract = fileRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        // Update contract
        contract.setRepositoryId(repositoryId);
        contract.setRepositoryName(repository.getName());
        contract.setOrganizationId(repository.getOrganizationId());
        fileRepository.save(contract);

        // Update repository stats
        repository.setContractCount(repository.getContractCount() + 1);
        if (contract.getTotalValue() != null) {
            repository.setTotalValue(repository.getTotalValue() + contract.getTotalValue());
        }
        repository.setLastActivityAt(LocalDateTime.now());
        repositoryRepository.save(repository);

        log.info("Added contract {} to repository {}", contractId, repositoryId);
    }

    /**
     * Remove contract from repository
     */
    @Transactional
    public void removeContractFromRepository(String repositoryId, String contractId) {
        RepositoryEntity repository = getRepository(repositoryId);
        FileEntity contract = fileRepository.findById(contractId)
                .orElseThrow(() -> new RuntimeException("Contract not found: " + contractId));

        // Update contract
        contract.setRepositoryId(null);
        contract.setRepositoryName(null);
        fileRepository.save(contract);

        // Update repository stats
        repository.setContractCount(Math.max(0, repository.getContractCount() - 1));
        if (contract.getTotalValue() != null) {
            repository.setTotalValue(Math.max(0, repository.getTotalValue() - contract.getTotalValue()));
        }
        repository.setLastActivityAt(LocalDateTime.now());
        repositoryRepository.save(repository);

        log.info("Removed contract {} from repository {}", contractId, repositoryId);
    }

    /**
     * Get contracts by repository
     */
    public List<FileEntity> getContractsByRepository(String repositoryId) {
        return fileRepository.findByRepositoryId(repositoryId);
    }

    /**
     * Check if user can access repository
     */
    public boolean canUserAccessRepository(String userId, String repositoryId, 
                                          List<String> userRoles, String action) {
        RepositoryEntity repository = getRepository(repositoryId);
        RepositoryEntity.AccessControl accessControl = repository.getAccessControl();

        if (accessControl == null) {
            return false;
        }

        switch (action) {
            case "view":
                return hasAnyRole(userRoles, accessControl.getViewerRoles()) ||
                       (accessControl.getViewerUsers() != null && 
                        accessControl.getViewerUsers().contains(userId));

            case "edit":
                return hasAnyRole(userRoles, accessControl.getEditorRoles()) ||
                       (accessControl.getEditorUsers() != null && 
                        accessControl.getEditorUsers().contains(userId));

            case "approve":
                return hasAnyRole(userRoles, accessControl.getApproverRoles()) ||
                       (accessControl.getApproverUsers() != null && 
                        accessControl.getApproverUsers().contains(userId));

            default:
                return false;
        }
    }

    private boolean hasAnyRole(List<String> userRoles, List<String> requiredRoles) {
        if (userRoles == null || requiredRoles == null) {
            return false;
        }
        return userRoles.stream().anyMatch(requiredRoles::contains);
    }
}
