package com.devgo2003.docgo.repository_service.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
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
    protected void successfulAuthentication(HttpServletRequest request, HttpServletResponse response, FilterChain chain, Authentication authResult) throws IOException, ServletException {
        String rolesHeader = request.getHeader("X-User-Roles");
        List<SimpleGrantedAuthority> authorities = rolesHeader == null ? List.of()
            : Arrays.stream(rolesHeader.split(","))
                .map(String::trim)
                .filter(r -> !r.isEmpty())
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.toUpperCase()))
                .collect(Collectors.toList());

        GatewayUserPrincipal principal = (GatewayUserPrincipal) authResult.getPrincipal();
        Authentication authentication = new AbstractAuthenticationToken(authorities) {
            @Override public Object getCredentials() { return authResult.getCredentials(); }
            @Override public Object getPrincipal() { return principal; }
        };
        authentication.setAuthenticated(true);
        SecurityContextHolder.getContext().setAuthentication(authentication);
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
