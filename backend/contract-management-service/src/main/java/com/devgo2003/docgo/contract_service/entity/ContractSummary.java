package com.devgo2003.docgo.contract_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contract_summaries")
@Getter
@Setter
public class ContractSummary extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "contract_id", nullable = false)
    private Long contractId;

    @Column(name = "file_id")
    private String fileId;

    @Column(name = "filename")
    private String filename;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "summary_length")
    private Integer summaryLength;

    @Column(name = "key_points", columnDefinition = "JSON")
    private String keyPoints;

    @Column(name = "extraction_method")
    private String extractionMethod;

    @Column(name = "confidence", precision = 3, scale = 2)
    private BigDecimal confidence;

    @Column(name = "classification")
    private String classification;

    @Column(name = "classification_confidence", precision = 3, scale = 2)
    private BigDecimal classificationConfidence;

    @Column(name = "categories", columnDefinition = "JSON")
    private String categories;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationship with Contract
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    private Contract contract;
}
