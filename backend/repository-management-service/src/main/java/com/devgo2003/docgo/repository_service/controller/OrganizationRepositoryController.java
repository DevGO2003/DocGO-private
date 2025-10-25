package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.service.RepositoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Organization Repository Controller - Quản lý repositories trong organization
 */
@RestController
@RequestMapping("/api/organizations/{orgId}/repositories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class OrganizationRepositoryController {

    private final RepositoryService repositoryService;

    /**
     * Get all repositories của organization
     * GET /api/organizations/{orgId}/repositories
     */
    @GetMapping
    public ResponseEntity<List<RepositoryEntity>> getRepositories(@PathVariable String orgId) {
        log.info("GET /api/organizations/{}/repositories", orgId);
        
        List<RepositoryEntity> repositories = repositoryService.getRepositoriesByOrganization(orgId);
        return ResponseEntity.ok(repositories);
    }

    /**
     * Create repository mới
     * POST /api/organizations/{orgId}/repositories
     */
    @PostMapping
    public ResponseEntity<RepositoryEntity> createRepository(
            @PathVariable String orgId,
            @RequestBody CreateRepositoryRequest request,
            @RequestHeader("X-User-Id") String userId) {
        log.info("POST /api/organizations/{}/repositories by user {}", orgId, userId);
        
        RepositoryEntity repository = repositoryService.createRepository(
            orgId,
            request.getName(),
            request.getDescription(),
            request.getType(),
            userId
        );
        
        return ResponseEntity.ok(repository);
    }

    /**
     * Get repository by ID
     * GET /api/organizations/{orgId}/repositories/{repoId}
     */
    @GetMapping("/{repoId}")
    public ResponseEntity<RepositoryEntity> getRepository(@PathVariable String repoId) {
        log.info("GET /api/organizations/.../repositories/{}", repoId);
        
        RepositoryEntity repository = repositoryService.getRepository(repoId);
        return ResponseEntity.ok(repository);
    }

    /**
     * Update repository
     * PUT /api/organizations/{orgId}/repositories/{repoId}
     */
    @PutMapping("/{repoId}")
    public ResponseEntity<RepositoryEntity> updateRepository(
            @PathVariable String repoId,
            @RequestBody UpdateRepositoryRequest request,
            @RequestHeader("X-User-Id") String userId) {
        log.info("PUT /api/organizations/.../repositories/{} by user {}", repoId, userId);
        
        RepositoryEntity repository = repositoryService.updateRepository(
            repoId,
            request.getName(),
            request.getDescription(),
            userId
        );
        
        return ResponseEntity.ok(repository);
    }

    /**
     * Delete repository (soft delete)
     * DELETE /api/organizations/{orgId}/repositories/{repoId}
     */
    @DeleteMapping("/{repoId}")
    public ResponseEntity<?> deleteRepository(
            @PathVariable String repoId,
            @RequestHeader("X-User-Id") String userId) {
        log.info("DELETE /api/organizations/.../repositories/{} by user {}", repoId, userId);
        
        repositoryService.deleteRepository(repoId, userId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Repository deleted successfully"
        ));
    }

    /**
     * Get contracts trong repository
     * GET /api/organizations/{orgId}/repositories/{repoId}/contracts
     */
    @GetMapping("/{repoId}/contracts")
    public ResponseEntity<List<FileEntity>> getContracts(@PathVariable String repoId) {
        log.info("GET /api/organizations/.../repositories/{}/contracts", repoId);
        
        List<FileEntity> contracts = repositoryService.getContractsByRepository(repoId);
        return ResponseEntity.ok(contracts);
    }

    /**
     * Add contract vào repository
     * POST /api/organizations/{orgId}/repositories/{repoId}/contracts/{contractId}
     */
    @PostMapping("/{repoId}/contracts/{contractId}")
    public ResponseEntity<?> addContract(
            @PathVariable String repoId,
            @PathVariable String contractId) {
        log.info("POST /api/organizations/.../repositories/{}/contracts/{}", repoId, contractId);
        
        repositoryService.addContractToRepository(repoId, contractId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Contract added to repository successfully"
        ));
    }

    /**
     * Remove contract khỏi repository
     * DELETE /api/organizations/{orgId}/repositories/{repoId}/contracts/{contractId}
     */
    @DeleteMapping("/{repoId}/contracts/{contractId}")
    public ResponseEntity<?> removeContract(
            @PathVariable String repoId,
            @PathVariable String contractId) {
        log.info("DELETE /api/organizations/.../repositories/{}/contracts/{}", repoId, contractId);
        
        repositoryService.removeContractFromRepository(repoId, contractId);
        
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Contract removed from repository successfully"
        ));
    }

    /**
     * Get repository statistics
     * GET /api/organizations/{orgId}/repositories/{repoId}/stats
     */
    @GetMapping("/{repoId}/stats")
    public ResponseEntity<?> getStats(@PathVariable String repoId) {
        log.info("GET /api/organizations/.../repositories/{}/stats", repoId);
        
        RepositoryEntity repository = repositoryService.getRepository(repoId);
        
        return ResponseEntity.ok(Map.of(
            "contractCount", repository.getContractCount(),
            "totalValue", repository.getTotalValue(),
            "currency", repository.getCurrency(),
            "lastActivity", repository.getLastActivityAt()
        ));
    }


    // DTOs
    @lombok.Data
    public static class CreateRepositoryRequest {
        private String name;
        private String description;
        private String type;
    }

    @lombok.Data
    public static class UpdateRepositoryRequest {
        private String name;
        private String description;
    }
}
