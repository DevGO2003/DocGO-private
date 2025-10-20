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
    private ContractDto contract;
    private ContentDto content;
    private FileInfoDto file;
    private StorageDto storage;
    private VersioningDto versioning;
    private MetadataDto metadata;
    private AuditDto audit;
    private Object processing;
}

