package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditDto {
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime lastModifiedAt;
    private String lastModifiedBy;
    private Integer version;
    private List<ChangeHistoryDto> changeHistory;
    private List<AccessLogDto> accessLog;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime deletedAt;
    private String deletedBy;
    private Boolean isDeleted;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChangeHistoryDto {
        private String action;
        private LocalDateTime timestamp;
        private String userId;
        private String details;
        private String ipAddress;
        private String userAgent;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class AccessLogDto {
        private String action;
        private LocalDateTime timestamp;
        private String userId;
        private String ipAddress;
        private String userAgent;
    }
}

