package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MetadataDto {
    private FileSystemDto fileSystem;
    private OriginalFileDto originalFile;
    private ArchivedFileDto archivedFile;
    private TechnicalDto technical;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FileSystemDto {
        private LocalDateTime createdAt;
        private LocalDateTime modifiedAt;
        private String owner;
        private String permissions;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class OriginalFileDto {
        private String name;
        private String path;
        private String source;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ArchivedFileDto {
        private String name;
        private String path;
        private LocalDateTime archivedAt;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TechnicalDto {
        private String format;
        private String mimeType;
        private Long size;
        private String encoding;
    }
}

