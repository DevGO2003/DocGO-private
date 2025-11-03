package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.dto.RepositoryInviteDTO;

import java.util.List;

public interface IRepositoryInviteService {
    
    RepositoryInviteDTO createInvite(String repositoryId, String invitedBy, Integer expiresInDays);
    
    List<RepositoryInviteDTO> getRepositoryInvites(String repositoryId, String currentUserId);
    
    RepositoryInviteDTO getInviteByToken(String token);
    
    void acceptInvite(String token, String userId);
    
    void revokeInvite(String inviteId, String revokedBy);
    
    void cleanupExpiredInvites();
}
