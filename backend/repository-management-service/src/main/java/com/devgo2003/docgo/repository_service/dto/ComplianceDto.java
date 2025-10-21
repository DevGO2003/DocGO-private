package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ComplianceDto {
    private String status;
    private List<RequirementDto> requirements;
    private List<String> regulations;
    private List<String> issues;
    private List<String> recommendations;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RequirementDto {
        private String name;
        private String status;
        private String description;
    }
}
