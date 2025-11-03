package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.dto.RepositoryPermissionDTO;

import java.util.List;

public interface IRepositoryPermissionService {
    
    List<RepositoryPermissionDTO> getPermissions(String repositoryId, String currentUserId);
    
    RepositoryPermissionDTO addPermission(String repositoryId, String userId, List<String> permissions, String grantedBy);
    
    RepositoryPermissionDTO updatePermission(String repositoryId, String userId, List<String> permissions, String updatedBy);
    
    void removePermission(String repositoryId, String userId, String removedBy);
    
    boolean hasPermission(String repositoryId, String userId, String permission);
    
    void grantDefaultPermissions(String repositoryId, String userId, String grantedBy);
}
