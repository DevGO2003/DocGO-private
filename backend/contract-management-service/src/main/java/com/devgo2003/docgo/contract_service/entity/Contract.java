package com.devgo2003.docgo.contract_service.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "contracts")
@Getter
@Setter
public class Contract extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_number", nullable = false, unique = true)
    private String contractNumber;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status;

    @Column(name = "parties_json", columnDefinition = "JSON")
    private String partiesJson;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "system_id")
    private String systemId;

    // Thông tin tóm tắt hợp đồng
    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "contract_type")
    private String contractType;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "key_terms", columnDefinition = "TEXT")
    private String keyTerms;

    @Column(name = "ai_processed")
    private Boolean aiProcessed = false;

    @Column(name = "processing_status")
    @Enumerated(EnumType.STRING)
    private ProcessingStatus processingStatus = ProcessingStatus.PENDING;

    // New fields from updated schema
    @Column(name = "contract_object", columnDefinition = "TEXT")
    private String contractObject;

    @Column(name = "effective_date")
    private String effectiveDate;

    @Column(name = "contract_term")
    private String contractTerm;

    @Column(name = "total_value")
    private String totalValue;

    @Column(name = "payment_schedule", columnDefinition = "TEXT")
    private String paymentSchedule;

    @Column(name = "currency")
    private String currency;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "reminders", columnDefinition = "JSON")
    private String reminders;

    @Column(name = "termination_conditions", columnDefinition = "TEXT")
    private String terminationConditions;

    @Column(name = "risk_assessment", columnDefinition = "TEXT")
    private String riskAssessment;

    @Column(name = "compliance_status")
    private String complianceStatus;

    @Column(name = "legal_review_required")
    private Boolean legalReviewRequired = false;

    @Column(name = "review_deadline")
    private LocalDate reviewDeadline;

    public enum ContractStatus {
        DRAFT, PENDING, PENDING_APPROVAL, ACTIVE, EXPIRED, ARCHIVED
    }

    public enum ProcessingStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
}
