package com.devgo2003.docgo.repository_service.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebRedirectConfig implements WebMvcConfigurer {
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirect legacy Swagger paths to the configured Swagger UI path (/docs)
        // Use permanent redirect (301) instead of temporary (302) to avoid redirect loops
        // registry.addRedirectViewController("/swagger-ui.html", "/docs").setStatusCode(org.springframework.http.HttpStatus.MOVED_PERMANENTLY);
        // registry.addRedirectViewController("/swagger-ui/index.html", "/docs").setStatusCode(org.springframework.http.HttpStatus.MOVED_PERMANENTLY);
        // Note: /docs is handled by SpringDoc OpenAPI, no need to configure it here
    }
}
