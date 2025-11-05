package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.RepositoryEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryRepository extends MongoRepository<RepositoryEntity, String> {

    // Find by type and owner
    Page<RepositoryEntity> findByTypeAndOwnerUserIdAndIsDeletedFalse(
        RepositoryEntity.RepositoryType type, 
        String ownerUserId, 
        Pageable pageable
    );

    // Find by organization
    Page<RepositoryEntity> findByTypeAndOrganizationIdAndIsDeletedFalse(
        RepositoryEntity.RepositoryType type,
        String organizationId,
        Pageable pageable
    );

    // Find all by type (for admin)
    Page<RepositoryEntity> findByTypeAndIsDeletedFalse(
        RepositoryEntity.RepositoryType type,
        Pageable pageable
    );

    // Find all repositories (all types, not deleted)
    Page<RepositoryEntity> findByIsDeletedFalse(Pageable pageable);

    // Find by owner (all types)
    Page<RepositoryEntity> findByOwnerUserIdAndIsDeletedFalse(
        String ownerUserId,
        Pageable pageable
    );

    // Find by ID and not deleted
    Optional<RepositoryEntity> findByIdAndIsDeletedFalse(String id);

    // Find by name and owner (for duplicate check)
    Optional<RepositoryEntity> findByNameAndOwnerUserIdAndIsDeletedFalse(
        String name, 
        String ownerUserId
    );

    // Find by name and organization (for duplicate check)
    Optional<RepositoryEntity> findByNameAndOrganizationIdAndIsDeletedFalse(
        String name,
        String organizationId
    );

    // Search repositories by name or description
    @Query("{ " +
           "$and: [ " +
           "{ $or: [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } } " +
           "] }, " +
           "{ 'isDeleted': false } " +
           "] " +
           "}")
    Page<RepositoryEntity> searchRepositories(String searchTerm, Pageable pageable);

    // Search personal repositories
    @Query("{ " +
           "$and: [ " +
           "{ 'type': 'PERSONAL' }, " +
           "{ 'ownerUserId': ?1 }, " +
           "{ $or: [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } } " +
           "] }, " +
           "{ 'isDeleted': false } " +
           "] " +
           "}")
    Page<RepositoryEntity> searchPersonalRepositories(String searchTerm, String ownerUserId, Pageable pageable);

    // Search organization repositories
    @Query("{ " +
           "$and: [ " +
           "{ 'type': 'ORGANIZATION' }, " +
           "{ 'organizationId': ?1 }, " +
           "{ $or: [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } } " +
           "] }, " +
           "{ 'isDeleted': false } " +
           "] " +
           "}")
    Page<RepositoryEntity> searchOrganizationRepositories(String searchTerm, String organizationId, Pageable pageable);

    // Search all organization repositories for a user (by ownerUserId)
    @Query("{ " +
           "$and: [ " +
           "{ 'type': 'ORGANIZATION' }, " +
           "{ 'ownerUserId': ?1 }, " +
           "{ $or: [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } } " +
           "] }, " +
           "{ 'isDeleted': false } " +
           "] " +
           "}")
    Page<RepositoryEntity> searchUserOrganizationRepositories(String searchTerm, String userId, Pageable pageable);

    // Find organization repositories by list of organizationIds
    @Query("{ " +
           "$and: [ " +
           "{ 'type': 'ORGANIZATION' }, " +
           "{ 'organizationId': { $in: ?0 } }, " +
           "{ 'isDeleted': false } " +
           "] " +
           "}")
    Page<RepositoryEntity> findByTypeOrganizationAndOrganizationIdIn(List<String> organizationIds, Pageable pageable);

    // Search organization repositories by list of organizationIds
    @Query("{ " +
           "$and: [ " +
           "{ 'type': 'ORGANIZATION' }, " +
           "{ 'organizationId': { $in: ?1 } }, " +
           "{ $or: [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } } " +
           "] }, " +
           "{ 'isDeleted': false } " +
           "] " +
           "}")
    Page<RepositoryEntity> searchOrganizationRepositoriesByIds(String searchTerm, List<String> organizationIds, Pageable pageable);

    // Count repositories by type
    long countByTypeAndIsDeletedFalse(RepositoryEntity.RepositoryType type);

    // Count personal repositories for user
    long countByTypeAndOwnerUserIdAndIsDeletedFalse(
        RepositoryEntity.RepositoryType type, 
        String ownerUserId
    );

    // Count organization repositories
    long countByTypeAndOrganizationIdAndIsDeletedFalse(
        RepositoryEntity.RepositoryType type,
        String organizationId
    );

    // Find public repositories
    Page<RepositoryEntity> findByIsPublicTrueAndIsDeletedFalse(Pageable pageable);

    // Search public repositories
    @Query("{ " +
           "$and: [ " +
           "{ 'isPublic': true }, " +
           "{ 'isDeleted': false }, " +
           "{ $or: [ " +
           "{ 'name': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } } " +
           "] } " +
           "] " +
           "}")
    Page<RepositoryEntity> searchPublicRepositories(String searchTerm, Pageable pageable);
    
    // Find all by organization (for cascade delete)
    @Query("{ 'organizationId': ?0 }")
    List<RepositoryEntity> findByOrganizationId(String organizationId);
}
