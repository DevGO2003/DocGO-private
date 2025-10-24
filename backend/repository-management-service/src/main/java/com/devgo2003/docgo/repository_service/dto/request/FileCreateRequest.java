package com.devgo2003.docgo.repository_service.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * FileCreateRequest - DTO for creating new files
 * 
 * Contains basic information required to create a new file entry
 * Additional sections will be populated via Kafka events
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FileCreateRequest {
    
    @NotBlank(message = "Tên file không được để trống")
    @Size(max = 255, message = "Tên file không được vượt quá 255 ký tự")
    private String title;
    
    @NotBlank(message = "Loại tài liệu không được để trống")
    private String documentType;
    
    @NotBlank(message = "ID người dùng sở hữu không được để trống")
    private String ownerUserId;
    
    @Size(max = 10, message = "Mã ngôn ngữ không được vượt quá 10 ký tự")
    private String language;
    
    @Size(max = 10, message = "Mã vùng không được vượt quá 10 ký tự")
    private String region;
    
    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;
    
    // Optional: Additional metadata
    private Map<String, Object> metadata;
    
    // Optional: Storage information
    private Map<String, Object> storage;
    
    // Optional: Security settings
    private Map<String, Object> security;
}
