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
    // Bổ sung theo schema mới
    private String category;              // HOP_DONG_CHUNG | TAI_LIEU_CHUNG | ...
    private String documentType;          // MIME type (application/pdf, ...)
    private ContractMetadata contractMetadata; // Metadata hợp đồng gom nhóm
}


