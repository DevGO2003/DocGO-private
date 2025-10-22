package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RiskDto {
    /**
     * Overall risk level
     * Enum: LOW, MEDIUM, HIGH
     */
    private String level;
    
    private String score;
    private List<RiskFactorDto> factors;
    private List<MitigationProposalDto> mitigationProposals;
    private String advice;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RiskFactorDto {
        /**
         * Risk factor type
         * Enum: TECHNICAL, SCHEDULE, FINANCIAL, LEGAL, OPERATIONAL
         */
        private String type;
        
        private String description;
        private String content;
        
        /**
         * Risk probability
         * Enum: LOW, MEDIUM, HIGH
         */
        private String probability;
        
        /**
         * Risk impact
         * Enum: LOW, MEDIUM, HIGH
         */
        private String impact;
        
        private List<Map<String, String>> riskToParties;
        private List<Map<String, String>> beneficiaries;
    }
    
    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class MitigationProposalDto {
        private String description;
        private String content;
        
        /**
         * Mitigation cost estimate
         * Enum: LOW, MEDIUM, HIGH
         */
        private String cost;
        
        private String timeline;
        private String assignedTo;
    }
}
