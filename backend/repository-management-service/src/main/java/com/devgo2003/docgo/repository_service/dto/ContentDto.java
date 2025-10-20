package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContentDto {
    private String extractedText;
    private String summary;
    private List<String> keyTerms;
    private List<SectionDto> sections;
    private String plaintext;
    private OcrDto ocr;
    private ClassificationDto classification;
    private ProcessingDto processing;
    private Object jsonContent;
    private String jsonAnalysisStatus;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SectionDto {
        private String title;
        private String description;
        private String content;
        private Integer pageNumber;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class OcrDto {
        private String text;
        private String status;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ClassificationDto {
        private Boolean isContract;
        private Double confidence;
        private String category;
        private String language;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ProcessingDto {
        private String status;
        private String error;
    }
}

