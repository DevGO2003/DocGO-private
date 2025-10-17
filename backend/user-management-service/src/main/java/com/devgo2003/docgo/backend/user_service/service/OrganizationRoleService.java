package com.devgo2003.docgo.backend.user_service.service;

import com.devgo2003.docgo.backend.user_service.dto.OrganizationRoleCreateRequest;
import com.devgo2003.docgo.backend.user_service.dto.OrganizationRoleResponse;
import com.devgo2003.docgo.backend.user_service.dto.OrganizationRoleUpdateRequest;
import com.devgo2003.docgo.backend.user_service.entity.OrganizationRole;
import com.devgo2003.docgo.backend.user_service.repository.OrganizationRoleRepository;
import com.devgo2003.docgo.backend.user_service.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationRoleService {

    private final OrganizationRoleRepository roleRepository;

    public Page<OrganizationRoleResponse> getAllRoles(String organizationId, int page, int size, String sortBy, String sortDirection, Pageable pageable) {
        log.info("Getting all roles for organization {} - page: {}, size: {}", organizationId, page, size);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable sortedPageable = PageRequest.of(page, size, sort);
        
        Page<OrganizationRole> roles = roleRepository.findByOrganizationIdAndIsActiveTrue(organizationId, sortedPageable);
        
        return roles.map(OrganizationRoleResponse::fromEntity);
    }

    public Optional<OrganizationRoleResponse> getRoleById(String organizationId, String roleId) {
        log.info("Getting role {} for organization {}", roleId, organizationId);
        
        return roleRepository.findById(roleId)
                .filter(role -> role.getOrganizationId().equals(organizationId))
                .filter(OrganizationRole::getIsActive)
                .map(OrganizationRoleResponse::fromEntity);
    }

    public OrganizationRoleResponse createRole(String organizationId, OrganizationRoleCreateRequest request, String currentUserId) {
        log.info("Creating role {} in organization {} by user {}", request.getName(), organizationId, currentUserId);

        // Kiểm tra trùng lặp
        if (roleRepository.existsByOrganizationIdAndName(organizationId, request.getName())) {
            throw new IllegalArgumentException("Tên vai trò đã tồn tại trong tổ chức: " + request.getName());
        }

        OrganizationRole role = OrganizationRole.builder()
                .id(UUID.randomUUID().toString())
                .organizationId(organizationId)
                .name(request.getName())
                .displayName(request.getDisplayName() != null ? request.getDisplayName() : request.getName())
                .description(request.getDescription())
                .permissionIds(request.getPermissionIds() != null ? request.getPermissionIds() : Set.of())
                .isDefault(false)
                .isActive(true)
                .level(1)
                .createdBy(currentUserId)
                .build();

        OrganizationRole savedRole = roleRepository.save(role);
        
        log.info("Created role with id: {}", savedRole.getId());
        
        return OrganizationRoleResponse.fromEntity(savedRole);
    }

    public OrganizationRoleResponse updateRole(String organizationId, String roleId, OrganizationRoleUpdateRequest request, String currentUserId) {
        log.info("Updating role {} in organization {} by user {}", roleId, organizationId, currentUserId);

        OrganizationRole role = roleRepository.findById(roleId)
                .filter(r -> r.getOrganizationId().equals(organizationId))
                .filter(OrganizationRole::getIsActive)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò"));

        // Kiểm tra trùng lặp nếu có thay đổi tên
        if (request.getName() != null && !request.getName().equals(role.getName())) {
            if (roleRepository.existsByOrganizationIdAndName(organizationId, request.getName())) {
                throw new IllegalArgumentException("Tên vai trò đã tồn tại trong tổ chức: " + request.getName());
            }
            role.setName(request.getName());
        }

        if (request.getDisplayName() != null) {
            role.setDisplayName(request.getDisplayName());
        }
        if (request.getDescription() != null) {
            role.setDescription(request.getDescription());
        }
        if (request.getPermissionIds() != null) {
            role.setPermissionIds(request.getPermissionIds());
        }

        role.setUpdatedBy(currentUserId);
        OrganizationRole savedRole = roleRepository.save(role);
        
        log.info("Updated role with id: {}", savedRole.getId());
        
        return OrganizationRoleResponse.fromEntity(savedRole);
    }

    public void deleteRole(String organizationId, String roleId, String currentUserId) {
        log.info("Deleting role {} from organization {} by user {}", roleId, organizationId, currentUserId);

        OrganizationRole role = roleRepository.findById(roleId)
                .filter(r -> r.getOrganizationId().equals(organizationId))
                .filter(OrganizationRole::getIsActive)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò"));

        // Không cho phép xóa role mặc định
        if (role.getIsDefault()) {
            throw new IllegalArgumentException("Không thể xóa vai trò mặc định");
        }

        // Soft delete
        role.setIsActive(false);
        role.setUpdatedBy(currentUserId);
        roleRepository.save(role);
        
        log.info("Deleted role with id: {}", roleId);
    }

    public void initializeDefaultRoles(String orgId) {
        log.info("Initializing default roles for organization {}", orgId);

        List<OrganizationRole> defaultRoles = List.of(
                createDefaultRole(orgId, "owner", "Chủ sở hữu", "Chủ sở hữu tổ chức với quyền cao nhất", Set.of(), true, 3),
                createDefaultRole(orgId, "admin", "Quản trị viên", "Quản trị viên tổ chức", Set.of(), true, 2),
                createDefaultRole(orgId, "member", "Thành viên", "Thành viên cơ bản của tổ chức", Set.of(), true, 1)
        );

        for (OrganizationRole role : defaultRoles) {
            if (!roleRepository.existsByOrganizationIdAndName(orgId, role.getName())) {
                roleRepository.save(role);
            }
        }
    }

    private OrganizationRole createDefaultRole(String orgId, String name, String displayName, String description, Set<String> permissionIds, boolean isDefault, int level) {
        return OrganizationRole.builder()
                .id(UUID.randomUUID().toString())
                .organizationId(orgId)
                .name(name)
                .displayName(displayName)
                .description(description)
                .permissionIds(permissionIds)
                .isDefault(isDefault)
                .isActive(true)
                .level(level)
                .createdBy("system")
                .build();
    }
}