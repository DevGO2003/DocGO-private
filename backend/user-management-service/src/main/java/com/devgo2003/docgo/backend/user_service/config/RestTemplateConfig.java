package com.devgo2003.docgo.backend.user_service.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RestTemplate Configuration
 * Provides RestTemplate bean for HTTP client operations
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Create RestTemplate bean with sensible defaults
     * - Connection timeout: 5 seconds
     * - Read timeout: 10 seconds
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .connectTimeout(Duration.ofSeconds(5))
                .readTimeout(Duration.ofSeconds(10))
                .build();
    }
}
