package com.devgo2003.docgo.repository_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.kafka.annotation.EnableKafka;

/**
 * Main application class for Repository Management Service
 * 
 * Service quản lý kho lưu trữ tài liệu (Repository Management)
 * - Quản lý files, versions, tags, comments, approvals
 * - Tích hợp S3 storage, Kafka events
 */
@SpringBootApplication
@EnableKafka
@ComponentScan(basePackages = {"com.devgo2003.docgo.repository_service", "com.devgo2003.docgo.file_service"})
public class RepositoryManagementApplication {
    public static void main(String[] args) {
        SpringApplication.run(RepositoryManagementApplication.class, args);
    }
}