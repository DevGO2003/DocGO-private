package com.devgo2003.docgo.file_service.dto;

import com.devgo2003.docgo.file_service.enums.ContractStatus;
import com.devgo2003.docgo.file_service.enums.ContractType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * DTO cho request tạo ContractSummary
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractSummaryCreateRequest {

    @NotBlank(message = "ID hợp đồng không được để trống")
    private String contractId;

    @NotBlank(message = "Số hợp đồng không được để trống")
    @Size(min = 3, max = 50, message = "Số hợp đồng phải từ 3-50 ký tự")
    private String contractNumber;

    @NotNull(message = "Trạng thái hợp đồng không được để trống")
    private ContractStatus status;

    @NotNull(message = "Loại hợp đồng không được để trống")
    private ContractType contractType;

    @NotBlank(message = "Tiêu đề hợp đồng không được để trống")
    @Size(min = 5, max = 200, message = "Tiêu đề hợp đồng phải từ 5-200 ký tự")
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

    // Nested DTOs (reuse from ContractSummaryResponseDto)
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
