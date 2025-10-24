package com.devgo2003.docgo.repository_service.service.validation;

import com.devgo2003.docgo.repository_service.dto.request.FileCreateRequest;
import com.devgo2003.docgo.repository_service.dto.request.FileUpdateRequest;
import com.devgo2003.docgo.repository_service.entity.FileEntity;

import java.util.List;

/**
 * IFileValidationService - File validation service interface
 * 
 * Provides business logic validation for file operations
 * Separates validation logic from service layer
 */
public interface IFileValidationService {
    
    /**
     * Validate file creation request
     * 
     * @param request File creation request
     * @return List of validation errors (empty if valid)
     */
    List<String> validateFileCreation(FileCreateRequest request);
    
    /**
     * Validate file update request
     * 
     * @param request File update request
     * @param existingFile Existing file entity
     * @return List of validation errors (empty if valid)
     */
    List<String> validateFileUpdate(FileUpdateRequest request, FileEntity existingFile);
    
    /**
     * Validate file ID format
     * 
     * @param fileId File ID to validate
     * @return true if valid UUID format
     */
    boolean isValidFileId(String fileId);
    
    /**
     * Validate file ownership
     * 
     * @param fileId File ID
     * @param userId User ID claiming ownership
     * @return true if user owns the file
     */
    boolean validateFileOwnership(String fileId, String userId);
    
    /**
     * Validate file status for operation
     * 
     * @param file File entity
     * @param operation Operation being performed
     * @return List of validation errors (empty if valid)
     */
    List<String> validateFileStatus(FileEntity file, String operation);
    
    /**
     * Validate file section data
     * 
     * @param sectionName Section name (overview, metadata, etc.)
     * @param sectionData Section data to validate
     * @return List of validation errors (empty if valid)
     */
    List<String> validateFileSection(String sectionName, Object sectionData);
}
