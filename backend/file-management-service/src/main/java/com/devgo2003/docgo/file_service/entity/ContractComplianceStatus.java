package com.devgo2003.docgo.file_service.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import java.util.List;

/**
 * Embedded entity cho trạng thái tuân thủ trong ContractSummary
 */
@Getter
@Setter
public class ContractComplianceStatus {

    @Field("status")
    @NotBlank(message = "Trạng thái tuân thủ không được để trống")
    @Pattern(regexp = "^(COMPLIANT|NON_COMPLIANT|PENDING_REVIEW|UNDER_REVIEW)$", message = "Trạng thái tuân thủ không hợp lệ")
    private String status;

    @Field("issues")
    private List<String> issues;

    @Field("recommendations")
    private List<String> recommendations;

    // Additional field for backward compatibility
    @Field("contract_id")
    private String contractId;
}