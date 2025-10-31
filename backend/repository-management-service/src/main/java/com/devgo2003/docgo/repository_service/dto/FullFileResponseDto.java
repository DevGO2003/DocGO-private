package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * FullFileResponseDto - Complete Document Response
 * 
 * Strategy: Hybrid approach
 * - Use typed DTO for simple sections (overview)
 * - Use Map<String,Object> for complex nested sections
 * Benefits: Avoids Lombok type conflicts, provides flexibility
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FullFileResponseDto {
    private String id;
    private String repositoryId;
    private String userId;
    
    // Simple section - typed DTO
    private OverviewDto overview;
    
    // Complex sections - keep as Map for flexibility
    private Map<String, Object> metadata;
    private Map<String, Object> contract;
    private Map<String, Object> content;
    private Map<String, Object> storage;
    private Map<String, Object> security;
    private Map<String, Object> versioning;
    private Map<String, Object> audit;
}

