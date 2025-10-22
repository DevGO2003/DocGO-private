package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SecurityDto {
    private String encryption;
    private Boolean watermark;
    private Boolean digitalSignature;
    private Boolean accessLogging;
    private PermissionsDto permissions;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class PermissionsDto {
        private List<String> read;
        private List<String> write;
        private List<String> delete;
        private List<String> share;
    }
}
