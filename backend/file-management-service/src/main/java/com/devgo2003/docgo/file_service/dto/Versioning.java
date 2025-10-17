package com.devgo2003.docgo.file_service.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class Versioning {
    private Integer currentVersion;
    private String versionTag;
    private Integer previousVersion;
    private String changeSummary;
    private List<String> changedFields;
    private Map<String, Object> diff;
    private List<VersionHistory> history;
}
