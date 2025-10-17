package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Contract {
    private String effectiveDate;
    private String expiryDate;
    private Long totalValue;
    private String currency;
    private String summary;
    private List<Party> parties;
    private PaymentDetails payment;
    private Clauses clauses;
    private List<Reminder> reminders;
    private RiskAssessment risk;
    private ComplianceStatus compliance;
}
