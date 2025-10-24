package com.devgo2003.docgo.repository_service.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * FileUpdateRequest - DTO for updating existing files
 * 
 * All fields are optional for partial updates
 * Only provided fields will be updated
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileUpdateRequest {
    
    @Size(max = 255, message = "Tên file không được vượt quá 255 ký tự")
    private String title;
    
    private String documentType;
    
    @Size(max = 10, message = "Mã ngôn ngữ không được vượt quá 10 ký tự")
    private String language;
    
    @Size(max = 10, message = "Mã vùng không được vượt quá 10 ký tự")
    private String region;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    // Optional: Update any section
    private Map<String, Object> overview;
    private Map<String, Object> metadata;
    private Map<String, Object> contract;
    private Map<String, Object> content;
    private Map<String, Object> storage;
    private Map<String, Object> security;
    private Map<String, Object> versioning;
    private Map<String, Object> audit;
}
