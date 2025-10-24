package com.devgo2003.docgo.repository_service.config;

import com.devgo2003.docgo.repository_service.config.UUIDv7Generator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.convert.DefaultMongoTypeMapper;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {
    
    @Override
    protected String getDatabaseName() {
        return "docgo";
    }
    
    @Bean
    public UUIDv7Generator uuidv7Generator() {
        return new UUIDv7Generator();
    }
    
    @Bean
    public MongoTemplate mongoTemplate() throws Exception {
        MongoTemplate mongoTemplate = new MongoTemplate(mongoClient(), getDatabaseName());
        
        // Remove _class field from documents
        MappingMongoConverter converter = (MappingMongoConverter) mongoTemplate.getConverter();
        converter.setTypeMapper(new DefaultMongoTypeMapper(null));
        
        return mongoTemplate;
    }
}
