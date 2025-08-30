package com.devgo2003.docgo.contract_service.dto;

import com.devgo2003.docgo.contract_service.entity.Contract;
import com.devgo2003.docgo.contract_service.entity.ContractParty;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContractDetailResponseDto {
    private Long id;
    private String contractNumber;
    private String title;
    private String status;
    private String contractType;
    private String riskLevel;
    
    // Key terms với cấu trúc mới
    private List<KeyTermDto> keyTerms;
    
    // Favorable clauses với cấu trúc mới
    private List<FavorableClauseDto> favorableClauses;
    
    // Unfavorable clauses với cấu trúc mới
    private List<UnfavorableClauseDto> unfavorableClauses;
    
    // Contract object và terms
    private String contractObject;
    private String effectiveDate;
    private String contractTerm;
    
    // Payment information với cấu trúc mới
    private PaymentDto payment;
    
    // Termination conditions
    private String terminationConditions;
    
    // Risk assessment với cấu trúc mới
    private RiskAssessmentDto riskAssessment;
    
    // Compliance status với cấu trúc mới
    private ComplianceStatusDto complianceStatus;
    
    // Parties với cấu trúc mới
    private List<PartyDto> parties;
    
    public static ContractDetailResponseDto fromContract(Contract contract, List<ContractParty> parties) {
        return ContractDetailResponseDto.builder()
                .id(contract.getId())
                .contractNumber(contract.getContractNumber())
                .title(contract.getTitle())
                .status(contract.getStatus() != null ? contract.getStatus().name() : null)
                .contractType(contract.getContractType())
                .riskLevel(contract.getRiskLevel())
                .keyTerms(extractKeyTerms(contract.getKeyTerms()))
                .favorableClauses(extractFavorableClauses(contract.getFavorableClauses()))
                .unfavorableClauses(extractUnfavorableClauses(contract.getUnfavorableClauses()))
                .contractObject(contract.getContractObject())
                .effectiveDate(contract.getEffectiveDate())
                .contractTerm(contract.getContractTerm())
                .payment(PaymentDto.builder()
                        .totalValue(contract.getTotalValue())
                        .schedule(contract.getPaymentSchedule())
                        .currency(contract.getPaymentCurrency() != null ? contract.getPaymentCurrency() : contract.getCurrency())
                        .method(contract.getPaymentMethod())
                        .build())
                .terminationConditions(contract.getTerminationConditions())
                .riskAssessment(RiskAssessmentDto.builder()
                        .riskLevel(contract.getRiskLevel())
                        .riskFactors(extractRiskFactors(contract.getRiskAssessment()))
                        .mitigationMeasures(extractMitigationMeasures(contract.getRiskAssessment()))
                        .build())
                .complianceStatus(ComplianceStatusDto.builder()
                        .status(contract.getComplianceStatus())
                        .issues(extractComplianceIssues(contract.getComplianceStatus()))
                        .recommendations(extractComplianceRecommendations(contract.getComplianceStatus()))
                        .build())
                .parties(parties.stream().map(ContractDetailResponseDto::convertToPartyDto).collect(Collectors.toList()))
                .build();
    }
    
    private static PartyDto convertToPartyDto(ContractParty party) {
        return PartyDto.builder()
                .role(party.getPartyRole())
                .name(party.getPartyName())
                .representative(party.getRepresentative())
                .tax_code(party.getTaxCode())
                .contact(party.getContact())
                .address(party.getAddress())
                .build();
    }
    
    // Helper methods để extract data từ JSON strings
    private static List<KeyTermDto> extractKeyTerms(String keyTerms) {
        if (keyTerms == null || keyTerms.isEmpty()) return new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(keyTerms, new TypeReference<List<KeyTermDto>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private static List<FavorableClauseDto> extractFavorableClauses(String keyTerms) {
        if (keyTerms == null || keyTerms.isEmpty()) return new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(keyTerms, new TypeReference<List<FavorableClauseDto>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private static List<UnfavorableClauseDto> extractUnfavorableClauses(String keyTerms) {
        if (keyTerms == null || keyTerms.isEmpty()) return new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(keyTerms, new TypeReference<List<UnfavorableClauseDto>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private static List<String> extractRiskFactors(String riskAssessment) {
        if (riskAssessment == null || riskAssessment.isEmpty()) return new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(riskAssessment, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private static List<String> extractMitigationMeasures(String riskAssessment) {
        if (riskAssessment == null || riskAssessment.isEmpty()) return new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(riskAssessment, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private static List<String> extractComplianceIssues(String complianceStatus) {
        if (complianceStatus == null || complianceStatus.isEmpty()) return new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(complianceStatus, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
    
    private static List<String> extractComplianceRecommendations(String complianceStatus) {
        if (complianceStatus == null || complianceStatus.isEmpty()) return new ArrayList<>();
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(complianceStatus, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class KeyTermDto {
    private String name;
    private String description;
    private String source;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class FavorableClauseDto {
    private String name;
    private String description;
    private String source;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class UnfavorableClauseDto {
    private String name;
    private String description;
    private String source;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class PaymentDto {
    private String totalValue;
    private String schedule;
    private String currency;
    private String method;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class RiskAssessmentDto {
    private String riskLevel;
    private List<String> riskFactors;
    private List<String> mitigationMeasures;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class ComplianceStatusDto {
    private String status;
    private List<String> issues;
    private List<String> recommendations;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class PartyDto {
    private String role;
    private String name;
    private String representative;
    private String tax_code;
    private String contact;
    private String address;
}
