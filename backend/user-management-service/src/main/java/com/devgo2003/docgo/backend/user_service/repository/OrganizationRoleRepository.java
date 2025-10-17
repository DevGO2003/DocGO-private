package com.devgo2003.docgo.backend.user_service.repository;

import com.devgo2003.docgo.backend.user_service.entity.OrganizationRole;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRoleRepository extends MongoRepository<OrganizationRole, String> {
    Optional<OrganizationRole> findByOrganizationIdAndName(String organizationId, String name);
    List<OrganizationRole> findByOrganizationId(String organizationId);
    List<OrganizationRole> findByOrganizationIdAndIsActiveTrue(String organizationId);
    Page<OrganizationRole> findByOrganizationIdAndIsActiveTrue(String organizationId, Pageable pageable);
    boolean existsByOrganizationIdAndName(String organizationId, String name);
}
