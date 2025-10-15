package com.devgo2003.docgo.document_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

/**
 * Main application class for Document Management Service
 * 
 * FIXME: RestTemplateConfig still not being detected despite @ComponentScan
 * Need to investigate why Spring is not finding the RestTemplate bean
 */
@SpringBootApplication
@ComponentScan(basePackages = "com.devgo2003.docgo.document_service")
public class DocumentManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(DocumentManagementApplication.class, args);
    }
}
