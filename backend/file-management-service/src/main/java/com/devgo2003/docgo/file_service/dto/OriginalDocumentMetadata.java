package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OriginalDocumentMetadata {
    private String dcFormat;
    private String dcTitle;
    private String dcCreator;
    private String dcDescription;
    private String dcSubject;
    private LocalDateTime xmpCreateDate;
    private String xmpCreatorTool;
    private LocalDateTime xmpModifyDate;
    private LocalDateTime xmpMetadataDate;
    private String pdfKeywords;
    private String pdfProducer;
    private String xmpDocumentID;
    private String xmpInstanceID;
    private List<String> pdfaExtensionSchemas;
}

