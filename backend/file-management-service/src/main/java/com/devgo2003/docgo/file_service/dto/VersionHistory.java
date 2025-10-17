package com.devgo2003.docgo.file_service.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VersionHistory {
    private Integer version;
    private String versionTag;
    private String changedAt;
    private String changedBy;
    private String changeType;
    private Storage storage;
}
