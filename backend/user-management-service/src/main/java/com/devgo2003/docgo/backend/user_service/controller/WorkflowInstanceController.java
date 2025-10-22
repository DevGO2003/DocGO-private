package com.devgo2003.docgo.backend.user_service.controller;

import com.devgo2003.docgo.backend.user_service.entity.WorkflowInstanceEntity;
import com.devgo2003.docgo.backend.user_service.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Workflow Instance Controller - Quản lý workflow instances
 */
@RestController
@RequestMapping("/api/workflow-instances")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class WorkflowInstanceController {

    private final WorkflowService workflowService;

    /**
     * Get workflow instance by ID
     * GET /api/workflow-instances/{instanceId}
     */
    @GetMapping("/{instanceId}")
    public ResponseEntity<WorkflowInstanceEntity> getWorkflowInstance(
            @PathVariable String instanceId) {
        log.info("GET /api/workflow-instances/{}", instanceId);
        
        // TODO: Implement get workflow instance
        return ResponseEntity.notFound().build();
    }

    /**
     * Approve step trong workflow
     * POST /api/workflow-instances/{instanceId}/approve
     */
    @PostMapping("/{instanceId}/approve")
    public ResponseEntity<?> approve(
            @PathVariable String instanceId,
            @RequestBody ApprovalRequest request) {
        log.info("POST /api/workflow-instances/{}/approve by user {}", 
                instanceId, request.getUserId());
        
        try {
            workflowService.handleApproval(
                instanceId,
                request.getUserId(),
                "approve",
                request.getComment(),
                request.getMetadata()
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Approved successfully"
            ));
        } catch (Exception e) {
            log.error("Error approving workflow instance", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Reject step trong workflow
     * POST /api/workflow-instances/{instanceId}/reject
     */
    @PostMapping("/{instanceId}/reject")
    public ResponseEntity<?> reject(
            @PathVariable String instanceId,
            @RequestBody RejectionRequest request) {
        log.info("POST /api/workflow-instances/{}/reject by user {}", 
                instanceId, request.getUserId());
        
        try {
            workflowService.handleApproval(
                instanceId,
                request.getUserId(),
                "reject",
                request.getReason(),
                null
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Rejected successfully"
            ));
        } catch (Exception e) {
            log.error("Error rejecting workflow instance", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Request changes trong workflow
     * POST /api/workflow-instances/{instanceId}/request-changes
     */
    @PostMapping("/{instanceId}/request-changes")
    public ResponseEntity<?> requestChanges(
            @PathVariable String instanceId,
            @RequestBody RequestChangesRequest request) {
        log.info("POST /api/workflow-instances/{}/request-changes by user {}", 
                instanceId, request.getUserId());
        
        try {
            workflowService.handleApproval(
                instanceId,
                request.getUserId(),
                "request_changes",
                request.getReason(),
                Map.of("requiredChanges", request.getRequiredChanges())
            );
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Changes requested successfully"
            ));
        } catch (Exception e) {
            log.error("Error requesting changes", e);
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // DTOs
    @lombok.Data
    public static class ApprovalRequest {
        private String userId;
        private String comment;
        private Object metadata;
    }

    @lombok.Data
    public static class RejectionRequest {
        private String userId;
        private String reason;
    }

    @lombok.Data
    public static class RequestChangesRequest {
        private String userId;
        private String reason;
        private java.util.List<String> requiredChanges;
    }
}
