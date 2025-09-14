package com.devgo2003.docgo.contract_service.controller;

import com.devgo2003.docgo.contract_service.common.response.RestResponse;
import com.devgo2003.docgo.contract_service.dto.ContractRequest;
import com.devgo2003.docgo.contract_service.dto.ApprovalRequest;
import com.devgo2003.docgo.contract_service.entity.Contract;
import com.devgo2003.docgo.contract_service.entity.Approval;
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
class ContractControllerTest {
    
    @Autowired
    private TestRestTemplate restTemplate;
    
    @Test
    void testContractCRUD() {
        // Test create contract
        ContractRequest request = new ContractRequest("Test Contract", "Test content");
        ResponseEntity<RestResponse<Contract>> response = restTemplate.postForEntity(
            "/api/v1/contract-management-service/contracts",
            request,
            new ParameterizedTypeReference<RestResponse<Contract>>() {}
        );
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        String contractId = response.getBody().getData().getId();
        
        // Test get contract
        ResponseEntity<RestResponse<Contract>> getResponse = restTemplate.getForEntity(
            "/api/v1/contract-management-service/contracts/" + contractId,
            new ParameterizedTypeReference<RestResponse<Contract>>() {}
        );
        
        assertEquals(HttpStatus.OK, getResponse.getStatusCode());
        assertEquals("Test Contract", getResponse.getBody().getData().getTitle());
    }
    
    @Test
    void testContractApproval() {
        // Test contract approval workflow
        ResponseEntity<RestResponse<Approval>> response = restTemplate.postForEntity(
            "/api/v1/contract-management-service/contracts/123/approve",
            new ApprovalRequest("APPROVED", "Approved by manager"),
            new ParameterizedTypeReference<RestResponse<Approval>>() {}
        );
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("APPROVED", response.getBody().getData().getStatus());
    }
}
