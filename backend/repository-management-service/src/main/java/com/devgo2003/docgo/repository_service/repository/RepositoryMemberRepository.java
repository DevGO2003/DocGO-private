package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.RepositoryMemberEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryMemberRepository extends MongoRepository<RepositoryMemberEntity, String> {
    
    Page<RepositoryMemberEntity> findByRepositoryIdAndStatus(
        String repositoryId, 
        RepositoryMemberEntity.MembershipStatus status,
        Pageable pageable
    );
    
    List<RepositoryMemberEntity> findByRepositoryIdAndStatus(
        String repositoryId, 
        RepositoryMemberEntity.MembershipStatus status
    );
    
    Optional<RepositoryMemberEntity> findByRepositoryIdAndUserId(
        String repositoryId, 
        String userId
    );
    
    List<RepositoryMemberEntity> findByUserId(String userId);
    
    boolean existsByRepositoryIdAndUserId(String repositoryId, String userId);
    
    long countByRepositoryIdAndStatus(
        String repositoryId, 
        RepositoryMemberEntity.MembershipStatus status
    );
    
    void deleteByRepositoryId(String repositoryId);
}
