package com.devgo2003.docgo.repository_service.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class SwaggerConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Repository Management Service API")
                        .description("AI-powered document processing and management service")
                        .version("2.0.0")
                        .contact(new Contact()
                                .name("DocGO Team")
                                .email("dev@docgo.com")
                                .url("https://docgo.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:8002")
                                .description("Development server"),
                        new Server()
                                .url("https://api.docgo.com")
                                .description("Production server")
                ));
    }
}
