package com.devgo2003.docgo.contract_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractClauseDto {
    private Long id;
    private Long contractId;
    private String clauseName;
    private String clauseDescription;
    private String clauseSource;
    private String clauseType;
    private String riskLevel;
    private String benefitTo;
    private String riskTo;
    private String aiAnalysis;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
