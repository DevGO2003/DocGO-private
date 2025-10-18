package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TechnicalInfo {
    private String encoding;
    private String lineEnding;
    private Boolean bom;
    private String compression;
    private Integer pages;
    private Integer wordCount;
    private Integer characterCount;
}
