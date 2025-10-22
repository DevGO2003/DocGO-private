package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditDto {
    private String createdAt;
    private String createdBy;
    private String updatedAt;
    private String updatedBy;
    private String deletedAt;
    private String deletedBy;
    private Boolean isDeleted;
    private List<ChangeHistoryDto> changeHistory;
    private List<AccessLogDto> accessLog;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChangeHistoryDto {
        private String action;
        private String timestamp;
        private String actor;
        private String details;
        private String ipAddress;
        private String userAgent;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AccessLogDto {
        private String action;
        private String timestamp;
        private String actor;
        private String ipAddress;
        private String userAgent;
    }
}

