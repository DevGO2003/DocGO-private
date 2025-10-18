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
public class Overview {
    private String title;
    private String status;
    private String documentType;
    private String contractType;
    private String category;
    private List<String> tags;
    private String ownerUserId;
    private Boolean isNew;
    
    // 🆕 NEW FIELDS
    private String priority;           // LOW|MEDIUM|HIGH|URGENT
    private String confidentiality;   // PUBLIC|INTERNAL|CONFIDENTIAL|RESTRICTED
    private String language;          // vi|en|zh|ja|ko
    private String region;            // VN|US|EU|APAC
    private String department;        // ✅ Chuyển từ metadata
    private String project;           // ✅ Chuyển từ metadata
    private Workflow workflow;        // 🆕 NEW NESTED OBJECT
}
