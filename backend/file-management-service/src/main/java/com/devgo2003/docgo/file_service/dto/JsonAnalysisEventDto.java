package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class JsonAnalysisEventDto {
    
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
    private JsonAnalysisDataDto data;
    
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
    public static class JsonAnalysisDataDto {
        @JsonProperty("jobId")
        private String jobId;
        
        @JsonProperty("index")
        private Integer index;
        
        @JsonProperty("analysisResult")
        private Map<String, Object> analysisResult;
        
        @JsonProperty("eventType")
        private String eventType;
        
        @JsonProperty("itemIndex")
        private Integer itemIndex;
        
        @JsonProperty("status")
        private String status;
    }
}

