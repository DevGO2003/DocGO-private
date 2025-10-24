package com.devgo2003.docgo.repository_service.service.validation.impl;

import com.devgo2003.docgo.repository_service.dto.request.FileCreateRequest;
import com.devgo2003.docgo.repository_service.dto.request.FileUpdateRequest;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.service.validation.IFileValidationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

/**
 * FileValidationServiceImpl - File validation service implementation
 * 
 * Implements business logic validation for file operations
 * Provides comprehensive validation for all file-related operations
 */
@Service
@Slf4j
public class FileValidationServiceImpl implements IFileValidationService {
    
    // Constants for validation
    private static final Pattern UUID_PATTERN = Pattern.compile(
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", 
        Pattern.CASE_INSENSITIVE
    );
    
    private static final List<String> VALID_DOCUMENT_TYPES = List.of(
        "CONTRACT", "INVOICE", "RECEIPT", "REPORT", "MANUAL", "POLICY", "OTHER"
    );
    
    private static final List<String> VALID_OPERATIONS = List.of(
        "CREATE", "UPDATE", "DELETE", "RESTORE", "VIEW", "DOWNLOAD"
    );

    @Override
    public List<String> validateFileCreation(FileCreateRequest request) {
        List<String> errors = new ArrayList<>();
        
        if (request == null) {
            errors.add("File creation request cannot be null");
            return errors;
        }
        
        // Validate required fields
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            errors.add("File title is required");
        } else if (request.getTitle().length() > 255) {
            errors.add("File title cannot exceed 255 characters");
        }
        
        if (request.getDocumentType() == null || request.getDocumentType().trim().isEmpty()) {
            errors.add("Document type is required");
        } else if (!VALID_DOCUMENT_TYPES.contains(request.getDocumentType().toUpperCase())) {
            errors.add("Invalid document type. Must be one of: " + String.join(", ", VALID_DOCUMENT_TYPES));
        }
        
        if (request.getOwnerUserId() == null || request.getOwnerUserId().trim().isEmpty()) {
            errors.add("Owner user ID is required");
        } else if (!isValidFileId(request.getOwnerUserId())) {
            errors.add("Invalid owner user ID format");
        }
        
        // Validate optional fields
        if (request.getLanguage() != null && request.getLanguage().length() > 10) {
            errors.add("Language code cannot exceed 10 characters");
        }
        
        if (request.getRegion() != null && request.getRegion().length() > 10) {
            errors.add("Region code cannot exceed 10 characters");
        }
        
        if (request.getDescription() != null && request.getDescription().length() > 1000) {
            errors.add("Description cannot exceed 1000 characters");
        }
        
        // Validate metadata if provided
        if (request.getMetadata() != null) {
            errors.addAll(validateFileSection("metadata", request.getMetadata()));
        }
        
        // Validate storage if provided
        if (request.getStorage() != null) {
            errors.addAll(validateFileSection("storage", request.getStorage()));
        }
        
        // Validate security if provided
        if (request.getSecurity() != null) {
            errors.addAll(validateFileSection("security", request.getSecurity()));
        }
        
