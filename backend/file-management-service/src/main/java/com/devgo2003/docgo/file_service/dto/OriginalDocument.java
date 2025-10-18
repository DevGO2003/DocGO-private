package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class OriginalDocument {
    private String dcFormat;
    private String dcTitle;
    private String dcCreator;
    private String dcDescription;
    private String dcSubject;
    private String xmpCreateDate;
    private String xmpCreatorTool;
    private String xmpModifyDate;
    private String xmpMetadataDate;
    private String pdfKeywords;
    private String pdfProducer;
    private String xmpDocumentID;
    private String xmpInstanceID;
    private List<String> pdfaExtensionSchemas;
}
