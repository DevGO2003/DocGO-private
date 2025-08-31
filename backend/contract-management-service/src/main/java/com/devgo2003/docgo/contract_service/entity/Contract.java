package com.devgo2003.docgo.contract_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "contracts")
@Getter
@Setter
public class Contract extends BaseEntity {

    @Id
    private String id;

    @Field("contract_number")
    private String contractNumber;

    private String title;

    private ContractStatus status;

    @Field("parties_json")
    private String partiesJson;

    @Field("start_date")
    private LocalDate startDate;

    @Field("end_date")
    private LocalDate endDate;

    @Field("system_id")
    private String systemId;

    // Thông tin tóm tắt hợp đồng
    private String summary;

    @Field("contract_type")
    private String contractType;

    @Field("risk_level")
    private String riskLevel;

    @Field("key_terms")
    private String keyTerms;
    
    @Field("favorable_clauses")
    private String favorableClauses;
    
    @Field("unfavorable_clauses")
    private String unfavorableClauses;
    
    @Field("payment_currency")
    private String paymentCurrency;

    @Field("ai_processed")
    private Boolean aiProcessed = false;

    @Field("processing_status")
    private ProcessingStatus processingStatus = ProcessingStatus.PENDING;

    // New fields from updated schema
    @Field("contract_object")
    private String contractObject;

    @Field("effective_date")
    private String effectiveDate;

    @Field("contract_term")
    private String contractTerm;

    @Field("total_value")
    private String totalValue;

    @Field("payment_schedule")
    private String paymentSchedule;

    private String currency;

    @Field("payment_method")
    private String paymentMethod;

    private String reminders;

    @Field("termination_conditions")
    private String terminationConditions;

    @Field("risk_assessment")
    private String riskAssessment;

    @Field("compliance_status")
    private String complianceStatus;

    @Field("legal_review_required")
    private Boolean legalReviewRequired = false;

    @Field("review_deadline")
    private LocalDate reviewDeadline;
    
    private String tags;

    public enum ContractStatus {
        DRAFT, PENDING, PENDING_APPROVAL, ACTIVE, EXPIRED, ARCHIVED
    }

    public enum ProcessingStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
}
