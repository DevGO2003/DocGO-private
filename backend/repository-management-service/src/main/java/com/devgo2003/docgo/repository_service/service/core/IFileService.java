package com.devgo2003.docgo.repository_service.service.core;

import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Optional;

/**
 * IFileService - File Service Interface
 * 
 * Core Operations:
 * - CRUD operations for FileEntity
 * - Pagination and search
 * - DTO mapping for API responses
 */
public interface IFileService {
    
    /**
     * Get all files with pagination
     */
    Page<FileEntity> getAllFiles(Pageable pageable);

    /**
    * Get files by owner user ID with pagination
    */
    Page<FileEntity> getFilesByOwnerUserId(String ownerUserId, Pageable pageable);

    /**
     * Get files by document type with pagination
     */
    Page<FileEntity> getFilesByDocumentType(String documentType, Pageable pageable);

    /**
     * Get files by organization ID with pagination
     */
    Page<FileEntity> getFilesByOrganizationId(String organizationId, Pageable pageable);

    /**
     * Get files with multiple filters
     */
    Page<FileEntity> getFilesWithFilters(String documentType, String organizationId, String userId, Pageable pageable);

    /**
     * Get file by ID
     */
    Optional<FileEntity> getFileById(String id);
    
    /**
     * Get file by ID as DTO
     */
    Optional<FullFileResponseDto> getFileDtoById(String id);
    
    /**
     * Create new file
     */
    FileEntity createFile(FileEntity file);
    
    /**
     * Update existing file
     */
    FileEntity updateFile(String id, FileEntity file);
    
    /**
     * Delete file
     */
    void deleteFile(String id);
    
    /**
     * Check if file exists
     */
    boolean existsById(String id);
}
