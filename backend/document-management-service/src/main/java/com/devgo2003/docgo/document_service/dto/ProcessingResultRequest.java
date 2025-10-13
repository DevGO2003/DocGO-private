package com.devgo2003.docgo.document_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessingResultRequest {
    private String ocrText;
    private String ocrStatus;
    private Object classificationResult;
    private String processingStatus;
    private String processingError;
}


