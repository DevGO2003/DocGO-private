package com.devgo2003.docgo.repository_service.dto;

import com.devgo2003.docgo.repository_service.enums.Currency;
import com.devgo2003.docgo.repository_service.enums.Priority;
import com.devgo2003.docgo.repository_service.enums.Confidentiality;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContractDto {
    private LocalDateTime effectiveDate;
    private LocalDateTime expiryDate;
    private Double totalValue;
    private Currency currency;              // Enum: USD, VND, EUR, JPY
    private String summary;
    private String project;
    private String department;
    private Priority priority;              // Enum: HIGH, MEDIUM, LOW, UNKNOWN
    private Confidentiality confidentiality; // Enum: CONFIDENTIAL, INTERNAL, PUBLIC, RESTRICTED, UNKNOWN
    private WorkflowDto workflow;
    private List<PartyDto> parties;
    private PaymentDto payment;
    private ClausesDto clauses;
    private List<ReminderDto> reminders;
    private RiskDto risk;
    private ComplianceDto compliance;
}
