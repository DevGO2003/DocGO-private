package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MetadataDto {
    private FileMetadataDto file;
    private FileSystemDto fileSystem;
    private OriginalDocumentDto originalDocument;
    private ArchivedDocumentDto archivedDocument;
    private TechnicalDto technical;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FileMetadataDto {
        private String name;
        private String mimeType;
        private Long size;
        private HashDto hash;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class HashDto {
        private String md5;
        private String sha256;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FileSystemDto {
        private String dateAdded;
        private String dateModified;
        private String originalFilename;
        private String originalMD5;
        private Long originalFileSize;
        private String originalMimeType;
        private String archiveMD5;
        private Long archiveFileSize;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class OriginalDocumentDto {
        private String dcFormat;
        private String dcTitle;
        private String dcCreator;
        private String dcDescription;
        private String dcSubject;
        private String xmpCreateDate;
        private String xmpCreatorTool;
        private String xmpModifyDate;
        private String xmpMetadataDate;
        private String xmpDocumentID;
        private String xmpInstanceID;
        private String pdfKeywords;
        private String pdfProducer;
        private Integer pdfaidPart;
        private String pdfaidConformance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ArchivedDocumentDto {
        private String dcFormat;
        private String dcTitle;
        private String dcCreator;
        private String pdfProducer;
        private String xmpCreateDate;
        private String xmpModifyDate;
        private String xmpMetadataDate;
        private String xmpCreatorTool;
        private String xmpDocumentID;
        private Integer pdfaidPart;
        private String pdfaidConformance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class TechnicalDto {
        private String encoding;
        private String lineEnding;
        private Boolean bom;
        private String compression;
        private Integer pages;
        private Integer wordCount;
        private Integer characterCount;
    }
}

