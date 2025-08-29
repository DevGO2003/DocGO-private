package com.devgo2003.docgo.contract_service.dto;

import com.devgo2003.docgo.contract_service.entity.Contract;
import com.devgo2003.docgo.contract_service.entity.ContractSummary;
import com.devgo2003.docgo.contract_service.entity.ContractParty;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;
import java.util.ArrayList;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContractResponseDto {
    private Long id;
    private String contractNumber;
    private String title;
    private String status;
    private String summary;
    private String contractType;
    private String riskLevel;
    private String keyTerms;
    private Boolean aiProcessed;
    private String processingStatus;
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime deletedAt;
    private String deletedBy;
    private Boolean isDeleted;
    private Long version;
    
    // New fields from updated schema
    private String contractObject;
    private String effectiveDate;
    private String contractTerm;
    private String totalValue;
    private String paymentSchedule;
    private String currency;
    private String terminationConditions;
    private String riskAssessment;
    private String complianceStatus;
    private Boolean legalReviewRequired;
    private LocalDateTime reviewDeadline;
    
    // Contract summary structure
    private ContractSummaryResponseDto contractSummary;
    
    // Related data
    private List<ContractSummaryResponseDto> summaries;
    private List<ContractPartyDto> parties;
    
    public static ContractResponseDto fromContract(Contract contract, List<ContractSummary> summaries, List<ContractParty> parties) {
        // Tạo contract summary chính từ dữ liệu contract
        ContractSummaryResponseDto mainSummary = ContractSummaryResponseDto.builder()
                .title(contract.getTitle())
                .parties(parties.stream().map(ContractResponseDto::convertToContractPartyDto).collect(Collectors.toList()))
                .object(contract.getContractObject())
                .effectiveDate(contract.getEffectiveDate())
                .term(contract.getContractTerm())
                .paymentDetails(PaymentDetailsDto.builder()
                        .totalValue(contract.getTotalValue())
                        .schedule(contract.getPaymentSchedule())
                        .currency(contract.getCurrency())
                        .build())
                .keyClauses(extractKeyClauses(contract.getKeyTerms()))
                .favorableClauses(extractFavorableClauses(contract.getKeyTerms()))
                .unfavorableClauses(extractUnfavorableClauses(contract.getKeyTerms()))
                .terminationConditions(contract.getTerminationConditions())
                .build();
        
        return ContractResponseDto.builder()
                .id(contract.getId())
                .contractNumber(contract.getContractNumber())
                .title(contract.getTitle())
                .status(contract.getStatus() != null ? contract.getStatus().name() : null)
                .summary(contract.getSummary())
                .contractType(contract.getContractType())
                .riskLevel(contract.getRiskLevel())
                .keyTerms(contract.getKeyTerms())
                .aiProcessed(contract.getAiProcessed())
                .processingStatus(contract.getProcessingStatus() != null ? contract.getProcessingStatus().name() : null)
                .createdAt(contract.getCreatedAt())
                .createdBy(contract.getCreatedBy())
                .deletedAt(contract.getDeletedAt())
                .deletedBy(contract.getDeletedBy())
                .isDeleted(contract.getIsDeleted())
                .version(contract.getVersion())
                .contractObject(contract.getContractObject())
                .effectiveDate(contract.getEffectiveDate())
                .contractTerm(contract.getContractTerm())
                .totalValue(contract.getTotalValue())
                .paymentSchedule(contract.getPaymentSchedule())
                .currency(contract.getCurrency())
                .terminationConditions(contract.getTerminationConditions())
                .riskAssessment(contract.getRiskAssessment())
                .complianceStatus(contract.getComplianceStatus())
                .legalReviewRequired(contract.getLegalReviewRequired())
                .reviewDeadline(contract.getReviewDeadline() != null ? contract.getReviewDeadline().atStartOfDay() : null)
                .contractSummary(mainSummary)
                .summaries(summaries.stream().map(ContractSummaryResponseDto::fromContractSummary).collect(Collectors.toList()))
                .parties(parties.stream().map(ContractResponseDto::convertToContractPartyDto).collect(Collectors.toList()))
                .build();
    }
    
    private static ContractPartyDto convertToContractPartyDto(ContractParty party) {
        return ContractPartyDto.builder()
                .id(party.getId())
                .contractId(party.getContractId())
                .partyName(party.getPartyName())
                .partyRole(party.getPartyRole())
                .representative(party.getRepresentative())
                .taxCode(party.getTaxCode())
                .contactInfo(party.getContactInfo())
                .address(party.getAddress())
                .businessLicense(party.getBusinessLicense())
                .partyType(party.getPartyType() != null ? party.getPartyType().name() : null)
                .isPrimary(party.getIsPrimary())
                .createdAt(party.getCreatedAt())
                .updatedAt(party.getUpdatedAt())
                .build();
    }
    
    private static List<ClauseDto> extractKeyClauses(String keyTerms) {
        // Logic để extract key clauses từ keyTerms
        // Đây là implementation đơn giản, có thể cần cải thiện
        return new ArrayList<>();
    }
    
    private static List<FavorableClauseDto> extractFavorableClauses(String keyTerms) {
        // Logic để extract favorable clauses từ keyTerms
        return new ArrayList<>();
    }
    
    private static List<UnfavorableClauseDto> extractUnfavorableClauses(String keyTerms) {
        // Logic để extract unfavorable clauses từ keyTerms
        return new ArrayList<>();
    }
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class ContractSummaryResponseDto {
    private String title;
    private List<ContractPartyDto> parties;
    private String object;
    private String effectiveDate;
    private String term;
    private PaymentDetailsDto paymentDetails;
    private List<ClauseDto> keyClauses;
    private List<FavorableClauseDto> favorableClauses;
    private List<UnfavorableClauseDto> unfavorableClauses;
    private String terminationConditions;
    
    public static ContractSummaryResponseDto fromContractSummary(ContractSummary summary) {
        return ContractSummaryResponseDto.builder()
                .title(summary.getFilename())
                .object(summary.getSummary())
                .build();
    }
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class PaymentDetailsDto {
    private String totalValue;
    private String schedule;
    private String currency;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class ClauseDto {
    private String name;
    private String description;
    private String source;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class FavorableClauseDto {
    private String clauseName;
    private String description;
    private String benefitTo;
}

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
class UnfavorableClauseDto {
    private String clauseName;
    private String description;
    private String riskTo;
}
