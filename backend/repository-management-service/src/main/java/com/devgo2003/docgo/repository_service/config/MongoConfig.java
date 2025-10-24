package com.devgo2003.docgo.repository_service.config;

import com.devgo2003.docgo.repository_service.config.UUIDv7Generator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * MongoConfig - MongoDB configuration
 * 
 * Configures:
 * - MongoDB connection (uses MONGODB_ATLAS_URI from .env)
 * - UUID v7 generator bean
 * - Repository scanning
 */
@Configuration
public class MongoConfig {

    /**
     * UUID v7 Generator Bean
     * Provides time-sortable UUIDs for document IDs
     */
    @Bean
    public UUIDv7Generator uuidv7Generator() {
        return new UUIDv7Generator();
    }
}