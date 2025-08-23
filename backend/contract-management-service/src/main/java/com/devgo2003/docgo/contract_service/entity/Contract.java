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

    public enum ContractStatus {
        DRAFT, PENDING, PENDING_APPROVAL, ACTIVE, EXPIRED, ARCHIVED
    }

    public enum ProcessingStatus {
        PENDING, PROCESSING, COMPLETED, FAILED
    }
}
