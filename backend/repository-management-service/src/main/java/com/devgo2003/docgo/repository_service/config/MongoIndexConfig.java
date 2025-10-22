package com.devgo2003.docgo.repository_service.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.IndexOperations;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * MongoDB Indexes Auto-Creation
 * Creates optimized indexes for Phase 1 + 2 collections
 */
@Configuration
public class MongoIndexConfig implements CommandLineRunner {
    
    private static final Logger log = LoggerFactory.getLogger(MongoIndexConfig.class);
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @Override
    public void run(String... args) {
        try {
            createFilesIndexes();
            createVersionsIndexes();
            createFullContentsIndexes();
            log.info("✅ MongoDB indexes created successfully");
        } catch (Exception e) {
            log.error("❌ Failed to create MongoDB indexes: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Indexes for main 'files' collection
     */
    private void createFilesIndexes() {
        IndexOperations indexOps = mongoTemplate.indexOps("files");
        
        // 1. Composite index: ownerUserId + status (for user's documents listing)
        indexOps.ensureIndex(new Index()
            .on("overview.ownerUserId", Sort.Direction.ASC)
            .on("overview.status", Sort.Direction.ASC)
            .named("idx_owner_status"));
        
        // 2. Index: documentType (for filtering by type)
        indexOps.ensureIndex(new Index()
            .on("overview.documentType", Sort.Direction.ASC)
            .named("idx_document_type"));
        
        // 3. Composite index: effectiveDate + expiryDate (for contract queries)
        indexOps.ensureIndex(new Index()
            .on("contract.effectiveDate", Sort.Direction.ASC)
            .on("contract.expiryDate", Sort.Direction.ASC)
            .named("idx_contract_dates"));
        
        // 4. Index: MD5 hash (for duplicate detection)
        indexOps.ensureIndex(new Index()
            .on("metadata.file.hash.md5", Sort.Direction.ASC)
            .named("idx_file_md5"));
        
        // 5. Index: createdAt (for sorting by creation time)
        indexOps.ensureIndex(new Index()
            .on("audit.createdAt", Sort.Direction.DESC)
            .named("idx_created_at"));
        
        // 6. Index: updatedAt (for sorting by update time)
        indexOps.ensureIndex(new Index()
            .on("audit.updatedAt", Sort.Direction.DESC)
            .named("idx_updated_at"));
        
        // 7. Text index for full-text search on title
        indexOps.ensureIndex(new Index()
            .on("overview.title", Sort.Direction.ASC)
            .named("idx_title"));
        
        log.info("Created indexes for 'files' collection");
    }
    
    /**
     * Indexes for 'file_versions' collection (Bucket Pattern)
     */
    private void createVersionsIndexes() {
        IndexOperations indexOps = mongoTemplate.indexOps("file_versions");
        
        // 1. Composite index: documentId + bucketNumber
        indexOps.ensureIndex(new Index()
            .on("documentId", Sort.Direction.ASC)
            .on("bucketNumber", Sort.Direction.ASC)
            .named("idx_document_bucket"));
        
        // 2. Index: documentId only (for queries)
        indexOps.ensureIndex(new Index()
            .on("documentId", Sort.Direction.ASC)
            .named("idx_document_id"));
        
        log.info("Created indexes for 'file_versions' collection");
    }
    
    /**
     * Indexes for 'file_full_contents' collection (Subset Pattern)
     */
    private void createFullContentsIndexes() {
        IndexOperations indexOps = mongoTemplate.indexOps("file_full_contents");
        
        // 1. Unique index: documentId
        indexOps.ensureIndex(new Index()
            .on("documentId", Sort.Direction.ASC)
            .unique()
            .named("idx_document_id_unique"));
        
        log.info("Created indexes for 'file_full_contents' collection");
    }
}
