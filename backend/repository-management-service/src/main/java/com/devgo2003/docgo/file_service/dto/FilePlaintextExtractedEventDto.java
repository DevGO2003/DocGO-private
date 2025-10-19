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
        
        @JsonProperty("plaintext")
        private String plaintext;
        
        @JsonProperty("ocr")
        private OcrInfo ocr;
        
        @JsonProperty("jsonContent")
        private Object jsonContent;
        
        @JsonProperty("classification")
        private Classification classification;
        
        @JsonProperty("processing")
        private Processing processing;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OcrInfo {
        @JsonProperty("text")
        private String text;
        
        @JsonProperty("status")
        private String status;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Classification {
        @JsonProperty("documentType")
        private String documentType;
        
        @JsonProperty("isContract")
        private Boolean isContract;
        
        @JsonProperty("confidence")
        private Double confidence;
        
        @JsonProperty("reasons")
        private java.util.List<String> reasons;
        
        @JsonProperty("contractSubtype")
        private String contractSubtype;
        
        @JsonProperty("category")
        private String category;
        
        @JsonProperty("language")
        private String language;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Processing {
        @JsonProperty("status")
        private String status;
        
        @JsonProperty("error")
        private String error;
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