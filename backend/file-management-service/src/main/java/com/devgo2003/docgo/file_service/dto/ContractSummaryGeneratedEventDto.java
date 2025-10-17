package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
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
    private ActorDto actor;
    @JsonProperty("data")
    private DataDto data;
    @JsonProperty("metadata")
    private Map<String, Object> metadata;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ActorDto {
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DataDto {
        @JsonProperty("fileId")
        private String fileId;
        @JsonProperty("summary")
        private String summary;
        @JsonProperty("keyClauses")
        private List<KeyClauseDto> keyClauses;
        @JsonProperty("paymentDetails")
        private List<PaymentDetailDto> paymentDetails;
        @JsonProperty("riskAssessment")
        private RiskAssessmentDto riskAssessment;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KeyClauseDto {
        @JsonProperty("name")
        private String name;
        @JsonProperty("value")
        private String value;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class PaymentDetailDto {
        @JsonProperty("term")
        private String term;
        @JsonProperty("amount")
        private Long amount;
        @JsonProperty("currency")
        private String currency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class RiskAssessmentDto {
        @JsonProperty("level")
        private String level;
        @JsonProperty("notes")
        private String notes;
    }
}


