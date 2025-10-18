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
public class Audit {
    private String createdAt;
    private String createdBy;
    private String updatedAt;
    private String updatedBy;
    private String deletedAt;
    private String deletedBy;
    private Boolean isDeleted;
    private Integer version;
    
    // 🆕 NEW FIELDS
    private List<AccessLog> accessLog;    // 🆕 NEW NESTED OBJECT
    private ApprovalInfo approval;       // 🆕 NEW NESTED OBJECT
    private ComplianceInfo compliance;   // 🆕 NEW NESTED OBJECT
}
