package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Content {
    private String plaintext;
    private OcrInfo ocr;
    private Object classification;
    private ProcessingInfo processing;
    private String jsonContent;
    private String jsonAnalysisStatus;
}
