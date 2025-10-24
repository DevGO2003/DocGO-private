package com.devgo2003.docgo.repository_service.service.validation.impl;

import com.devgo2003.docgo.repository_service.dto.request.FileCreateRequest;
import com.devgo2003.docgo.repository_service.dto.request.FileUpdateRequest;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.service.validation.IFileValidationService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

@Service
public class FileValidationServiceImpl implements IFileValidationService {
    
    private static final Pattern UUID_PATTERN = Pattern.compile(
        "^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$", 
        Pattern.CASE_INSENSITIVE
    );
    
    private static final Pattern FILE_NAME_PATTERN = Pattern.compile(
        "^[^<>:\"/\\\\|?*]+$"
    );
    
    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
    private static final long MIN_FILE_SIZE = 1L; // 1 byte
    
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/json",
        "application/xml"
    );
    
    @Override
    public List<String> validateFileCreation(FileCreateRequest request) {
        List<String> errors = new ArrayList<>();
        
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            errors.add("File name is required");
        } else if (!isValidFileName(request.getName())) {
            errors.add("Invalid file name format");
        }
        
        if (request.getType() == null || request.getType().trim().isEmpty()) {
            errors.add("File type is required");
        }
        
        if (request.getSize() == null) {
            errors.add("File size is required");
        } else if (!isValidFileSize(request.getSize())) {
            errors.add("File size must be between 1 byte and 100MB");
        }
        
        if (request.getMimeType() == null || request.getMimeType().trim().isEmpty()) {
            errors.add("MIME type is required");
        } else if (!isValidMimeType(request.getMimeType())) {
            errors.add("Invalid MIME type");
        }
        
        return errors;
    }
    
    @Override
    public List<String> validateFileUpdate(FileUpdateRequest request) {
        List<String> errors = new ArrayList<>();
        
        if (request.getName() != null && !isValidFileName(request.getName())) {
            errors.add("Invalid file name format");
        }
        
        if (request.getSize() != null && !isValidFileSize(request.getSize())) {
            errors.add("File size must be between 1 byte and 100MB");
        }
        
        if (request.getMimeType() != null && !isValidMimeType(request.getMimeType())) {
            errors.add("Invalid MIME type");
        }
        
        return errors;
    }
    
    @Override
    public List<String> validateFileEntity(FileEntity fileEntity) {
        List<String> errors = new ArrayList<>();
        
        if (fileEntity.getId() == null || fileEntity.getId().trim().isEmpty()) {
            errors.add("File ID is required");
        } else if (!isValidFileId(fileEntity.getId())) {
            errors.add("Invalid file ID format");
        }
        
        if (fileEntity.getName() == null || fileEntity.getName().trim().isEmpty()) {
            errors.add("File name is required");
        } else if (!isValidFileName(fileEntity.getName())) {
            errors.add("Invalid file name format");
        }
        
        return errors;
    }
    
    @Override
    public boolean isValidFileId(String fileId) {
        if (fileId == null || fileId.trim().isEmpty()) {
            return false;
        }
        return UUID_PATTERN.matcher(fileId).matches();
    }
    
    @Override
    public boolean isValidFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            return false;
        }
        return FILE_NAME_PATTERN.matcher(fileName).matches() && 
               fileName.length() <= 255;
    }
    
    @Override
    public boolean isValidFileSize(Long fileSize) {
        if (fileSize == null) {
            return false;
        }
        return fileSize >= MIN_FILE_SIZE && fileSize <= MAX_FILE_SIZE;
    }
    
    @Override
    public boolean isValidMimeType(String mimeType) {
        if (mimeType == null || mimeType.trim().isEmpty()) {
            return false;
        }
        return ALLOWED_MIME_TYPES.contains(mimeType.toLowerCase());
    }
}
