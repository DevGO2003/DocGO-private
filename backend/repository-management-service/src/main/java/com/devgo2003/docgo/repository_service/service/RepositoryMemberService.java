package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.dto.RepositoryMemberDTO;
import com.devgo2003.docgo.repository_service.entity.RepositoryMemberEntity;
import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import com.devgo2003.docgo.repository_service.repository.RepositoryMemberRepository;
import com.devgo2003.docgo.repository_service.repository.RepositoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RepositoryMemberService {
    
    private final RepositoryMemberRepository memberRepository;
    private final RepositoryRepository repositoryRepository;
    private final RestTemplate restTemplate;
    
    private static final String USER_SERVICE_URL = "http://user-management-service:8001/api/v1/user-management-service";
    
    /**
     * Get all members of a repository
     */
    public Page<RepositoryMemberDTO> getRepositoryMembers(String repositoryId, Pageable pageable) {
        log.info("Getting members for repository: {}", repositoryId);
        
        Page<RepositoryMemberEntity> members = memberRepository.findByRepositoryIdAndStatus(
            repositoryId,
            RepositoryMemberEntity.MembershipStatus.ACTIVE,
            pageable
        );
        
        // Enrich with user data
        return members.map(member -> {
            RepositoryMemberDTO dto = RepositoryMemberDTO.fromEntity(member);
            enrichMemberWithUserData(dto, member.getUserId());
            return dto;
        });
    }
    
    /**
     * Add a member to repository
     */
    @Transactional
    public RepositoryMemberDTO addMember(
        String repositoryId,
        String userId,
        String role,
        RepositoryMemberEntity.RepositoryPermissions permissions,
        String invitedBy
    ) {
        log.info("Adding member {} to repository {}", userId, repositoryId);
        
        // Check if repository exists
        RepositoryEntity repository = repositoryRepository.findById(repositoryId)
            .orElseThrow(() -> new RuntimeException("Repository not found: " + repositoryId));
        
        // Check if already a member
        Optional<RepositoryMemberEntity> existing = memberRepository.findByRepositoryIdAndUserId(
            repositoryId, userId
        );
        
        if (existing.isPresent()) {
            throw new RuntimeException("User is already a member of this repository");
        }
        
        // Fetch user data
        Map<String, Object> userData = fetchUserData(userId);
        
        // Create member entity
        RepositoryMemberEntity member = RepositoryMemberEntity.builder()
            .id(UUID.randomUUID().toString())
            .repositoryId(repositoryId)
            .userId(userId)
            .username((String) userData.get("username"))
            .email((String) userData.get("email"))
            .role(role != null ? role : "MEMBER")
            .permissions(permissions != null ? permissions : createDefaultPermissions(role))
            .status(RepositoryMemberEntity.MembershipStatus.ACTIVE)
            .invitedBy(invitedBy)
            .invitedAt(LocalDateTime.now())
            .joinedAt(LocalDateTime.now())
            .createdAt(LocalDateTime.now())
            .updatedAt(LocalDateTime.now())
            .build();
        
        RepositoryMemberEntity saved = memberRepository.save(member);
        log.info("Member added successfully: {}", saved.getId());
        
        return RepositoryMemberDTO.fromEntity(saved);
    }
    
    /**
     * Update member permissions
     */
    @Transactional
    public RepositoryMemberDTO updateMemberPermissions(
        String repositoryId,
        String userId,
        RepositoryMemberEntity.RepositoryPermissions permissions
    ) {
        log.info("Updating permissions for member {} in repository {}", userId, repositoryId);
        
        RepositoryMemberEntity member = memberRepository.findByRepositoryIdAndUserId(
            repositoryId, userId
        ).orElseThrow(() -> new RuntimeException("Member not found"));
        
        member.setPermissions(permissions);
        member.setUpdatedAt(LocalDateTime.now());
        
        RepositoryMemberEntity updated = memberRepository.save(member);
        return RepositoryMemberDTO.fromEntity(updated);
    }
    
    /**
     * Remove a member from repository
     */
    @Transactional
    public void removeMember(String repositoryId, String userId) {
        log.info("Removing member {} from repository {}", userId, repositoryId);
        
        RepositoryMemberEntity member = memberRepository.findByRepositoryIdAndUserId(
            repositoryId, userId
        ).orElseThrow(() -> new RuntimeException("Member not found"));
        
        member.setStatus(RepositoryMemberEntity.MembershipStatus.LEFT);
        member.setLeftAt(LocalDateTime.now());
        member.setUpdatedAt(LocalDateTime.now());
        
        memberRepository.save(member);
        log.info("Member removed successfully");
    }
    
    /**
     * Check if user has permission in repository
     */
    public boolean hasPermission(String repositoryId, String userId, String permission) {
        Optional<RepositoryMemberEntity> member = memberRepository.findByRepositoryIdAndUserId(
            repositoryId, userId
        );
        
        if (member.isEmpty() || member.get().getStatus() != RepositoryMemberEntity.MembershipStatus.ACTIVE) {
            return false;
        }
        
        RepositoryMemberEntity.RepositoryPermissions perms = member.get().getPermissions();
        
        return switch (permission) {
            case "VIEW" -> perms.isCanView();
            case "UPLOAD" -> perms.isCanUpload();
            case "EDIT" -> perms.isCanEdit();
            case "DELETE" -> perms.isCanDelete();
            case "MANAGE_MEMBERS" -> perms.isCanManageMembers();
            case "MANAGE_SETTINGS" -> perms.isCanManageSettings();
            default -> false;
        };
    }
    
    /**
     * Fetch user data from user-management-service
     */
    private Map<String, Object> fetchUserData(String userId) {
        try {
            String url = USER_SERVICE_URL + "/users/" + userId;
            log.debug("Fetching user data from: {}", url);
            
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.get("data") != null) {
                @SuppressWarnings("unchecked")
                Map<String, Object> userData = (Map<String, Object>) response.get("data");
                return userData;
            }
        } catch (Exception e) {
            log.error("Failed to fetch user data for userId {}: {}", userId, e.getMessage());
        }
        
        // Return minimal data if fetch fails
        return Map.of(
            "username", "User-" + userId.substring(0, 8),
            "email", "unknown@example.com"
        );
    }
    
    /**
     * Enrich member DTO with latest user data
     */
    private void enrichMemberWithUserData(RepositoryMemberDTO dto, String userId) {
        try {
            Map<String, Object> userData = fetchUserData(userId);
            dto.setUsername((String) userData.get("username"));
            dto.setEmail((String) userData.get("email"));
        } catch (Exception e) {
            log.debug("Failed to enrich member data: {}", e.getMessage());
        }
    }
    
    /**
     * Create default permissions based on role
     */
    private RepositoryMemberEntity.RepositoryPermissions createDefaultPermissions(String role) {
        if ("OWNER".equals(role) || "ADMIN".equals(role)) {
            return RepositoryMemberEntity.RepositoryPermissions.builder()
                .canView(true)
                .canUpload(true)
                .canEdit(true)
                .canDelete(true)
                .canManageMembers(true)
                .canManageSettings(true)
                .build();
        } else if ("MEMBER".equals(role)) {
            return RepositoryMemberEntity.RepositoryPermissions.builder()
                .canView(true)
                .canUpload(true)
                .canEdit(false)
                .canDelete(false)
                .canManageMembers(false)
                .canManageSettings(false)
                .build();
        } else {
            // VIEWER role
            return RepositoryMemberEntity.RepositoryPermissions.builder()
                .canView(true)
                .canUpload(false)
                .canEdit(false)
                .canDelete(false)
                .canManageMembers(false)
                .canManageSettings(false)
                .build();
        }
    }
}
