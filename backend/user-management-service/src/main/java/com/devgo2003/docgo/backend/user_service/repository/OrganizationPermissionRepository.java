package com.devgo2003.docgo.backend.user_service.repository;

import com.devgo2003.docgo.backend.user_service.entity.OrganizationPermission;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationPermissionRepository extends MongoRepository<OrganizationPermission, String> {
    Optional<OrganizationPermission> findByOrganizationIdAndName(String organizationId, String name);
    Optional<OrganizationPermission> findByOrganizationIdAndCode(String organizationId, String code);
    List<OrganizationPermission> findByOrganizationId(String organizationId);
    List<OrganizationPermission> findByOrganizationIdAndIsActiveTrue(String organizationId);
    Page<OrganizationPermission> findByOrganizationIdAndIsActiveTrue(String organizationId, Pageable pageable);
    boolean existsByOrganizationIdAndName(String organizationId, String name);
    boolean existsByOrganizationIdAndCode(String organizationId, String code);
}
