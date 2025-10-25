package com.devgo2003.docgo.backend.user_service.service;

import com.devgo2003.docgo.backend.user_service.dto.*;
import com.devgo2003.docgo.backend.user_service.entity.*;
import com.devgo2003.docgo.backend.user_service.repository.*;
import com.devgo2003.docgo.backend.user_service.common.exception.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMembershipRepository membershipRepository;
    private final OrganizationRoleRepository roleRepository;
    private final OrganizationPermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final InvitationRepository invitationRepository;
    private final OrganizationPermissionService permissionService;
    private final OrganizationRoleService roleService;
    private final WorkflowService workflowService;

    public Page<OrganizationResponse> getAllOrganizations(int pageNumber, int pageSize, String sortBy, String sortDirection) {
        log.info("Getting all organizations - page: {}, size: {}, sortBy: {}, sortDirection: {}", 
                pageNumber, pageSize, sortBy, sortDirection);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        Page<Organization> organizations = organizationRepository.findAllActive(pageable);
        
        return organizations.map(OrganizationResponse::fromEntity);
    }

    public Page<OrganizationResponse> getMyOrganizations(String username, int pageNumber, int pageSize) {
        log.info("🔍 Getting organizations for user: {}, page: {}, size: {}", username, pageNumber, pageSize);

        // Tìm user theo username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy user: " + username));

        // Tạo pageable
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "joinedAt"));
        
        // Lấy tất cả organizations mà user là member
        Page<OrganizationMembership> memberships = membershipRepository.findByUserId(user.getId(), pageable);
        
        // Convert sang OrganizationResponse
        return memberships.map(membership -> {
            // Lấy organization từ repository
            Organization org = organizationRepository.findById(membership.getOrganizationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy organization: " + membership.getOrganizationId()));
            
            OrganizationResponse response = OrganizationResponse.fromEntity(org);
            
            // Thêm thông tin role của user trong org này
            response.setUserRole(membership.getSimpleRole());
            
            // Thêm permissions
            if (membership.getPermissions() != null) {
                response.setUserPermissions(membership.getPermissions());
            }
            
            return response;
        });
    }

    public Optional<OrganizationResponse> getOrganizationById(String id) {
        log.info("Getting organization by id: {}", id);
        
        return organizationRepository.findById(id)
                .filter(org -> org.getDeletedAt() == null)
                .map(OrganizationResponse::fromEntity);
    }

    public Optional<OrganizationResponse> getOrganizationByIdWithUserRole(String id, String currentUserId) {
        log.info("Getting organization by id: {} for user: {}", id, currentUserId);
        
        return organizationRepository.findById(id)
                .filter(org -> org.getDeletedAt() == null)
                .map(org -> {
                    OrganizationResponse response = OrganizationResponse.fromEntity(org);
                    
                    log.info("Checking role for user {} in org {}", currentUserId, id);
                    log.info("Organization ownerUserId: {}", org.getOwnerUserId());
                    log.info("Are they equal? {}", org.getOwnerUserId().equals(currentUserId));
                    
                    // Determine user's role in this organization
                    if (org.getOwnerUserId() != null && org.getOwnerUserId().equals(currentUserId)) {
                        response.setUserRole("OWNER");
                        log.info("✅ User is OWNER");
                    } else if (org.getAdminUserIds() != null && org.getAdminUserIds().contains(currentUserId)) {
                        response.setUserRole("MANAGER");
                        log.info("✅ User is MANAGER");
                        // TODO: Get user's specific permissions from membership
                    } else if (org.getUserIds() != null && org.getUserIds().contains(currentUserId)) {
                        response.setUserRole("MEMBER");
                        log.info("✅ User is MEMBER");
                    } else {
                        response.setUserRole("MEMBER"); // Default
                        log.info("⚠️ User not found in org, defaulting to MEMBER");
                    }
                    
                    log.info("Final role for user {} in organization {}: {}", currentUserId, id, response.getUserRole());
                    return response;
                });
    }

    public Optional<OrganizationResponse> getOrganizationByCode(String code) {
        log.info("Getting organization by code: {}", code);
        
        return organizationRepository.findByCode(code)
                .filter(org -> org.getDeletedAt() == null)
                .map(OrganizationResponse::fromEntity);
    }

    public OrganizationResponse createOrganization(OrganizationCreateRequest request) {
        log.info("Creating organization with name: {}", request.getName());
        log.info("Owner User ID from request: {}", request.getOwnerUserId());

        // Kiểm tra trùng lặp
        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            if (organizationRepository.existsByCode(request.getCode())) {
                throw new DuplicateOrganizationException("Mã tổ chức đã tồn tại: " + request.getCode());
            }
        }

        if (organizationRepository.existsByName(request.getName())) {
            throw new DuplicateOrganizationException("Tên tổ chức đã tồn tại: " + request.getName());
        }

        Organization organization = Organization.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .address(request.getAddress())
                .phone(request.getPhone())
                .email(request.getEmail())
                .website(request.getWebsite())
                .status(Organization.OrganizationStatus.ACTIVE)
                .ownerUserId(request.getOwnerUserId())
                .adminUserIds(List.of(request.getOwnerUserId()))
                .memberCount(1)
                .settings(Organization.OrganizationSettings.builder()
                        .allowMemberInvite(true)
                        .requireAdminApproval(false)
                        .build())
                .build();

        Organization savedOrganization = organizationRepository.save(organization);
        log.info("Saved organization with ID: {}, Owner: {}", savedOrganization.getId(), savedOrganization.getOwnerUserId());
        
        // Tạo membership cho owner
        OrganizationMembership ownerMembership = OrganizationMembership.builder()
                .id(UUID.randomUUID().toString())
                .organizationId(savedOrganization.getId())
                .userId(request.getOwnerUserId())
                .isAdmin(true)
                .status(OrganizationMembership.MembershipStatus.ACTIVE)
                .permissions(List.of("all"))
                .build();
        membershipRepository.save(ownerMembership);
        log.info("Created owner membership for user: {}", request.getOwnerUserId());
        
        // Khởi tạo dữ liệu mặc định
        initializeDefaultData(savedOrganization.getId());
        
        log.info("Created organization with id: {}", savedOrganization.getId());

        return OrganizationResponse.fromEntity(savedOrganization);
    }

    public Optional<OrganizationResponse> updateOrganization(String id, OrganizationUpdateRequest request) {
        log.info("Updating organization with id: {}", id);

        return organizationRepository.findById(id)
                .filter(org -> org.getDeletedAt() == null)
                .map(organization -> {
                    // Kiểm tra trùng lặp nếu có thay đổi
                    if (request.getName() != null && !request.getName().equals(organization.getName())) {
                        if (organizationRepository.existsByName(request.getName())) {
                            throw new DuplicateOrganizationException("Tên tổ chức đã tồn tại: " + request.getName());
                        }
                        organization.setName(request.getName());
                    }

                    if (request.getCode() != null && !request.getCode().equals(organization.getCode())) {
                        if (organizationRepository.existsByCode(request.getCode())) {
                            throw new DuplicateOrganizationException("Mã tổ chức đã tồn tại: " + request.getCode());
                        }
                        organization.setCode(request.getCode());
                    }

                    if (request.getDescription() != null) {
                        organization.setDescription(request.getDescription());
                    }
                    if (request.getAddress() != null) {
                        organization.setAddress(request.getAddress());
                    }
                    if (request.getPhone() != null) {
                        organization.setPhone(request.getPhone());
                    }
                    if (request.getEmail() != null) {
                        organization.setEmail(request.getEmail());
                    }
                    if (request.getWebsite() != null) {
                        organization.setWebsite(request.getWebsite());
                    }

                    Organization savedOrganization = organizationRepository.save(organization);
                    log.info("Updated organization with id: {}", savedOrganization.getId());

                    return OrganizationResponse.fromEntity(savedOrganization);
                });
    }

    public boolean deleteOrganization(String id) {
        log.info("Soft deleting organization with id: {}", id);

        return organizationRepository.findById(id)
                .filter(org -> org.getDeletedAt() == null)
                .map(organization -> {
                    organization.setStatus(Organization.OrganizationStatus.DELETED);
                    organization.setDeletedAt(LocalDateTime.now());
                    
                    organizationRepository.save(organization);
                    log.info("Soft deleted organization with id: {}", id);
                    return true;
                })
                .orElse(false);
    }

    public boolean restoreOrganization(String id) {
        log.info("Restoring organization with id: {}", id);

        return organizationRepository.findById(id)
                .filter(org -> org.getDeletedAt() != null)
                .map(organization -> {
                    organization.setStatus(Organization.OrganizationStatus.ACTIVE);
                    organization.setDeletedAt(null);
                    
                    organizationRepository.save(organization);
                    log.info("Restored organization with id: {}", id);
                    return true;
                })
                .orElse(false);
    }

    public Page<OrganizationResponse> searchOrganizations(String name, String code, String status, 
                                                         int pageNumber, int pageSize, String sortBy, String sortDirection) {
        log.info("Searching organizations - name: {}, code: {}, status: {}, page: {}, size: {}", 
                name, code, status, pageNumber, pageSize);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Organization.OrganizationStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = Organization.OrganizationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status: {}", status);
            }
        }

        Page<Organization> organizations = organizationRepository.findBySearchCriteria(
                name, code, statusEnum, pageable);

        return organizations.map(OrganizationResponse::fromEntity);
    }

    public List<OrganizationResponse> getOrganizationsByUserId(String userId) {
        log.info("Getting organizations by user id: {}", userId);

        List<Organization> organizations = organizationRepository.findByUserId(userId);
        return organizations.stream()
                .map(OrganizationResponse::fromEntity)
                .toList();
    }

    public long countOrganizationsByStatus(String status) {
        log.info("Counting organizations by status: {}", status);

        Organization.OrganizationStatus statusEnum = null;
        if (status != null && !status.trim().isEmpty()) {
            try {
                statusEnum = Organization.OrganizationStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status: {}", status);
            }
        }

        return statusEnum != null ? 
                organizationRepository.countByStatus(statusEnum) : 
                organizationRepository.count();
    }

    // Member management methods
    public OrganizationMembershipResponse inviteMember(String orgId, OrganizationMemberInviteRequest request, String currentUserId) {
        log.info("Inviting member {} to organization {} by user {}", request.getEmail(), orgId, currentUserId);

        // Kiểm tra quyền
        if (!isAdminOrOwner(orgId, currentUserId)) {
            throw new UnauthorizedOrganizationAccessException("Không có quyền mời thành viên");
        }

        // Kiểm tra organization tồn tại
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức"));

        // Kiểm tra user đã là member chưa
        Optional<User> user = userRepository.findByEmail(request.getEmail());
        log.info("Checking if email {} exists in system: {}", request.getEmail(), user.isPresent());
        
        if (user.isPresent()) {
            log.info("User found with ID: {}", user.get().getId());
            Optional<OrganizationMembership> existingMembership = membershipRepository
                    .findByOrganizationIdAndUserId(orgId, user.get().getId());
            
            if (existingMembership.isPresent()) {
                log.error("❌ User {} is already a member of organization {}", user.get().getEmail(), orgId);
                throw new InvalidOrganizationOperationException("Người dùng đã là thành viên của tổ chức");
            }
            log.info("✅ User exists but not a member yet. Proceeding with invitation.");
        } else {
            log.info("✅ Email not found in system. Will create invitation for new user.");
        }

        // Tạo invitation
        Invitation invitation = Invitation.builder()
                .id(UUID.randomUUID().toString())
                .organizationId(orgId)
                .email(request.getEmail())
                .roleIds(request.getRoleIds())
                .status(Invitation.InvitationStatus.PENDING)
                .invitedBy(currentUserId)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .token(UUID.randomUUID().toString())
                .build();

        invitationRepository.save(invitation);

        // Cập nhật member count
        updateMemberCount(orgId);

        return OrganizationMembershipResponse.builder()
                .organizationId(orgId)
                .userId(user.map(User::getId).orElse(null))
                .roleIds(request.getRoleIds())
                .status(OrganizationMembership.MembershipStatus.PENDING)
                .invitedBy(currentUserId)
                .invitedAt(LocalDateTime.now())
                .token(invitation.getToken())
                .build();
    }

    public List<Invitation> getPendingInvitations(String email) {
        log.info("Getting pending invitations for email: {}", email);
        return invitationRepository.findByEmailAndStatus(email, Invitation.InvitationStatus.PENDING);
    }

    public Page<User> getAvailableUsers(Pageable pageable, String searchTerm) {
        log.info("Getting available users - page: {}, size: {}, searchTerm: {}", 
                pageable.getPageNumber(), pageable.getPageSize(), searchTerm);
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            return userRepository.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    searchTerm, searchTerm, pageable);
        }
        
        return userRepository.findAll(pageable);
    }

    public void updateMember(String orgId, String userId, OrganizationMemberUpdateRequest request, String currentUserId) {
        log.info("Updating member {} in organization {} by user {}", userId, orgId, currentUserId);

        // Kiểm tra quyền
        if (!isAdminOrOwner(orgId, currentUserId)) {
            throw new UnauthorizedOrganizationAccessException("Không có quyền cập nhật thành viên");
        }

        OrganizationMembership membership = membershipRepository
                .findByOrganizationIdAndUserId(orgId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thành viên"));

        if (request.getRoleIds() != null) {
            membership.setRoleIds(request.getRoleIds());
        }
        if (request.getIsAdmin() != null) {
            membership.setIsAdmin(request.getIsAdmin());
        }

        membershipRepository.save(membership);
    }

    public void removeMember(String orgId, String userId, String currentUserId) {
        log.info("Removing member {} from organization {} by user {}", userId, orgId, currentUserId);

        // Kiểm tra quyền
        if (!isAdminOrOwner(orgId, currentUserId)) {
            throw new UnauthorizedOrganizationAccessException("Không có quyền xóa thành viên");
        }

        // Không cho phép xóa owner
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức"));
        
        if (organization.getOwnerUserId().equals(userId)) {
            throw new InvalidOrganizationOperationException("Không thể xóa chủ sở hữu tổ chức");
        }

        membershipRepository.findByOrganizationIdAndUserId(orgId, userId)
                .ifPresent(membership -> {
                    membership.setStatus(OrganizationMembership.MembershipStatus.LEFT);
                    membership.setLeftAt(LocalDateTime.now());
                    membershipRepository.save(membership);
                });

        // Cập nhật member count
        updateMemberCount(orgId);
    }

    public void addAdmin(String orgId, String userId, String currentUserId) {
        log.info("Adding admin {} to organization {} by user {}", userId, orgId, currentUserId);

        // Kiểm tra quyền (chỉ owner mới được thêm admin)
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức"));
        
        if (!organization.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedOrganizationAccessException("Chỉ chủ sở hữu mới có thể thêm admin");
        }

        // Thêm vào admin list
        if (!organization.getAdminUserIds().contains(userId)) {
            organization.getAdminUserIds().add(userId);
            organizationRepository.save(organization);
        }

        // Cập nhật membership
        membershipRepository.findByOrganizationIdAndUserId(orgId, userId)
                .ifPresent(membership -> {
                    membership.setIsAdmin(true);
                    membershipRepository.save(membership);
                });
    }

    public void removeAdmin(String orgId, String userId, String currentUserId) {
        log.info("Removing admin {} from organization {} by user {}", userId, orgId, currentUserId);

        // Kiểm tra quyền (chỉ owner mới được xóa admin)
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức"));
        
        if (!organization.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedOrganizationAccessException("Chỉ chủ sở hữu mới có thể xóa admin");
        }

        // Không cho phép xóa admin là chính owner
        if (organization.getOwnerUserId().equals(userId)) {
            throw new InvalidOrganizationOperationException("Không thể xóa admin là chủ sở hữu");
        }

        // Xóa khỏi admin list
        organization.getAdminUserIds().remove(userId);
        organizationRepository.save(organization);

        // Cập nhật membership
        membershipRepository.findByOrganizationIdAndUserId(orgId, userId)
                .ifPresent(membership -> {
                    membership.setIsAdmin(false);
                    membershipRepository.save(membership);
                });
    }

    public void transferOwnership(String orgId, String newOwnerId, String currentUserId) {
        log.info("Transferring ownership of organization {} to {} by user {}", orgId, newOwnerId, currentUserId);

        // Kiểm tra quyền (chỉ owner hiện tại mới được chuyển quyền)
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức"));
        
        if (!organization.getOwnerUserId().equals(currentUserId)) {
            throw new UnauthorizedOrganizationAccessException("Chỉ chủ sở hữu mới có thể chuyển quyền sở hữu");
        }

        // Kiểm tra new owner là member của organization
        Optional<OrganizationMembership> membership = membershipRepository
                .findByOrganizationIdAndUserId(orgId, newOwnerId);
        if (membership.isEmpty()) {
            throw new InvalidOrganizationOperationException("Người nhận quyền sở hữu phải là thành viên của tổ chức");
        }

        // Chuyển quyền sở hữu
        String oldOwnerId = organization.getOwnerUserId();
        organization.setOwnerUserId(newOwnerId);
        
        // Thêm old owner vào admin list
        if (!organization.getAdminUserIds().contains(oldOwnerId)) {
            organization.getAdminUserIds().add(oldOwnerId);
        }
        
        // Đảm bảo new owner không còn trong admin list (vì giờ là owner)
        organization.getAdminUserIds().remove(newOwnerId);
        
        organizationRepository.save(organization);

        // Cập nhật membership
        membership.get().setIsAdmin(false); // New owner không cần isAdmin = true
        membershipRepository.save(membership.get());
    }

    public Page<OrganizationMembershipResponse> getMembers(String orgId, Pageable pageable) {
        log.info("Getting members for organization {}", orgId);

        Page<OrganizationMembership> memberships = membershipRepository
                .findByOrganizationId(orgId, pageable);
        
        return memberships.map(OrganizationMembershipResponse::fromEntity);
    }

    // Helper methods
    private boolean isAdminOrOwner(String orgId, String userId) {
        Organization organization = organizationRepository.findById(orgId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tổ chức"));
        
        return organization.getOwnerUserId().equals(userId) || 
               organization.getAdminUserIds().contains(userId);
    }

    private void updateMemberCount(String orgId) {
        long activeMemberCount = membershipRepository
                .findByOrganizationId(orgId)
                .stream()
                .filter(m -> m.getStatus() == OrganizationMembership.MembershipStatus.ACTIVE)
                .count();
        
        organizationRepository.findById(orgId).ifPresent(org -> {
            org.setMemberCount((int) activeMemberCount);
            organizationRepository.save(org);
        });
    }

private void initializeDefaultData(String orgId) {
    log.info("Initializing default data for organization {}", orgId);
    
    // Khởi tạo default permissions
    permissionService.initializeDefaultPermissions(orgId);
    
    // Khởi tạo default roles (system + custom)
    roleService.initializeDefaultRoles(orgId);
    
    // Khởi tạo default workflow
    workflowService.createDefaultWorkflow(orgId);
    
    log.info("Initialized default data for organization {}", orgId);
}

/**
 * Get organization workflow
 */
public WorkflowEntity getOrganizationWorkflow(String orgId) {
    return workflowService.getOrganizationWorkflow(orgId);
}

/**
 * Get organizations by user ID with detailed membership info
 */
public List<com.devgo2003.docgo.backend.user_service.dto.UserOrganizationResponse> getOrganizationsByUserIdWithDetails(String userId, String activeOrgId) {
    log.info("Getting organizations with details for user: {}", userId);
    
    // Find all memberships for this user
    List<OrganizationMembership> memberships = membershipRepository.findByUserId(userId);
    
    return memberships.stream()
        .filter(m -> m.getStatus() == OrganizationMembership.MembershipStatus.ACTIVE)
        .map(membership -> {
            Organization org = organizationRepository.findById(membership.getOrganizationId()).orElse(null);
            if (org == null) return null;
            
            // Determine role
            String role = "member";
            if (org.getOwnerUserId().equals(userId)) {
                role = "owner";
            } else if (membership.getIsAdmin() || 
                      (org.getAdminUserIds() != null && org.getAdminUserIds().contains(userId))) {
                role = "manager";
            }
            
            // Get permissions
            List<String> permissions = membership.getPermissions();
            if (permissions == null) {
                permissions = role.equals("owner") ? List.of("all") : List.of();
            }
            
            return com.devgo2003.docgo.backend.user_service.dto.UserOrganizationResponse.builder()
                .organizationId(org.getId())
                .organizationName(org.getName())
                .organizationCode(org.getCode())
                .myRole(role)
                .myPermissions(permissions)
                .isActive(org.getId().equals(activeOrgId))
                .memberCount(org.getMemberCount())
                .joinedAt(membership.getJoinedAt())
                .build();
        })
        .filter(java.util.Objects::nonNull)
        .collect(java.util.stream.Collectors.toList());
}

/**
 * Accept invitation
 */
public OrganizationMembershipResponse acceptInvitation(String token, String userId) {
    log.info("User {} accepting invitation with token: {}", userId, token);
    
    // Find invitation by token
    Invitation invitation = invitationRepository.findByToken(token)
        .orElseThrow(() -> new ResourceNotFoundException("Lời mời không tồn tại hoặc đã hết hạn"));
    
    // Check invitation status and expiry
    if (invitation.getStatus() != Invitation.InvitationStatus.PENDING) {
        throw new InvalidOrganizationOperationException("Lời mời đã được xử lý");
    }
    
    if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
        throw new InvalidOrganizationOperationException("Lời mời đã hết hạn");
    }
    
    // Get user by ID
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
    
    // Verify email matches
    if (!user.getEmail().equals(invitation.getEmail())) {
        throw new InvalidOrganizationOperationException("Email không khớp với lời mời");
    }
    
    // Check if already a member
    Optional<OrganizationMembership> existingMembership = membershipRepository
        .findByOrganizationIdAndUserId(invitation.getOrganizationId(), userId);
    
    if (existingMembership.isPresent()) {
        throw new InvalidOrganizationOperationException("Bạn đã là thành viên của tổ chức này");
    }
    
    // Create membership
    OrganizationMembership membership = OrganizationMembership.builder()
        .id(UUID.randomUUID().toString())
        .organizationId(invitation.getOrganizationId())
        .userId(userId)
        .roleIds(invitation.getRoleIds())
        .status(OrganizationMembership.MembershipStatus.ACTIVE)
        .invitedBy(invitation.getInvitedBy())
        .invitedAt(invitation.getCreatedAt())
        .joinedAt(LocalDateTime.now())
        .build();
    
    membershipRepository.save(membership);
    
    // Update invitation status
    invitation.setStatus(Invitation.InvitationStatus.ACCEPTED);
    invitationRepository.save(invitation);
    
    // Update member count
    updateMemberCount(invitation.getOrganizationId());
    
    log.info("User {} accepted invitation to organization {}", userId, invitation.getOrganizationId());
    
    return OrganizationMembershipResponse.fromEntity(membership);
}

/**
 * Reject invitation
 */
public void rejectInvitation(String token, String userId) {
    log.info("User {} rejecting invitation with token: {}", userId, token);
    
    // Find invitation by token
    Invitation invitation = invitationRepository.findByToken(token)
        .orElseThrow(() -> new ResourceNotFoundException("Lời mời không tồn tại"));
    
    // Get user by ID
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User không tồn tại"));
    
    // Verify email matches
    if (!user.getEmail().equals(invitation.getEmail())) {
        throw new InvalidOrganizationOperationException("Email không khớp với lời mời");
    }
    
    // Update invitation status
    invitation.setStatus(Invitation.InvitationStatus.DECLINED);
    invitationRepository.save(invitation);
    
    log.info("User {} rejected invitation to organization {}", userId, invitation.getOrganizationId());
}

/**
 * Validate user membership in organization
 */
public void validateUserMembership(String userId, String organizationId) {
    log.info("Validating membership for user {} in organization {}", userId, organizationId);
    
    OrganizationMembership membership = membershipRepository
        .findByOrganizationIdAndUserId(organizationId, userId)
        .orElseThrow(() -> new UnauthorizedOrganizationAccessException(
            "Bạn không phải thành viên của tổ chức này"));
    
    if (membership.getStatus() != OrganizationMembership.MembershipStatus.ACTIVE) {
        throw new UnauthorizedOrganizationAccessException(
            "Membership không ở trạng thái active");
    }
}

}