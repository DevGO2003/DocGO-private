package com.devgo2003.docgo.repository_service.entity;

import com.devgo2003.docgo.repository_service.config.UUIDv7Generator;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "files")
public class FileEntity {
    @Id
    private String id;  // UUID v7 format
    
    // ==================== 8 MAIN SECTIONS (v3 Schema) ====================
    
    @Field
    @Builder.Default
    private Map<String, Object> overview = new HashMap<>();
    
    @Field
    @Builder.Default
    private Map<String, Object> metadata = new HashMap<>();
    
    @Field
    @Builder.Default
    private Map<String, Object> contract = new HashMap<>();
    
    @Field
    @Builder.Default
    private Map<String, Object> content = new HashMap<>();
    
    @Field
    @Builder.Default
    private Map<String, Object> storage = new HashMap<>();
    
    @Field
    @Builder.Default
    private Map<String, Object> security = new HashMap<>();
    
    @Field
    @Builder.Default
    private Map<String, Object> versioning = new HashMap<>();
    
    @Field
    @Builder.Default
    private Map<String, Object> audit = new HashMap<>();
    
    // ==================== EXPLICIT GETTERS/SETTERS (Required for Lombok) ====================
    
    public String getId() { return this.id; }
    public void setId(String id) { this.id = id; }
    
    public Map<String, Object> getOverview() { return this.overview; }
    public void setOverview(Map<String, Object> overview) { this.overview = overview; }
    
    public Map<String, Object> getMetadata() { return this.metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
    
    public Map<String, Object> getContract() { return this.contract; }
    public void setContract(Map<String, Object> contract) { this.contract = contract; }
    
    public Map<String, Object> getContent() { return this.content; }
    public void setContent(Map<String, Object> content) { this.content = content; }
    
    public Map<String, Object> getStorage() { return this.storage; }
    public void setStorage(Map<String, Object> storage) { this.storage = storage; }
    
    public Map<String, Object> getSecurity() { return this.security; }
    public void setSecurity(Map<String, Object> security) { this.security = security; }
    
    public Map<String, Object> getVersioning() { return this.versioning; }
    public void setVersioning(Map<String, Object> versioning) { this.versioning = versioning; }
    
    public Map<String, Object> getAudit() { return this.audit; }
    public void setAudit(Map<String, Object> audit) { this.audit = audit; }
    
    // ==================== HELPER METHODS (Backward Compatibility) ====================
    
    // Overview helpers
    public String getName() { return (String) overview.get("title"); }
    public void setName(String name) { overview.put("title", name); }
    
    public String getStatus() { return (String) overview.get("status"); }
    public void setStatus(String status) { overview.put("status", status); }
    
    public String getDocumentType() { return (String) overview.get("documentType"); }
    public void setDocumentType(String documentType) { overview.put("documentType", documentType); }
    
    public String getOwnerUserId() { return (String) overview.get("ownerUserId"); }
    public void setOwnerUserId(String ownerUserId) { overview.put("ownerUserId", ownerUserId); }
    
    public String getLanguage() { return (String) overview.get("language"); }
    public void setLanguage(String language) { overview.put("language", language); }
    
    public String getRegion() { return (String) overview.get("region"); }
    public void setRegion(String region) { overview.put("region", region); }
    
    // Metadata helpers
    @SuppressWarnings("unchecked")
    public String getMimeType() { 
        Map<String, Object> file = (Map<String, Object>) metadata.get("file");
        return file != null ? (String) file.get("mimeType") : null;
    }
    
    public void setMimeType(String mimeType) {
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) metadata.computeIfAbsent("file", k -> new HashMap<>());
        file.put("mimeType", mimeType);
    }
    
    @SuppressWarnings("unchecked")
    public Long getSize() {
        Map<String, Object> file = (Map<String, Object>) metadata.get("file");
        if (file != null && file.get("size") != null) {
            Object size = file.get("size");
            if (size instanceof Number) return ((Number) size).longValue();
        }
        return null;
    }
    
    public void setSize(Long size) {
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) metadata.computeIfAbsent("file", k -> new HashMap<>());
        file.put("size", size);
    }
    
    // Content helpers
    public String getExtractedText() { return (String) content.get("extractedText"); }
    public void setExtractedText(String extractedText) { content.put("extractedText", extractedText); }
    
    // Audit helpers
    public LocalDateTime getCreatedAt() {
        Object value = audit.get("createdAt");
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        if (value instanceof String) return LocalDateTime.parse((String) value);
        return null;
    }
    public void setCreatedAt(LocalDateTime createdAt) { 
        audit.put("createdAt", createdAt != null ? createdAt.toString() : null); 
    }
    
    public String getCreatedBy() { return (String) audit.get("createdBy"); }
    public void setCreatedBy(String createdBy) { audit.put("createdBy", createdBy); }
    
    public LocalDateTime getUpdatedAt() {
        Object value = audit.get("updatedAt");
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        if (value instanceof String) return LocalDateTime.parse((String) value);
        return null;
    }
    public void setUpdatedAt(LocalDateTime updatedAt) { 
        audit.put("updatedAt", updatedAt != null ? updatedAt.toString() : null); 
    }
    
    public String getUpdatedBy() { return (String) audit.get("updatedBy"); }
    public void setUpdatedBy(String updatedBy) { audit.put("updatedBy", updatedBy); }
    
    public Boolean getIsDeleted() {
        Object value = audit.get("isDeleted");
        if (value instanceof Boolean) return (Boolean) value;
        return false;
    }
    public void setIsDeleted(Boolean isDeleted) { audit.put("isDeleted", isDeleted); }
    
    // Metadata file helpers (for backward compatibility)
    @SuppressWarnings("unchecked")
    public Map<String, Object> getFile() {
        return (Map<String, Object>) metadata.get("file");
    }
    
    public void setFile(Map<String, Object> file) {
        metadata.put("file", file);
    }
}


