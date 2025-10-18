package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ComplianceInfo {
    private Boolean gdprCompliant;
    private String dataRetention;
    private Boolean rightToBeForgotten;
    private Boolean consentGiven;
    private String consentDate;
}
