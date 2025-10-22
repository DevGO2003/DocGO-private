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
    /**
     * Contract type
     * Enum: SERVICE_AGREEMENT, PURCHASE_AGREEMENT, PARTNERSHIP_AGREEMENT, EMPLOYMENT_CONTRACT, 
     *       SALES_CONTRACT, LEASE_AGREEMENT, LICENSE_AGREEMENT, NON_DISCLOSURE_AGREEMENT, 
     *       SOFTWARE_DEVELOPMENT, CONSULTING_AGREEMENT, OTHERS
     */
    private String type;
    
    private LocalDateTime effectiveDate;
    private LocalDateTime expiryDate;
    private Double totalValue;
    
    /**
     * Payment currency
     * Enum: USD, VND, EUR, JPY
     */
    private String currency;
    
    private String summary;
    private String project;
    private String department;
    
    /**
     * Contract priority
     * Enum: HIGH, MEDIUM, LOW
     */
    private String priority;
    
    /**
     * Confidentiality level
     * Enum: CONFIDENTIAL, INTERNAL, PUBLIC, RESTRICTED
     */
    private String confidentiality;
    
    private WorkflowDto workflow;
    private List<PartyDto> parties;
    private PaymentDto payment;
    private ClausesDto clauses;
    private List<ReminderDto> reminders;
    private RiskDto risk;
    private ComplianceDto compliance;
}
