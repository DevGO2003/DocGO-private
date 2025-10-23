package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileInfoDto {
    private String id;
    private String name;
    private String type;
    private Long size;
    private HashDto hash;
    private PermissionsDto permissions;
    private SecurityDto security;
    private Integer version;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HashDto {
        private String md5;
        private String sha256;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PermissionsDto {
        private List<String> read;
        private List<String> write;
        private List<String> delete;
        private List<String> share;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SecurityDto {
        private String encryption;
        private Boolean watermark;
        private Boolean digitalSignature;
        private Boolean accessLogging;
    }
}

