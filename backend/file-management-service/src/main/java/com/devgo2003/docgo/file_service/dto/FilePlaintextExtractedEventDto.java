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
public class FilePlaintextExtractedEventDto {

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
        @JsonProperty("plaintext")
        private String plaintext;
        @JsonProperty("ocr")
        private OcrDto ocr;
        @JsonProperty("jsonContent")
        private String jsonContent;
        @JsonProperty("classification")
        private ClassificationDto classification;
        @JsonProperty("processing")
        private ProcessingDto processing;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OcrDto {
        @JsonProperty("text")
        private String text;
        @JsonProperty("status")
        private String status; // COMPLETED|SKIPPED|FAILED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ClassificationDto {
        @JsonProperty("documentType")
        private String documentType;
        @JsonProperty("isContract")
        private Boolean isContract;
        @JsonProperty("confidence")
        private Double confidence;
        @JsonProperty("reasons")
        private List<String> reasons;
        @JsonProperty("contractSubtype")
        private String contractSubtype;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ProcessingDto {
        @JsonProperty("status")
        private String status; // COMPLETED|PARTIAL|FAILED
        @JsonProperty("error")
        private String error;
    }
}


