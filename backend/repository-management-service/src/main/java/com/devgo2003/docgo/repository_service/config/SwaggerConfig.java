package com.devgo2003.docgo.repository_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * SwaggerConfig - OpenAPI documentation configuration
 * 
 * Configures:
 * - API documentation metadata
 * - Server information
 * - Contact and license information
 * - Available at: http://localhost:8002/docs
 */
@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Repository Management Service API")
                .description("""
                    API quản lý kho lưu trữ tài liệu (Repository Management) cho hệ thống DocGO
                    
                    ## Chức năng chính:
                    - Quản lý files, versions, tags, comments, approvals
                    - Tích hợp S3 storage và Kafka events
                    - Xử lý 8 sections v3 schema (overview, metadata, contract, content, storage, security, versioning, audit)
                    
                    ## Event Architecture:
                    - FILE_UPLOAD_COMPLETED: Tạo skeleton với defaults
                    - FILE_CONTENT_EXTRACTED: Deep merge content section
                    - CONTRACT_SUMMARY_GENERATED: Deep merge contract section (conditional)
                    
                    ## Port: 8002
                    ## Documentation: /docs
                    """)
                .version("1.0.0")
                .contact(new Contact()
                    .name("DocGO Development Team")
                    .email("dev@docgo.com")
                    .url("https://docgo.com"))
                .license(new License()
                    .name("MIT License")
                    .url("https://opensource.org/licenses/MIT")))
            .addServersItem(new Server().url("http://localhost:8002").description("Development Server"))
            .addServersItem(new Server().url("https://api.docgo.com").description("Production Server"))
            .components(new Components()
                .addSecuritySchemes("bearerAuth", new SecurityScheme()
                    .type(SecurityScheme.Type.HTTP)
                    .scheme("bearer")
                    .bearerFormat("JWT")
                    .description("JWT Authorization header using the Bearer scheme. Enter 'Bearer {token}'")));
    }
}
