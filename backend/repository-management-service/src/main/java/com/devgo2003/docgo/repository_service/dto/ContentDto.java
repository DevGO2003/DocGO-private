package com.devgo2003.docgo.repository_service.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ContentDto {
    private String plaintext;
    private String extractedText;
    private String summary;
    private List<String> keyTerms;
    private List<SectionDto> sections;
    private OcrDto ocr;
    private ExtractionDto extraction;
    private SummarizationDto summarization;
    private ClassificationDto classification;
    private ProcessingDto processing;
    private Object jsonContent;
    
    /**
     * JSON content analysis status
     * Enum: PARSED, INVALID, PENDING
     */
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
        
        /**
         * OCR processing status
         * Enum: COMPLETED, FAILED, PROCESSING, SKIPPED
         */
        private String status;
        
        /**
         * OCR engine used
         * Enum: GEMINI_VISION, TESSERACT, TESSERACT_FALLBACK, PADDLEOCR
         */
        private String engine;
        
        private Double confidence;
        private String processedAt;
        private Double processingTime;
        private String error;
        private Map<String, Object> metadata;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ExtractionDto {
        /**
         * Text extraction status
         * Enum: SUCCESS, PARTIAL, FAILED
         */
        private String status;
        
        /**
         * Extraction method used
         * Enum: DIRECT, OCR, HYBRID
         */
        private String method;
        
        private String extractedAt;
        private Integer characterCount;
        private Integer wordCount;
        private String error;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SummarizationDto {
        /**
         * Summarization status
         * Enum: SUCCESS, FAILED, SKIPPED
         */
        private String status;
        
        private String model;
        private String processedAt;
        private Double processingTime;
        private Integer inputTokens;
        private Integer outputTokens;
        private String error;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ClassificationDto {
        private Boolean isContract;
        private Double confidence;
        
        /**
         * Classified language (ISO 639-1 lowercase)
         * Enum: vi, en, fr, zh
         */
        private String language;
    }

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class ProcessingDto {
        /**
         * Overall processing status
         * Enum: COMPLETED, PROCESSING, FAILED
         */
        private String status;
        
        private String error;
    }
}

