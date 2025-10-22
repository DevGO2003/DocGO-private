package com.devgo2003.docgo.repository_service.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Contract Workflow Controller - Quản lý workflow của contracts
 */
@RestController
@RequestMapping("/api/contracts/{contractId}/workflow")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ContractWorkflowController {

    private final RestTemplate restTemplate = new RestTemplate();
    
    // URL của user-management-service (workflow service)
    private static final String WORKFLOW_SERVICE_URL = "http://localhost:8081/api";

    /**
     * Execute workflow cho contract
     * POST /api/contracts/{contractId}/workflow/execute
     */
    @PostMapping("/execute")
    public ResponseEntity<?> executeWorkflow(
            @PathVariable String contractId,
            @RequestBody ExecuteWorkflowRequest request) {
        log.info("POST /api/contracts/{}/workflow/execute", contractId);
        
        try {
            // Call workflow service để execute workflow
            String url = WORKFLOW_SERVICE_URL + "/workflow-instances/execute";
            
            Map<String, Object> requestBody = Map.of(
                "contractId", contractId,
                "workflowId", request.getWorkflowId(),
                "contractData", request.getContractData()
            );
            
            // TODO: Implement actual workflow execution
            // ResponseEntity<?> response = restTemplate.postForEntity(url, requestBody, Object.class);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Workflow executed successfully",
                "contractId", contractId
            ));
        } catch (Exception e) {
            log.error("Error executing workflow for contract {}", contractId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Get workflow status của contract
     * GET /api/contracts/{contractId}/workflow/status
     */
    @GetMapping("/status")
    public ResponseEntity<?> getWorkflowStatus(@PathVariable String contractId) {
        log.info("GET /api/contracts/{}/workflow/status", contractId);
        
        try {
            // Call workflow service để get status
            // String url = WORKFLOW_SERVICE_URL + "/workflow-instances/by-contract/" + contractId;
            // ResponseEntity<?> response = restTemplate.getForEntity(url, Object.class);
            
            // TODO: Implement actual status retrieval
            return ResponseEntity.ok(Map.of(
                "contractId", contractId,
                "status", "in_progress",
                "currentStep", 1
            ));
        } catch (Exception e) {
            log.error("Error getting workflow status for contract {}", contractId, e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // DTOs
    @lombok.Data
    public static class ExecuteWorkflowRequest {
        private String workflowId;
        private Map<String, Object> contractData;
    }
}
