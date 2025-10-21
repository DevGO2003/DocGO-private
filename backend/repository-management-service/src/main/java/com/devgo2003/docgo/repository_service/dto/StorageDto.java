package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class StorageDto {
    private String location;
    private List<String> backupLocations;
    private RetentionPolicyDto retentionPolicy;
    private AccessControlDto accessControl;
    private S3Dto s3;
    private LocalDto local;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RetentionPolicyDto {
        private Integer retentionPeriod;
        private String unit;
        private LocalDateTime deleteAfter;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AccessControlDto {
        private List<String> allowedUsers;
        private List<String> allowedRoles;
        private List<String> deniedUsers;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class S3Dto {
        private String url;
        private String bucket;
        private String objectKey;
        private String key;
        private String region;
        private String contentType;
        private Long size;
        private String versionId;
        private ChecksumDto checksum;
        private String storageClass;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChecksumDto {
        private String originalMD5;
        private String archiveMD5;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LocalDto {
        private String path;
        private String directory;
    }
}
