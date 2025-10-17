package com.devgo2003.docgo.backend.user_service.service;

import com.devgo2003.docgo.backend.user_service.dto.OrganizationPermissionCreateRequest;
import com.devgo2003.docgo.backend.user_service.dto.OrganizationPermissionResponse;
import com.devgo2003.docgo.backend.user_service.dto.OrganizationPermissionUpdateRequest;
import com.devgo2003.docgo.backend.user_service.entity.OrganizationPermission;
import com.devgo2003.docgo.backend.user_service.repository.OrganizationPermissionRepository;
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
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationPermissionService {

    private final OrganizationPermissionRepository permissionRepository;

    public Page<OrganizationPermissionResponse> getAllPermissions(String organizationId, int page, int size, String sortBy, String sortDirection, Pageable pageable) {
        log.info("Getting all permissions for organization {} - page: {}, size: {}", organizationId, page, size);

        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable sortedPageable = PageRequest.of(page, size, sort);
        
        Page<OrganizationPermission> permissions = permissionRepository.findByOrganizationIdAndIsActiveTrue(organizationId, sortedPageable);
        
        return permissions.map(OrganizationPermissionResponse::fromEntity);
    }

    public Optional<OrganizationPermissionResponse> getPermissionById(String organizationId, String permissionId) {
        log.info("Getting permission {} for organization {}", permissionId, organizationId);
        
        return permissionRepository.findById(permissionId)
                .filter(permission -> permission.getOrganizationId().equals(organizationId))
                .filter(OrganizationPermission::getIsActive)
                .map(OrganizationPermissionResponse::fromEntity);
    }

    public OrganizationPermissionResponse createPermission(String organizationId, OrganizationPermissionCreateRequest request, String currentUserId) {
        log.info("Creating permission {} in organization {} by user {}", request.getName(), organizationId, currentUserId);

        // Kiểm tra trùng lặp
        if (permissionRepository.existsByOrganizationIdAndName(organizationId, request.getName())) {
            throw new IllegalArgumentException("Tên quyền hạn đã tồn tại trong tổ chức: " + request.getName());
        }

        String code = generatePermissionCode(request.getName(), request.getResource(), request.getAction());

        OrganizationPermission permission = OrganizationPermission.builder()
                .id(UUID.randomUUID().toString())
                .organizationId(organizationId)
                .name(request.getName())
                .code(code)
                .displayName(request.getDisplayName() != null ? request.getDisplayName() : request.getName())
                .description(request.getDescription())
                .resource(request.getResource())
                .action(request.getAction())
                .isActive(true)
                .createdBy(currentUserId)
                .build();

        OrganizationPermission savedPermission = permissionRepository.save(permission);
        
        log.info("Created permission with id: {}", savedPermission.getId());
        
        return OrganizationPermissionResponse.fromEntity(savedPermission);
    }

    public OrganizationPermissionResponse updatePermission(String organizationId, String permissionId, OrganizationPermissionUpdateRequest request, String currentUserId) {
        log.info("Updating permission {} in organization {} by user {}", permissionId, organizationId, currentUserId);

        OrganizationPermission permission = permissionRepository.findById(permissionId)
                .filter(p -> p.getOrganizationId().equals(organizationId))
                .filter(OrganizationPermission::getIsActive)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quyền hạn"));

        // Kiểm tra trùng lặp nếu có thay đổi tên
        if (request.getName() != null && !request.getName().equals(permission.getName())) {
            if (permissionRepository.existsByOrganizationIdAndName(organizationId, request.getName())) {
                throw new IllegalArgumentException("Tên quyền hạn đã tồn tại trong tổ chức: " + request.getName());
            }
            permission.setName(request.getName());
            
            // Cập nhật code nếu có thay đổi
            if (request.getResource() != null || request.getAction() != null) {
                String resource = request.getResource() != null ? request.getResource() : permission.getResource();
                String action = request.getAction() != null ? request.getAction() : permission.getAction();
                permission.setCode(generatePermissionCode(request.getName(), resource, action));
            }
        }

        if (request.getDisplayName() != null) {
            permission.setDisplayName(request.getDisplayName());
        }
        if (request.getDescription() != null) {
            permission.setDescription(request.getDescription());
        }
        if (request.getResource() != null) {
            permission.setResource(request.getResource());
        }
        if (request.getAction() != null) {
            permission.setAction(request.getAction());
        }

        permission.setUpdatedBy(currentUserId);
        OrganizationPermission savedPermission = permissionRepository.save(permission);
        
        log.info("Updated permission with id: {}", savedPermission.getId());
        
        return OrganizationPermissionResponse.fromEntity(savedPermission);
    }

    public void deletePermission(String organizationId, String permissionId, String currentUserId) {
        log.info("Deleting permission {} from organization {} by user {}", permissionId, organizationId, currentUserId);

        OrganizationPermission permission = permissionRepository.findById(permissionId)
                .filter(p -> p.getOrganizationId().equals(organizationId))
                .filter(OrganizationPermission::getIsActive)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy quyền hạn"));

        // Soft delete
        permission.setIsActive(false);
        permission.setUpdatedBy(currentUserId);
        permissionRepository.save(permission);
        
        log.info("Deleted permission with id: {}", permissionId);
    }

    public void initializeDefaultPermissions(String orgId) {
        log.info("Initializing default permissions for organization {}", orgId);

        List<OrganizationPermission> defaultPermissions = List.of(
                // Document permissions
                createDefaultPermission(orgId, "document.read", "document", "read", "Đọc tài liệu"),
                createDefaultPermission(orgId, "document.write", "document", "write", "Tạo/sửa tài liệu"),
                createDefaultPermission(orgId, "document.delete", "document", "delete", "Xóa tài liệu"),
                
                // User permissions
                createDefaultPermission(orgId, "user.read", "user", "read", "Xem thông tin người dùng"),
                createDefaultPermission(orgId, "user.write", "user", "write", "Quản lý người dùng"),
                
                // Organization permissions
                createDefaultPermission(orgId, "organization.read", "organization", "read", "Xem thông tin tổ chức"),
                createDefaultPermission(orgId, "organization.write", "organization", "write", "Quản lý tổ chức"),
                createDefaultPermission(orgId, "organization.admin", "organization", "admin", "Quản trị tổ chức")
        );

        for (OrganizationPermission permission : defaultPermissions) {
            if (!permissionRepository.existsByOrganizationIdAndCode(orgId, permission.getCode())) {
                permissionRepository.save(permission);
            }
        }
    }

    private OrganizationPermission createDefaultPermission(String orgId, String name, String resource, String action, String description) {
        return OrganizationPermission.builder()
                .id(UUID.randomUUID().toString())
                .organizationId(orgId)
                .name(name)
                .code(generatePermissionCode(name, resource, action))
                .displayName(description)
                .description(description)
                .resource(resource)
                .action(action)
                .isActive(true)
                .createdBy("system")
                .build();
    }

    private String generatePermissionCode(String name, String resource, String action) {
        return String.format("%s:%s:%s", resource, action, name).toLowerCase();
    }
}