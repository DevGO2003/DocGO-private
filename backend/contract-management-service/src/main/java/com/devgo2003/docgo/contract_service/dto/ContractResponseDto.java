package com.devgo2003.docgo.contract_service.dto;

import com.devgo2003.docgo.contract_service.entity.Contract;
import com.devgo2003.docgo.contract_service.entity.ContractSummary;
import com.devgo2003.docgo.contract_service.entity.ContractParty;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private String tags;
    
    // Related data
    private List<ContractSummaryDto> summaries;
    private List<ContractPartyDto> parties;
    
    public static ContractResponseDto fromContract(Contract contract, List<ContractSummary> summaries, List<ContractParty> parties) {
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
                .summaries(new ArrayList<>()) // Tạm thời để trống, sẽ được xử lý trong service
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
                .contact(party.getContact())
                .address(party.getAddress())
                .businessLicense(party.getBusinessLicense())
                .partyType(party.getPartyType() != null ? party.getPartyType().name() : null)
                .isPrimary(party.getIsPrimary())
                .createdAt(party.getCreatedAt())
                .updatedAt(party.getUpdatedAt())
                .build();
    }
    

}


