package com.devgo2003.docgo.repository_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebRedirectConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirect legacy Swagger paths to the configured Swagger UI path (/docs)
        registry.addRedirectViewController("/swagger-ui.html", "/docs");
        registry.addRedirectViewController("/swagger-ui/index.html", "/docs");
    }
}
