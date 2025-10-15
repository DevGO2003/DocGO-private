package com.devgo2003.docgo.file_service.entity;

import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Field;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Embedded entity cho đánh giá rủi ro trong ContractSummary
 */
@Getter
@Setter
public class ContractRiskAssessment {

    @Field("risk_level")
    @NotBlank(message = "Mức độ rủi ro không được để trống")
    @Pattern(regexp = "^(LOW|MEDIUM|HIGH|CRITICAL)$", message = "Mức độ rủi ro phải là LOW, MEDIUM, HIGH hoặc CRITICAL")
    private String riskLevel;

    @Field("risk_factors")
    private List<String> riskFactors;

    @Field("mitigation_measures")
    private List<String> mitigationMeasures;

    // Additional field for backward compatibility
    @Field("contract_id")
    private String contractId;
}