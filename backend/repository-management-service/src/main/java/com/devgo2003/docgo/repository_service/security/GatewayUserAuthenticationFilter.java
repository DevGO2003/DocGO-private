package com.devgo2003.docgo.repository_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.AbstractPreAuthenticatedProcessingFilter;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class GatewayUserAuthenticationFilter extends AbstractPreAuthenticatedProcessingFilter {

    @Override
    protected Object getPreAuthenticatedPrincipal(HttpServletRequest request) {
        String userId = request.getHeader("X-User-Id");
        if (!StringUtils.hasText(userId)) return null;
        String username = request.getHeader("X-Username");
        return new GatewayUserPrincipal(userId, username, request.getHeader("X-User-Email"));
    }

    @Override
    protected Object getPreAuthenticatedCredentials(HttpServletRequest request) {
        return request.getHeader("X-User-Token");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;
        
        System.out.println("DEBUG: doFilter called");
        
        // Get user info from headers
        String userId = httpRequest.getHeader("X-User-Id");
        String username = httpRequest.getHeader("X-Username");
        String email = httpRequest.getHeader("X-User-Email");
        String rolesHeader = httpRequest.getHeader("X-User-Roles");
        
        System.out.println("DEBUG: Headers - userId=" + userId + ", username=" + username + ", roles=" + rolesHeader);
        
        if (userId != null && !userId.trim().isEmpty()) {
            // Parse roles
            List<SimpleGrantedAuthority> authorities = List.of();
            if (rolesHeader != null && !rolesHeader.trim().isEmpty()) {
                String[] roles = rolesHeader.split(",");
                authorities = Arrays.stream(roles)
                    .map(String::trim)
                    .filter(r -> !r.isEmpty())
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                    .collect(Collectors.toList());
            }
            
            System.out.println("DEBUG: Authorities = " + authorities);
            
            // Create authentication
            GatewayUserPrincipal principal = new GatewayUserPrincipal(userId, username, email);
            Authentication authentication = new AbstractAuthenticationToken(authorities) {
                @Override public Object getCredentials() { return "N/A"; }
                @Override public Object getPrincipal() { return principal; }
            };
            authentication.setAuthenticated(true);
            
            // Set in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("DEBUG: Authentication set in context");
        }
        
        chain.doFilter(request, response);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request, HttpServletResponse response, org.springframework.security.core.AuthenticationException failed) throws IOException, ServletException {
        SecurityContextHolder.clearContext();
        super.unsuccessfulAuthentication(request, response, failed);
    }

    public static class GatewayUserPrincipal {
        public final String userId;
        public final String username;
        public final String email;
        public GatewayUserPrincipal(String userId, String username, String email) {
            this.userId = userId;
            this.username = username;
            this.email = email;
        }
        @Override public String toString() { return username != null ? username : userId; }
    }
}
