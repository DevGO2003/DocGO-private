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
public class ApprovalInfo {
    private Boolean required;
    private List<String> approvers;
    private String approvedBy;
    private String approvedAt;
    private String rejectedBy;
    private String rejectedAt;
    private String comments;
}
