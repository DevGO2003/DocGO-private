package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskDto {
    private String level;
    private String score;
    private List<RiskFactorDto> factors;
    private List<String> mitigation;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RiskFactorDto {
        private String name;
        private String level;
        private String description;
        private String impact;
    }
}
