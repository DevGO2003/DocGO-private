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
public class FileMetadataRecordedEventDto {
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
        
        @JsonProperty("name")
        private String name;
        
        @JsonProperty("contentType")
        private String contentType;
        
        @JsonProperty("size")
        private Long size;
        
        @JsonProperty("ownerUserId")
        private String ownerUserId;
        
        @JsonProperty("storage")
        private Storage storage;
        
        @JsonProperty("version")
        private Integer version;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Storage {
        @JsonProperty("type")
        private String type;
        
        @JsonProperty("s3")
        private S3Info s3;
        
        @JsonProperty("local")
        private LocalInfo local;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class S3Info {
        @JsonProperty("url")
        private String url;
        
        @JsonProperty("bucket")
        private String bucket;
        
        @JsonProperty("objectKey")
        private String objectKey;
        
        @JsonProperty("region")
        private String region;
        
        @JsonProperty("contentType")
        private String contentType;
        
        @JsonProperty("size")
        private Long size;
        
        @JsonProperty("versionId")
        private String versionId;
        
        @JsonProperty("checksum")
        private String checksum;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocalInfo {
        @JsonProperty("path")
        private String path;
        
        @JsonProperty("filename")
        private String filename;
        
        @JsonProperty("mimeType")
        private String mimeType;
        
        @JsonProperty("size")
        private Long size;
        
        @JsonProperty("mtime")
        private String mtime;
        
        @JsonProperty("revision")
        private String revision;
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