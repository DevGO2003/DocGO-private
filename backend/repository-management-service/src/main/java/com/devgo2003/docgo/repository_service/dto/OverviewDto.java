package com.devgo2003.docgo.repository_service.dto;

import com.devgo2003.docgo.repository_service.enums.DocumentStatus;
import com.devgo2003.docgo.repository_service.enums.DocumentType;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OverviewDto {
    private String title;
    private DocumentStatus status;           // Enum: ACTIVE, DRAFT, DELETED, ARCHIVED, INACTIVE, UNKNOWN
    private DocumentType documentType;     // Enum: CONTRACT, INVOICE, MEMO, REPORT, AGREEMENT, UNKNOWN
    private List<String> tags;
    private String ownerUserId;
    private String language;         // Enum: vi, en, fr, zh (ISO 639-1 lowercase)
    private String region;           // Enum: VN, US, EU, APAC (ISO 3166-1 uppercase)
    private Boolean isNew;
}

