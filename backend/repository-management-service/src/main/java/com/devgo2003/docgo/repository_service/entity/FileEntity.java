package com.devgo2003.docgo.repository_service.entity;

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
    private String id;
    
    // Explicit getter/setter for id to fix Lombok annotation processing issue in Docker
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    // Main nested sections - Optimized for MongoDB Atlas (v3 Schema)
    @Field
    private Map<String, Object> overview = new HashMap<>();

    @Field
    private Map<String, Object> metadata = new HashMap<>();

    @Field
    private Map<String, Object> contract = new HashMap<>();

    @Field
    private Map<String, Object> content = new HashMap<>();

    @Field
    private Map<String, Object> storage = new HashMap<>();

    @Field
    private Map<String, Object> security = new HashMap<>();

    @Field
    private Map<String, Object> versioning = new HashMap<>();

    @Field
    private Map<String, Object> audit = new HashMap<>();
    
    // Helper methods for quick access (backward compatibility)
    public String getStatus() {
        return overview != null ? (String) overview.get("status") : null;
    }
    
    public void setStatus(String status) {
        if (overview == null) overview = new HashMap<>();
        overview.put("status", status);
    }
    
    public String getDocumentType() {
        return overview != null ? (String) overview.get("documentType") : null;
    }
    
    public void setDocumentType(String documentType) {
        if (overview == null) overview = new HashMap<>();
        overview.put("documentType", documentType);
    }
    
    public String getOwnerUserId() {
        return overview != null ? (String) overview.get("ownerUserId") : null;
    }
    
    public void setOwnerUserId(String ownerUserId) {
        if (overview == null) overview = new HashMap<>();
        overview.put("ownerUserId", ownerUserId);
    }
    
    public String getName() {
        if (metadata == null || metadata.get("file") == null) return null;
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) metadata.get("file");
        return (String) file.get("name");
    }
    
    public void setName(String name) {
        if (metadata == null) metadata = new HashMap<>();
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) metadata.computeIfAbsent("file", k -> new HashMap<>());
        file.put("name", name);
    }
    
    public String getMimeType() {
        if (metadata == null || metadata.get("file") == null) return null;
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) metadata.get("file");
        return (String) file.get("mimeType");
    }
    
    public void setMimeType(String mimeType) {
        if (metadata == null) metadata = new HashMap<>();
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) metadata.computeIfAbsent("file", k -> new HashMap<>());
        file.put("mimeType", mimeType);
    }
    
    public Long getSize() {
        if (metadata == null || metadata.get("file") == null) return null;
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) metadata.get("file");
        Object size = file.get("size");
        if (size instanceof Integer) return ((Integer) size).longValue();
        if (size instanceof Long) return (Long) size;
        return null;
    }
    
    public void setSize(Long size) {
        if (metadata == null) metadata = new HashMap<>();
        @SuppressWarnings("unchecked")
        Map<String, Object> file = (Map<String, Object>) metadata.computeIfAbsent("file", k -> new HashMap<>());
        file.put("size", size);
    }
}


