package com.devgo2003.docgo.file_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Cấu hình CORS cho document-management-service
 * Cho phép frontend (localhost:3000) gọi API
 * 
 * FIXME: Removed corsConfigurationSource bean to avoid conflict with SecurityConfig
 * Spring Security will use the corsConfigurationSource from SecurityConfig instead
 * 
 * ISSUE: Container still using old image despite rebuild --no-cache
 * Need to check if Docker is using cached layers or if there's another issue
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000", "http://127.0.0.1:3000")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    // REMOVED: corsConfigurationSource bean to avoid conflict with SecurityConfig
    // Spring Security will use the corsConfigurationSource from SecurityConfig instead
}
