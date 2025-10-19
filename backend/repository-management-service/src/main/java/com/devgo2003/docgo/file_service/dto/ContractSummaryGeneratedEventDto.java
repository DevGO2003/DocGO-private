package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractSummaryGeneratedEventDto {
    @JsonProperty("eventVersion")
    private String eventVersion;
    
    @JsonProperty("eventType")
    private String eventType;
    
    @JsonProperty("eventId")
    private String eventId;
    
    @JsonProperty("timestamp")
    private String timestamp;
    
    @JsonProperty("source")
    private String source;
    
    @JsonProperty("correlationId")
    private String correlationId;
    
    @JsonProperty("actor")
    private Actor actor;
    
    @JsonProperty("data")
    private DataPayload data;
    
    @JsonProperty("metadata")
    private Metadata metadata;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Actor {
        @JsonProperty("userId")
        private String userId;
        
        @JsonProperty("userRole")
        private String userRole;
        
        @JsonProperty("ip")
        private String ip;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DataPayload {
        @JsonProperty("fileId")
        private String fileId;
        
        @JsonProperty("summaryResult")
        private SummaryResult summaryResult;
        
        @JsonProperty("contractMetadata")
        private ContractMetadata contractMetadata;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SummaryResult {
        @JsonProperty("summary")
        private String summary;
        
        @JsonProperty("keyClauses")
        private java.util.List<KeyClause> keyClauses;
        
        @JsonProperty("payment")
        private Payment payment;
        
        @JsonProperty("risk")
        private Risk risk;
        
        @JsonProperty("compliance")
        private Compliance compliance;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeyClause {
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("description")
        private String description;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("importance")
        private String importance;
        
        @JsonProperty("risk")
        private String risk;
        
        @JsonProperty("advice")
        private String advice;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Payment {
        @JsonProperty("schedule")
        private String schedule;
        
        @JsonProperty("totalValue")
        private Double totalValue;
        
        @JsonProperty("currency")
        private String currency;
        
        @JsonProperty("method")
        private String method;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Risk {
        @JsonProperty("riskLevel")
        private String riskLevel;
        
        @JsonProperty("factors")
        private java.util.List<RiskFactor> factors;
        
        @JsonProperty("mitigationProposals")
        private java.util.List<MitigationProposal> mitigationProposals;
        
        @JsonProperty("advice")
        private String advice;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskFactor {
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("description")
        private String description;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("probability")
        private String probability;
        
        @JsonProperty("impact")
        private String impact;
        
        @JsonProperty("riskToParties")
        private java.util.List<Party> riskToParties;
        
        @JsonProperty("beneficiaries")
        private java.util.List<Party> beneficiaries;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MitigationProposal {
        @JsonProperty("description")
        private String description;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("cost")
        private String cost;
        
        @JsonProperty("timeline")
        private String timeline;
        
        @JsonProperty("assignedTo")
        private String assignedTo;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Party {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("name")
        private String name;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Compliance {
        @JsonProperty("regulations")
        private java.util.List<String> regulations;
        
        @JsonProperty("certifications")
        private java.util.List<String> certifications;
        
        @JsonProperty("auditSchedule")
        private String auditSchedule;
        
        @JsonProperty("complianceStatus")
        private String complianceStatus;
        
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("issues")
        private java.util.List<String> issues;
        
        @JsonProperty("recommendations")
        private java.util.List<String> recommendations;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractMetadata {
        @JsonProperty("parties")
        private java.util.List<ContractParty> parties;
        
        @JsonProperty("payment")
        private ContractPayment payment;
        
        @JsonProperty("clauses")
        private ContractClauses clauses;
        
        @JsonProperty("reminders")
        private java.util.List<Reminder> reminders;
        
        @JsonProperty("risk")
        private ContractRisk risk;
        
        @JsonProperty("compliance")
        private ContractCompliance compliance;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractParty {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("role")
        private String role;
        
        @JsonProperty("contact")
        private Contact contact;
        
        @JsonProperty("representative")
        private Representative representative;
        
        @JsonProperty("taxCode")
        private String taxCode;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Contact {
        @JsonProperty("email")
        private String email;
        
        @JsonProperty("phone")
        private String phone;
        
        @JsonProperty("address")
        private String address;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Representative {
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("position")
        private String position;
        
        @JsonProperty("email")
        private String email;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractPayment {
        @JsonProperty("schedule")
        private java.util.List<PaymentSchedule> schedule;
        
        @JsonProperty("method")
        private String method;
        
        @JsonProperty("paymentMethod")
        private String paymentMethod;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentSchedule {
        @JsonProperty("milestone")
        private String milestone;
        
        @JsonProperty("percentage")
        private Integer percentage;
        
        @JsonProperty("amount")
        private Double amount;
        
        @JsonProperty("dueDate")
        private String dueDate;
        
        @JsonProperty("status")
        private String status;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractClauses {
        @JsonProperty("key")
        private java.util.List<KeyClause> key;
        
        @JsonProperty("unfavorable")
        private java.util.List<UnfavorableClause> unfavorable;
        
        @JsonProperty("intellectualProperty")
        private String intellectualProperty;
        
        @JsonProperty("confidentiality")
        private String confidentiality;
        
        @JsonProperty("warranty")
        private String warranty;
        
        @JsonProperty("termination")
        private String termination;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnfavorableClause {
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("description")
        private String description;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("risk")
        private String risk;
        
        @JsonProperty("advice")
        private String advice;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reminder {
        @JsonProperty("id")
        private String id;
        
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("title")
        private String title;
        
        @JsonProperty("description")
        private String description;
        
        @JsonProperty("content")
        private String content;
        
        @JsonProperty("dueDate")
        private String dueDate;
        
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("priority")
        private String priority;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractRisk {
        @JsonProperty("riskLevel")
        private String riskLevel;
        
        @JsonProperty("factors")
        private java.util.List<RiskFactor> factors;
        
        @JsonProperty("mitigationProposals")
        private java.util.List<MitigationProposal> mitigationProposals;
        
        @JsonProperty("advice")
        private String advice;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractCompliance {
        @JsonProperty("regulations")
        private java.util.List<String> regulations;
        
        @JsonProperty("certifications")
        private java.util.List<String> certifications;
        
        @JsonProperty("auditSchedule")
        private String auditSchedule;
        
        @JsonProperty("complianceStatus")
        private String complianceStatus;
        
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("issues")
        private java.util.List<String> issues;
        
        @JsonProperty("recommendations")
        private java.util.List<String> recommendations;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Metadata {
        @JsonProperty("serviceVersion")
        private String serviceVersion;
        
        @JsonProperty("region")
        private String region;
    }
}