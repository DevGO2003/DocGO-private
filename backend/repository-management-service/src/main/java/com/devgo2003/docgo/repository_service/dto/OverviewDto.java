package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OverviewDto {
    private String title;
    private String status;           // Enum: ACTIVE, DRAFT, DELETED, ARCHIVED, INACTIVE
    private String documentType;     // Enum: CONTRACT, INVOICE, MEMO, REPORT, AGREEMENT, NOT_DOCUMENT
    private List<String> tags;
    private String ownerUserId;
    private String language;         // Enum: vi, en, fr, zh (ISO 639-1 lowercase)
    private String region;           // Enum: VN, US, EU, APAC (ISO 3166-1 uppercase)
    private Boolean isNew;
}

