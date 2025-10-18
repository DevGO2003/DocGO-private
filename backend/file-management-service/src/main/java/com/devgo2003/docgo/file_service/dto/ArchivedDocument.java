package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ArchivedDocument {
    private String archivedPdfProducer;
    private String archivedMetadataDate;
    private String archivedModifyDate;
    private String archivedCreateDate;
    private String archivedCreatorTool;
    private String archivedDocumentID;
    private String archivedDcFormat;
    private String archivedDcTitle;
    private String archivedDcCreator;
}
