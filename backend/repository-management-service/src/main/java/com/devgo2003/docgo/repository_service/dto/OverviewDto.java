package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

/**
 * Overview section - Document basic information
 */
@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OverviewDto {
    private String title;
    
    /**
     * Document status
     * Enum: ACTIVE, DRAFT, DELETED, ARCHIVED, INACTIVE
     */
    private String status;
    
    /**
     * Document type classification
     * Enum: CONTRACT, INVOICE, MEMO, REPORT, AGREEMENT, NOT_DOCUMENT
     */
    private String documentType;
    
    private List<String> tags;
    private String ownerUserId;
    
    /**
     * Document language (ISO 639-1 lowercase)
     * Enum: vi, en, fr, zh
     */
    private String language;
    
    /**
     * Document region (ISO 3166-1 uppercase)
     * Enum: VN, US, EU, APAC
     */
    private String region;
    
    private Boolean isNew;
}

