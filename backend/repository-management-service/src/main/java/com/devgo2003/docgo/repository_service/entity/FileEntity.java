package com.devgo2003.docgo.repository_service.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "files")
public class FileEntity {
    @Id
    private String id;
    
    // Basic file info
    private String name;
    private String mimeType;
    private Long size;
    private String extractedText;
    private String status;
    private String documentType;
    private String ownerUserId;
    private String language;
    private String region;
    private Boolean isNew;
    
    // Overview fields
    private String title;
    private String contractType;
    private String category;
    private List<String> tags;
    
    // Contract fields
    private LocalDateTime effectiveDate;
    private LocalDateTime expiryDate;
    private Double totalValue;
    private String currency;
    private String summary;
    private String project;
    private String department;
    private String priority;
    private String confidentiality;
    
    // Content fields
    private String plaintext;
    private List<String> keyTerms;
    private List<Map<String, Object>> sections;
    private Map<String, Object> ocr;
    private Map<String, Object> classification;
    private Map<String, Object> processing;
    private Object jsonContent;
    private String jsonAnalysisStatus;
    
    // File info fields
    private Map<String, String> hash;
    private Map<String, List<String>> permissions;
    private Map<String, Object> security;
    private Integer version;
    
    // Storage fields
    private String location;
    private List<String> backupLocations;
    private Map<String, Object> retentionPolicy;
    private Map<String, Object> accessControl;
    private Map<String, Object> s3;
    private Map<String, Object> local;
    
    // Versioning fields
    private Map<String, Object> currentVersionInfo;
    private List<Map<String, Object>> versions;
    private List<Map<String, Object>> changeLog;
    private String previousVersion;
    private String changeSummary;
    private List<String> changedFields;
    private Map<String, Object> diff;
    private List<Map<String, Object>> history;
    
    // Metadata fields
    private Map<String, Object> fileSystem;
    private Map<String, Object> originalDocument;
    private Map<String, Object> archivedDocument;
    private Map<String, Object> technical;
    
    // Audit fields
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime lastModifiedAt;
    private String lastModifiedBy;
    private Integer auditVersion;
    private List<Map<String, Object>> changeHistory;
    private List<Map<String, Object>> accessLog;
    private LocalDateTime updatedAt;
    private String updatedBy;
    private LocalDateTime deletedAt;
    private String deletedBy;
    private Boolean isDeleted;
    
    // Processing status
    private Map<String, Object> processingStatus;
}


