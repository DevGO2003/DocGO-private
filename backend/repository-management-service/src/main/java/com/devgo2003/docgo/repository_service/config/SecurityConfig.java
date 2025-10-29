package com.devgo2003.docgo.repository_service.config;

import com.devgo2003.docgo.repository_service.security.GatewayUserAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;
import org.springframework.security.authentication.AuthenticationManager;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Pre-auth filter expects an AuthenticationManager; provide a pass-through one
        GatewayUserAuthenticationFilter preAuthFilter = new GatewayUserAuthenticationFilter();
        AuthenticationManager passThroughAuthManager = authentication -> authentication; // accept token as-is
        preAuthFilter.setAuthenticationManager(passThroughAuthManager);

        http
            .csrf(csrf -> csrf.disable())
            .addFilterBefore(preAuthFilter, AbstractPreAuthenticatedProcessingFilter.class)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/docs/**", "/actuator/**", "/health").permitAll()
                .requestMatchers("/api/v1/repository-management-service/repositories/public").permitAll()
                .requestMatchers("/api/v1/repository-management-service/repositories/my").hasAnyRole("USER", "EMPLOYEE", "ADMIN")
                .requestMatchers("/api/v1/repository-management-service/repositories/**").hasAnyRole("USER", "EMPLOYEE", "ADMIN")
                .anyRequest().authenticated()
            )
            .httpBasic(httpBasic -> httpBasic.disable())
            .formLogin(form -> form.disable());
        return http.build();
    }
}





































