package com.devgo2003.docgo.document_service.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ArchivedDocumentMetadata {
    private String archivedPdfProducer;
    private LocalDateTime archivedMetadataDate;
    private LocalDateTime archivedModifyDate;
    private LocalDateTime archivedCreateDate;
    private String archivedCreatorTool;
    private String archivedDocumentID;
    private String archivedDcFormat;
    private String archivedDcTitle;
    private String archivedDcCreator;
}
