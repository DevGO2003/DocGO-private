package com.devgo2003.docgo.repository_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * FileResponse - Basic file response DTO
 * 
 * Contains essential file information for API responses
 * Used for single file operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileResponse {
    
    private String id;
    private String title;
    private String documentType;
    private String status;
    private String ownerUserId;
    private String language;
    private String region;
    private String description;
    
    // File metadata
    private String mimeType;
    private Long size;
    
    // Timestamps (ISO-8601 String with timezone)
    private String createdAt;
    private String updatedAt;
    private String createdBy;
    private String updatedBy;
    
    // Soft delete flag
    private Boolean isDeleted;
    
    // Optional: Basic overview section
    private Map<String, Object> overview;
    
    // Optional: Basic metadata section
    private Map<String, Object> metadata;
}
