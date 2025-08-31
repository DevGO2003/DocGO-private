package com.devgo2003.docgo.contract_service.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Getter;
import lombok.Setter;

@Document(collection = "contract_compliance_statuses")
@Getter
@Setter
public class ContractComplianceStatus extends BaseEntity {

    @Id
    private String id;

    @Field("contract_id")
    private String contractId;

    @Field("compliance_status")
    private String complianceStatus;

    @Field("compliance_issues")
    private String complianceIssues;

    @Field("compliance_recommendations")
    private String complianceRecommendations;

    @Field("last_review_date")
    private String lastReviewDate;
}
