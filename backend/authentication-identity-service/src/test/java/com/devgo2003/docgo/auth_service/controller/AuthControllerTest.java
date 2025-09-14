package com.devgo2003.docgo.auth_service.controller;

import com.devgo2003.docgo.auth_service.common.response.RestResponse;
import com.devgo2003.docgo.auth_service.dto.LoginRequest;
import com.devgo2003.docgo.auth_service.dto.LoginResponse;
import com.devgo2003.docgo.auth_service.dto.UserRequest;
import com.devgo2003.docgo.auth_service.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
    "spring.data.mongodb.uri=${MONGODB_ATLAS_URI}",
    "spring.redis.host=${REDIS_CLOUD_HOST}",
    "spring.redis.port=${REDIS_CLOUD_PORT}"
})
class AuthControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testLogin() {
        LoginRequest request = new LoginRequest("test@example.com", "password");
        ResponseEntity<RestResponse<LoginResponse>> response = restTemplate.postForEntity(
            "/api/v1/authentication-identity-service/auth/login",
            request,
            new ParameterizedTypeReference<RestResponse<LoginResponse>>() {}
        );
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getData().getToken());
    }
    
    @Test
    void testUserManagement() {
        UserRequest request = new UserRequest("test@example.com", "Test User");
        ResponseEntity<RestResponse<User>> response = restTemplate.postForEntity(
            "/api/v1/authentication-identity-service/users",
            request,
            new ParameterizedTypeReference<RestResponse<User>>() {}
        );
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getData().getId());
    }
}
