package com.devgo2003.docgo.backend.user_service.repository;

import com.devgo2003.docgo.backend.user_service.entity.OrganizationMembership;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationMembershipRepository extends MongoRepository<OrganizationMembership, String> {
    Optional<OrganizationMembership> findByOrganizationIdAndUserId(String organizationId, String userId);
    List<OrganizationMembership> findByOrganizationId(String organizationId);
    Page<OrganizationMembership> findByOrganizationId(String organizationId, Pageable pageable);
    List<OrganizationMembership> findByUserId(String userId);
    Page<OrganizationMembership> findByUserId(String userId, Pageable pageable);
}



