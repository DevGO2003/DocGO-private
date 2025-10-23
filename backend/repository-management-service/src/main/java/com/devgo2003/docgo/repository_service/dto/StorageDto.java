package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

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
        private String duration;
        private Boolean autoDelete;
        private String archiveAfter;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AccessControlDto {
        @JsonProperty("public")
        private Boolean publicAccess;
        private List<String> restrictedUsers;
        private List<String> ipWhitelist;
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
        private String md5;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class LocalDto {
        private String path;
        private String filename;
        private String mimeType;
        private Long size;
        private String mtime;
        private String revision;
    }
}
