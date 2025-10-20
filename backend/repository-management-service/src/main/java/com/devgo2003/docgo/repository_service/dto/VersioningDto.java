package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VersioningDto {
    private CurrentVersionInfoDto currentVersionInfo;
    private List<VersionDto> versions;
    private List<ChangeLogDto> changeLog;
    private String previousVersion;
    private String changeSummary;
    private List<String> changedFields;
    private Map<String, Object> diff;
    private List<HistoryDto> history;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CurrentVersionInfoDto {
        private String tag;
        private Integer number;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class VersionDto {
        private String version;
        private LocalDateTime createdAt;
        private String createdBy;
        private String changes;
        private String fileId;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ChangeLogDto {
        private String version;
        private LocalDateTime date;
        private String author;
        private String changes;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HistoryDto {
        private Integer version;
        private String versionTag;
        private LocalDateTime changedAt;
        private String changedBy;
        private String changeType;
        private StorageDto storage;
    }
}

