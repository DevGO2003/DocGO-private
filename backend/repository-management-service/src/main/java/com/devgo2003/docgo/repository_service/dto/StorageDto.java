package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
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
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class RetentionPolicyDto {
        private String duration;
        private Boolean autoDelete;
        private String archiveAfter;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AccessControlDto {
        private Boolean isPublic;
        private List<String> restrictedUsers;
        private List<String> ipWhitelist;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class S3Dto {
        private String url;
        private String bucket;
        private String objectKey;
        private String region;
        private String contentType;
        private Long size;
        private String versionId;
        private ChecksumDto checksum;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChecksumDto {
        private String md5;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
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
