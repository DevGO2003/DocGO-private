package com.devgo2003.docgo.repository_service.repository;

import com.devgo2003.docgo.repository_service.entity.RepositoryInviteEntity;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;
import java.util.List;

public interface RepositoryInviteRepository extends MongoRepository<RepositoryInviteEntity, String> {
    
    Optional<RepositoryInviteEntity> findByToken(String token);
    
    List<RepositoryInviteEntity> findByRepositoryIdAndIsRevokedFalse(String repositoryId);
    
    List<RepositoryInviteEntity> findByInvitedByAndIsRevokedFalse(String invitedBy);
    
    Optional<RepositoryInviteEntity> findByTokenAndIsUsedFalseAndIsRevokedFalse(String token);
}