        return errors;
    }

    @Override
    public List<String> validateFileUpdate(FileUpdateRequest request, FileEntity existingFile) {
        List<String> errors = new ArrayList<>();
        
        if (request == null) {
            errors.add("File update request cannot be null");
            return errors;
        }
        
        if (existingFile == null) {
            errors.add("Existing file cannot be null for update");
            return errors;
        }
        
        // Validate optional fields
        if (request.getTitle() != null) {
            if (request.getTitle().trim().isEmpty()) {
                errors.add("File title cannot be empty");
            } else if (request.getTitle().length() > 255) {
                errors.add("File title cannot exceed 255 characters");
            }
        }
        
        if (request.getDocumentType() != null) {
            if (!VALID_DOCUMENT_TYPES.contains(request.getDocumentType().toUpperCase())) {
                errors.add("Invalid document type. Must be one of: " + String.join(", ", VALID_DOCUMENT_TYPES));
            }
        }
        
        if (request.getLanguage() != null && request.getLanguage().length() > 10) {
            errors.add("Language code cannot exceed 10 characters");
        }
        
        if (request.getRegion() != null && request.getRegion().length() > 10) {
            errors.add("Region code cannot exceed 10 characters");
        }
        
        if (request.getDescription() != null && request.getDescription().length() > 1000) {
            errors.add("Description cannot exceed 1000 characters");
        }
        
        // Validate sections if provided
        if (request.getOverview() != null) {
            errors.addAll(validateFileSection("overview", request.getOverview()));
        }
        
        if (request.getMetadata() != null) {
            errors.addAll(validateFileSection("metadata", request.getMetadata()));
        }
        
        if (request.getContract() != null) {
            errors.addAll(validateFileSection("contract", request.getContract()));
        }
        
        if (request.getContent() != null) {
            errors.addAll(validateFileSection("content", request.getContent()));
        }
        
        if (request.getStorage() != null) {
            errors.addAll(validateFileSection("storage", request.getStorage()));
        }
        
        if (request.getSecurity() != null) {
            errors.addAll(validateFileSection("security", request.getSecurity()));
        }
        
        if (request.getVersioning() != null) {
            errors.addAll(validateFileSection("versioning", request.getVersioning()));
        }
        
        if (request.getAudit() != null) {
            errors.addAll(validateFileSection("audit", request.getAudit()));
        }
        
        return errors;
    }

    @Override
    public boolean isValidFileId(String fileId) {
        if (fileId == null || fileId.trim().isEmpty()) {
            return false;
        }
        
        try {
            UUID.fromString(fileId);
            return UUID_PATTERN.matcher(fileId).matches();
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    @Override
    public boolean validateFileOwnership(String fileId, String userId) {
        if (fileId == null || userId == null) {
            return false;
        }
        
        // This would typically check against the database
        // For now, we'll implement a basic check
        // In a real implementation, this would query the database
        return true; // Placeholder implementation
    }

    @Override
    public List<String> validateFileStatus(FileEntity file, String operation) {
        List<String> errors = new ArrayList<>();
        
        if (file == null) {
            errors.add("File cannot be null");
            return errors;
        }
        
        if (operation == null || !VALID_OPERATIONS.contains(operation.toUpperCase())) {
            errors.add("Invalid operation: " + operation);
            return errors;
        }
        
        // Check if file is deleted
        if (Boolean.TRUE.equals(file.getIsDeleted())) {
            if (!"RESTORE".equals(operation.toUpperCase())) {
                errors.add("Cannot perform " + operation + " on deleted file. Use RESTORE operation instead.");
            }
        }
        
        // Check file status based on operation
        String status = file.getStatus();
        if (status != null) {
            switch (operation.toUpperCase()) {
                case "UPDATE":
                    if ("PROCESSING".equals(status)) {
                        errors.add("Cannot update file while it's being processed");
                    }
                    break;
                case "DELETE":
                    if ("PROCESSING".equals(status)) {
                        errors.add("Cannot delete file while it's being processed");
                    }
                    break;
                case "DOWNLOAD":
                    if (!"PROCESSED".equals(status) && !"UPLOADED".equals(status)) {
                        errors.add("File is not ready for download. Current status: " + status);
                    }
                    break;
            }
        }
        
        return errors;
    }

    @Override
    public List<String> validateFileSection(String sectionName, Object sectionData) {
        List<String> errors = new ArrayList<>();
        
        if (sectionName == null || sectionName.trim().isEmpty()) {
            errors.add("Section name cannot be null or empty");
            return errors;
        }
        
        if (sectionData == null) {
            return errors; // Null data is allowed for optional sections
        }
        
        // Validate section data based on section name
        switch (sectionName.toLowerCase()) {
            case "overview":
                errors.addAll(validateOverviewSection(sectionData));
                break;
            case "metadata":
                errors.addAll(validateMetadataSection(sectionData));
                break;
            case "contract":
                errors.addAll(validateContractSection(sectionData));
                break;
            case "content":
                errors.addAll(validateContentSection(sectionData));
                break;
            case "storage":
                errors.addAll(validateStorageSection(sectionData));
                break;
            case "security":
                errors.addAll(validateSecuritySection(sectionData));
                break;
            case "versioning":
                errors.addAll(validateVersioningSection(sectionData));
                break;
            case "audit":
                errors.addAll(validateAuditSection(sectionData));
                break;
            default:
                errors.add("Unknown section name: " + sectionName);
        }
        
        return errors;
    }
    
    // Private validation methods for each section
    
    private List<String> validateOverviewSection(Object data) {
        List<String> errors = new ArrayList<>();
        
        if (!(data instanceof Map)) {
            errors.add("Overview section must be a Map");
            return errors;
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> overview = (Map<String, Object>) data;
        
        // Validate status if present
        Object status = overview.get("status");
        if (status != null && !(status instanceof String)) {
            errors.add("Overview status must be a string");
        }
        
        // Validate documentType if present
        Object documentType = overview.get("documentType");
        if (documentType != null && !(documentType instanceof String)) {
            errors.add("Overview documentType must be a string");
        }
        
        return errors;
    }
    
    private List<String> validateMetadataSection(Object data) {
        List<String> errors = new ArrayList<>();
        
        if (!(data instanceof Map)) {
            errors.add("Metadata section must be a Map");
            return errors;
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Object> metadata = (Map<String, Object>) data;
        
        // Validate file information if present
        Object file = metadata.get("file");
        if (file != null && !(file instanceof Map)) {
            errors.add("Metadata file must be a Map");
        }
        
        return errors;
    }
    
    private List<String> validateContractSection(Object data) {
        List<String> errors = new ArrayList<>();
        
        if (!(data instanceof Map)) {
            errors.add("Contract section must be a Map");
            return errors;
        }
        
        // Add contract-specific validation here
        return errors;
    }
    
    private List<String> validateContentSection(Object data) {
        List<String> errors = new ArrayList<>();
        
        if (!(data instanceof Map)) {
            errors.add("Content section must be a Map");
            return errors;
        }
        
        // Add content-specific validation here
        return errors;
    }
    
    private List<String> validateStorageSection(Object data) {
        List<String> errors = new ArrayList<>();
        
        if (!(data instanceof Map)) {
            errors.add("Storage section must be a Map");
            return errors;
        }
        
        // Add storage-specific validation here
        return errors;
    }
    
    private List<String> validateSecuritySection(Object data) {
        List<String> errors = new ArrayList<>();
        
        if (!(data instanceof Map)) {
            errors.add("Security section must be a Map");
            return errors;
        }
        
        // Add security-specific validation here
        return errors;
    }
    
    private List<String> validateVersioningSection(Object data) {
        List<String> errors = new ArrayList<>();
        
        if (!(data instanceof Map)) {
            errors.add("Versioning section must be a Map");
            return errors;
        }
        
        // Add versioning-specific validation here
        return errors;
    }
    
    private List<String> validateAuditSection(Object data) {
        List<String> errors = new ArrayList<>();
        
        if (!(data instanceof Map)) {
            errors.add("Audit section must be a Map");
            return errors;
        }
        
        // Add audit-specific validation here
        return errors;
    }
}
