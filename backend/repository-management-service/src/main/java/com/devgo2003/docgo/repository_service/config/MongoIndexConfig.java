package com.devgo2003.docgo.repository_service.config;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.IndexOptions;
import com.mongodb.client.model.Indexes;
import lombok.extern.slf4j.Slf4j;
import org.bson.Document;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

/**
 * MongoDB Index Configuration
 * Auto-creates indexes on application startup
 * 
 * Based on: STORAGE-LAYER-STANDARDS.md
 * Total Indexes: 7 for files collection
 */
@Slf4j
@Configuration
public class MongoIndexConfig {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Bean
    public CommandLineRunner createMongoIndexes() {
        return args -> {
            log.info("🔨 Creating MongoDB indexes...");
            
            try {
                createFilesIndexes();
                log.info("✅ MongoDB indexes created successfully!");
            } catch (Exception e) {
                log.error("❌ Failed to create MongoDB indexes: {}", e.getMessage(), e);
            }
        };
    }

    private void createFilesIndexes() {
        MongoCollection<Document> collection = mongoTemplate.getCollection("files");
        
        // 1. Owner + Status composite index (most common query)
        collection.createIndex(
            Indexes.compoundIndex(
                Indexes.ascending("overview.ownerUserId"),
                Indexes.ascending("overview.status")
            ),
            new IndexOptions()
                .name("idx_files_owner_status_composite")
                .background(true)
        );
        log.info("  ✓ Created idx_files_owner_status_composite");

        // 2. Document Type index
        collection.createIndex(
            Indexes.ascending("overview.documentType"),
            new IndexOptions()
                .name("idx_files_document_type")
                .background(true)
        );
        log.info("  ✓ Created idx_files_document_type");

        // 3. Contract Dates composite index
        collection.createIndex(
            Indexes.compoundIndex(
                Indexes.ascending("contract.effectiveDate"),
                Indexes.ascending("contract.expiryDate")
            ),
            new IndexOptions()
                .name("idx_files_contract_dates_composite")
                .background(true)
                .sparse(true)  // Only index documents with contract
        );
        log.info("  ✓ Created idx_files_contract_dates_composite");

        // 4. MD5 Hash unique index (duplicate detection)
        collection.createIndex(
            Indexes.ascending("metadata.file.hash.md5"),
            new IndexOptions()
                .name("idx_files_md5_unique")
                .unique(true)
                .sparse(true)  // Allow docs without hash
        );
        log.info("  ✓ Created idx_files_md5_unique");

        // 5. Created At descending index (recent first)
        collection.createIndex(
            Indexes.descending("audit.createdAt"),
            new IndexOptions()
                .name("idx_files_created_at_desc")
                .background(true)
        );
        log.info("  ✓ Created idx_files_created_at_desc");

        // 6. Updated At descending index
        collection.createIndex(
            Indexes.descending("audit.updatedAt"),
            new IndexOptions()
                .name("idx_files_updated_at_desc")
                .background(true)
        );
        log.info("  ✓ Created idx_files_updated_at_desc");

        // 7. Title text index (full-text search)
        collection.createIndex(
            Indexes.text("overview.title"),
            new IndexOptions()
                .name("idx_files_title_text")
                .background(true)
        );
        log.info("  ✓ Created idx_files_title_text");
        
        log.info("📊 Total indexes created: 7 (+ 1 default _id index)");
    }
}
