package com.devgo2003.docgo.file_service.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import org.springframework.data.annotation.Id;
import org.springframework.data.domain.Persistable;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;
import com.devgo2003.docgo.file_service.dto.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Document(collection = "files")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FileEntity extends BaseEntity implements Persistable<String> {
    
    @Id
    @MongoId
    private String id;
    
    // Overview block
    private Overview overview;
    
    // Contract block (optional - chỉ có khi documentType = CONTRACT)
    private Contract contract;
    
    // Content block
    private Content content;
    
    // File block
    private FileInfo file;
    
    // Storage block
    private Storage storage;
    
    // Versioning block
    private Versioning versioning;
    
    // Metadata block
    private FileMetadata metadata;
    
    // Audit block
    private Audit audit;
    
    // Processing block
    private ProcessingInfo processing;
    
    @Override
    public String getId() {
        return id;
    }
    
    @Override
    public boolean isNew() {
        return id == null;
    }
}
