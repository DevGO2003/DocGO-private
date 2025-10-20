package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ClausesDto {
    private List<KeyClauseDto> key;
    private List<UnfavorableClauseDto> unfavorable;
    private String intellectualProperty;
    private String confidentiality;
    private String warranty;
    private String termination;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class KeyClauseDto {
        private String name;
        private String description;
        private String content;
        private String importance;
        private String risk;
        private String advice;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class UnfavorableClauseDto {
        private String name;
        private String description;
        private String content;
        private String risk;
        private String advice;
    }
}

