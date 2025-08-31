package com.devgo2003.docgo.contract_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "contract_risk_assessments")
@Getter
@Setter
public class ContractRiskAssessment extends BaseEntity {

    @Id
    private String id;

    @Field("contract_id")
    private String contractId;

    @Field("risk_level")
    private String riskLevel;

    @Field("risk_factors")
    private String riskFactors;

    @Field("mitigation_measures")
    private String mitigationMeasures;

    @Field("assessment_date")
    private String assessmentDate;
}
