package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContractDto {
    private LocalDateTime effectiveDate;
    private LocalDateTime expiryDate;
    private Double totalValue;
    private String currency;
    private String summary;
    private String project;
    private String department;
    private String priority;
    private String confidentiality;
    private WorkflowDto workflow;
    private List<PartyDto> parties;
    private PaymentDto payment;
    private ClausesDto clauses;
    private List<ReminderDto> reminders;
    private RiskDto risk;
    private ComplianceDto compliance;
}
