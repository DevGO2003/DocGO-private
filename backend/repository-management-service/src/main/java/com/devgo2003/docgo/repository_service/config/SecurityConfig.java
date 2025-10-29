package com.devgo2003.docgo.repository_service.config;

import com.devgo2003.docgo.repository_service.security.GatewayUserAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring().requestMatchers(
            "/", 
            "/docs", 
            "/docs/**", 
            "/v3/api-docs", 
            "/v3/api-docs/**", 
            "/swagger-ui.html", 
            "/swagger-ui/**",
            "/actuator/**",
            "/health"
        );
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Pre-auth filter expects an AuthenticationManager; provide a pass-through one
        GatewayUserAuthenticationFilter preAuthFilter = new GatewayUserAuthenticationFilter();
        AuthenticationManager passThroughAuthManager = authentication -> authentication; // accept token as-is
        preAuthFilter.setAuthenticationManager(passThroughAuthManager);

        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .addFilterBefore(preAuthFilter, AbstractPreAuthenticatedProcessingFilter.class)
            .authorizeHttpRequests(auth -> auth
                // Allow Swagger/OpenAPI endpoints (defense-in-depth; also ignored above)
                .requestMatchers(
                    "/", 
                    "/docs", 
                    "/docs/**", 
                    "/v3/api-docs", 
                    "/v3/api-docs/**", 
                    "/swagger-ui.html", 
                    "/swagger-ui/**",
                    "/actuator/**", 
                    "/health"
                ).permitAll()
                .requestMatchers("/api/v1/repository-management-service/repositories/public").permitAll()
                .requestMatchers("/api/v1/repository-management-service/repositories/my").hasAnyRole("USER", "EMPLOYEE", "ADMIN")
                .requestMatchers("/api/v1/repository-management-service/repositories/**").hasAnyRole("USER", "EMPLOYEE", "ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(form -> form.disable());
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS","PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}





































