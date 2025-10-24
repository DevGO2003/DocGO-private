package com.devgo2003.docgo.repository_service.service.validation;

import com.devgo2003.docgo.repository_service.dto.request.FileCreateRequest;
import com.devgo2003.docgo.repository_service.dto.request.FileUpdateRequest;
import com.devgo2003.docgo.repository_service.entity.FileEntity;

import java.util.List;

public interface IFileValidationService {
    
    /**
     * Validate file creation request
     * @param request File creation request
     * @return List of validation errors (empty if valid)
     */
    List<String> validateFileCreation(FileCreateRequest request);
    
    /**
     * Validate file update request
     * @param request File update request
     * @return List of validation errors (empty if valid)
     */
    List<String> validateFileUpdate(FileUpdateRequest request);
    
    /**
     * Validate file entity
     * @param fileEntity File entity to validate
     * @return List of validation errors (empty if valid)
     */
    List<String> validateFileEntity(FileEntity fileEntity);
    
    /**
     * Validate file ID format
     * @param fileId File ID to validate
     * @return true if valid, false otherwise
     */
    boolean isValidFileId(String fileId);
    
    /**
     * Validate file name
     * @param fileName File name to validate
     * @return true if valid, false otherwise
     */
    boolean isValidFileName(String fileName);
    
    /**
     * Validate file size
     * @param fileSize File size to validate
     * @return true if valid, false otherwise
     */
    boolean isValidFileSize(Long fileSize);
    
    /**
     * Validate MIME type
     * @param mimeType MIME type to validate
     * @return true if valid, false otherwise
     */
    boolean isValidMimeType(String mimeType);
}
