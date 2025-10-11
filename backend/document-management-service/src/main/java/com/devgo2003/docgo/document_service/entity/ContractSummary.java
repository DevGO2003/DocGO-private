package com.devgo2003.docgo.document_service.entity;

import com.devgo2003.docgo.document_service.enums.ContractStatus;
import com.devgo2003.docgo.document_service.enums.ContractType;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Entity ContractSummary - Lưu trữ thông tin tóm tắt hợp đồng được AI phân tích
 * Liên kết với Contract qua contractId với lazy loading
 */
@Document(collection = "contract_summaries")
@Getter
@Setter
public class ContractSummary extends BaseEntity implements Persistable<String> {

    @Id
    @MongoId
    private String id;

    @Field("contract_id")
    @NotBlank(message = "ID hợp đồng không được để trống")
    private String contractId;

    @Field("contract_number")
    @NotBlank(message = "Số hợp đồng không được để trống")
    @Size(min = 3, max = 50, message = "Số hợp đồng phải từ 3-50 ký tự")
    private String contractNumber;

    @NotNull(message = "Trạng thái hợp đồng không được để trống")
    private ContractStatus status;

    @Field("contract_type")
    @NotNull(message = "Loại hợp đồng không được để trống")
    private ContractType contractType;

    @NotBlank(message = "Tiêu đề hợp đồng không được để trống")
    @Size(min = 5, max = 200, message = "Tiêu đề hợp đồng phải từ 5-200 ký tự")
    private String title;

    @Field("tags")
    private List<String> tags;

    @Field("parties")
    private List<ContractParty> parties;

    @Field("contract_object")
    @Size(max = 500, message = "Đối tượng hợp đồng không được vượt quá 500 ký tự")
    private String contractObject;

    @Field("effective_date")
    @Size(max = 100, message = "Ngày hiệu lực không được vượt quá 100 ký tự")
    private String effectiveDate;

    @Field("contract_term")
    @Size(max = 100, message = "Thời hạn hợp đồng không được vượt quá 100 ký tự")
    private String contractTerm;

    @Field("payment_details")
    private ContractPaymentDetails paymentDetails;

    @Field("key_clauses")
    private List<ContractKeyClause> keyClauses;

    @Field("favorable_clauses")
    private List<ContractFavorableClause> favorableClauses;

    @Field("unfavorable_clauses")
    private List<ContractUnfavorableClause> unfavorableClauses;

    @Field("reminders")
    private List<ContractReminder> reminders;

    @Field("termination_conditions")
    @Size(max = 1000, message = "Điều kiện chấm dứt không được vượt quá 1000 ký tự")
    private String terminationConditions;

    @Field("risk_assessment")
    private ContractRiskAssessment riskAssessment;

    @Field("compliance_status")
    private ContractComplianceStatus complianceStatus;

    @Field("ai_processed")
    private Boolean aiProcessed = false;

    @Field("processing_status")
    private ProcessingStatus processingStatus = ProcessingStatus.PENDING_REVIEW;

    @Field("last_ai_analysis")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime lastAiAnalysis;

    @Field("ai_confidence_score")
    @Pattern(regexp = "^([0-9]|[1-9][0-9]|100)$", message = "Điểm tin cậy AI phải từ 0-100")
    private String aiConfidenceScore;

    @Override
    public String getId() {
        return this.id;
    }

    @Override
    public boolean isNew() {
        return this.getId() == null;
    }

    /**
     * Khởi tạo contract summary mới với các giá trị mặc định
     */
    public static ContractSummary createNew(String contractId) {
        ContractSummary summary = new ContractSummary();
        summary.id = null;
        summary.contractId = contractId;
        summary.initializeNewEntity();
        summary.setAiProcessed(false);
        summary.setProcessingStatus(ProcessingStatus.PENDING_REVIEW);
        return summary;
    }

    public enum ProcessingStatus {
        PENDING_REVIEW, PROCESSING, COMPLETED, FAILED
    }
}