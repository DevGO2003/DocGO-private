package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUpdateService {
    
    private final MongoTemplate mongoTemplate;

    /**
     * Update chỉ metadata fields - KHÔNG touch content/overview
     */
    public void updateMetadataFields(String fileId, Map<String, Object> file, Map<String, Object> storage,
                                     Map<String, Object> metadata, Map<String, Object> audit,
                                     String name, String mimeType, Long size, String ownerUserId, String status) {
        Query query = new Query(Criteria.where("_id").is(fileId));
        Update update = new Update();
        
        if (file != null && !file.isEmpty()) update.set("file", file);
        if (storage != null && !storage.isEmpty()) update.set("storage", storage);
        if (metadata != null && !metadata.isEmpty()) update.set("metadata", metadata);
        if (audit != null && !audit.isEmpty()) update.set("audit", audit);
        if (name != null) update.set("name", name);
        if (mimeType != null) update.set("mimeType", mimeType);
        if (size != null) update.set("size", size);
        if (ownerUserId != null) update.set("ownerUserId", ownerUserId);
        if (status != null) update.set("status", status);
        
        update.set("lastModifiedAt", LocalDateTime.now());
        
        mongoTemplate.updateFirst(query, update, FileEntity.class);
        log.debug("Updated metadata fields for fileId={}", fileId);
    }

    /**
     * Update chỉ content/overview fields - KHÔNG touch metadata
     */
    public void updateContentFields(String fileId, Map<String, Object> content, Map<String, Object> overview,
                                    String status, LocalDateTime updatedAt) {
        Query query = new Query(Criteria.where("_id").is(fileId));
        Update update = new Update();
        
        if (content != null && !content.isEmpty()) update.set("content", content);
        if (overview != null && !overview.isEmpty()) update.set("overview", overview);
        if (status != null) update.set("status", status);
        if (updatedAt != null) update.set("updatedAt", updatedAt);
        
        mongoTemplate.updateFirst(query, update, FileEntity.class);
        log.debug("Updated content fields for fileId={}", fileId);
    }

    /**
     * Update chỉ contract fields
     */
    public void updateContractFields(String fileId, Map<String, Object> contract, String documentType,
                                     String status, LocalDateTime updatedAt) {
        Query query = new Query(Criteria.where("_id").is(fileId));
        Update update = new Update();
        
        if (contract != null && !contract.isEmpty()) update.set("contract", contract);
        if (documentType != null) update.set("documentType", documentType);
        if (status != null) update.set("status", status);
        if (updatedAt != null) update.set("updatedAt", updatedAt);
        
        mongoTemplate.updateFirst(query, update, FileEntity.class);
        log.debug("Updated contract fields for fileId={}", fileId);
    }
}
