package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VersioningDto {
    private CurrentDto current;
    private List<HistoryDto> history;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CurrentDto {
        private Integer number;
        private String tag;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HistoryDto {
        private Integer version;
        private String tag;
        private String changedAt;
        private String changedBy;
        private String changeType;
        private String changes;
        private List<String> changedFields;
        private Map<String, Object> diff;
    }
}

