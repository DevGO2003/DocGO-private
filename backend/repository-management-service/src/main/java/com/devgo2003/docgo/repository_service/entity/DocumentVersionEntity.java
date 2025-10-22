package com.devgo2003.docgo.repository_service.entity;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Bucket Pattern for Version History
 * Stores historical versions separately to keep main document small
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "file_versions")
@CompoundIndex(name = "documentId_bucket", def = "{'documentId': 1, 'bucketNumber': 1}")
public class DocumentVersionEntity {
    @Id
    private String id;  // {documentId}-versions-{bucketNumber}
    
    @Indexed
    private String documentId;
    
    private Integer bucketNumber;  // 0, 1, 2, ... (mỗi bucket tối đa 50 versions)
    
    private Integer count;  // Số versions trong bucket này
    
    private List<VersionHistory> versions;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VersionHistory {
        private Integer version;
        private String tag;
        private String changedAt;
        private String changedBy;
        private String changeType;  // CREATE, UPDATE, DELETE, ARCHIVE
        private String changes;
        private List<String> changedFields;
        private Map<String, Object> diff;
    }
}
