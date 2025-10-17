package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
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
        @JsonProperty("name")
        private String name;
        @JsonProperty("contentType")
        private String contentType;
        @JsonProperty("size")
        private Long size;
        @JsonProperty("ownerUserId")
        private String ownerUserId;
        @JsonProperty("storage")
        private StorageDto storage;
        @JsonProperty("version")
        private Integer version;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class StorageDto {
        @JsonProperty("type")
        private String type; // s3|local
        @JsonProperty("s3")
        private S3Dto s3;
        @JsonProperty("local")
        private LocalDto local;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class S3Dto {
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class LocalDto {
        @JsonProperty("path")
        private String path;
    }
}


