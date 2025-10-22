package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FullFileResponseDto {
    private String id;
    private OverviewDto overview;
    private MetadataDto metadata;
    private ContractDto contract;
    private ContentDto content;
    private StorageDto storage;
    private SecurityDto security;
    private VersioningDto versioning;
    private AuditDto audit;
}

