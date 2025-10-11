package com.devgo2003.docgo.document_service.dto;

import com.devgo2003.docgo.document_service.entity.ContractSummary;
import com.devgo2003.docgo.document_service.enums.ContractStatus;
import com.devgo2003.docgo.document_service.enums.ContractType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho response ContractSummary
 * Map từ entity sang format phù hợp với frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractSummaryResponseDto {

    private String id;
    private String contractId;
    private String contractNumber;
    private ContractStatus status;
    private ContractType contractType;
    private String title;
    private List<String> tags;
    private List<ContractPartyDto> parties;
    private String contractObject;
    private String effectiveDate;
    private String contractTerm;
    private ContractPaymentDetailsDto paymentDetails;
    private List<ContractKeyClauseDto> keyClauses;
    private List<ContractFavorableClauseDto> favorableClauses;
    private List<ContractUnfavorableClauseDto> unfavorableClauses;
    private List<ContractReminderDto> reminders;
    private String terminationConditions;
    private ContractRiskAssessmentDto riskAssessment;
    private ContractComplianceStatusDto complianceStatus;
    private Boolean aiProcessed;
    private ContractSummary.ProcessingStatus processingStatus;
    private LocalDateTime lastAiAnalysis;
    private String aiConfidenceScore;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Nested DTOs
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractPartyDto {
        private String role;
        private String name;
        private String representative;
        private String taxCode;
        private String contact;
        private String address;
        private String businessLicense;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractPaymentDetailsDto {
        private String totalValue;
        private String schedule;
        private String currency;
        private String paymentMethod;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractKeyClauseDto {
        private String name;
        private String description;
        private String source;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractFavorableClauseDto {
        private String clauseName;
        private String description;
        private String benefitTo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractUnfavorableClauseDto {
        private String clauseName;
        private String description;
        private String riskTo;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractReminderDto {
        private String type;
        private String date;
        private String content;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractRiskAssessmentDto {
        private String riskLevel;
        private List<String> riskFactors;
        private List<String> mitigationMeasures;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractComplianceStatusDto {
        private String status;
        private List<String> issues;
        private List<String> recommendations;
    }
}
