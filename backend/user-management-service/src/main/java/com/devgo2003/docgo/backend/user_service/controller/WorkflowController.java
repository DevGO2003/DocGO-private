package com.devgo2003.docgo.backend.user_service.controller;

import com.devgo2003.docgo.backend.user_service.entity.WorkflowEntity;
import com.devgo2003.docgo.backend.user_service.service.WorkflowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Workflow Controller - Quản lý workflow của organization
 */
@RestController
@RequestMapping("/api/organizations/{orgId}/workflow")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class WorkflowController {

    private final WorkflowService workflowService;

    /**
     * Get workflow của organization
     * GET /api/organizations/{orgId}/workflow
     */
    @GetMapping
    public ResponseEntity<WorkflowEntity> getWorkflow(@PathVariable String orgId) {
        log.info("GET /api/organizations/{}/workflow", orgId);
        
        WorkflowEntity workflow = workflowService.getOrganizationWorkflow(orgId);
        return ResponseEntity.ok(workflow);
    }

    /**
     * Update workflow của organization
     * PUT /api/organizations/{orgId}/workflow
     */
    @PutMapping
    public ResponseEntity<WorkflowEntity> updateWorkflow(
            @PathVariable String orgId,
            @RequestBody WorkflowEntity workflow) {
        log.info("PUT /api/organizations/{}/workflow", orgId);
        
        // TODO: Implement update workflow
        // workflowService.updateWorkflow(orgId, workflow);
        
        return ResponseEntity.ok(workflow);
    }

    /**
     * Test workflow với contract data mẫu
     * POST /api/organizations/{orgId}/workflow/test
     */
    @PostMapping("/test")
    public ResponseEntity<?> testWorkflow(
            @PathVariable String orgId,
            @RequestBody java.util.Map<String, Object> contractData) {
        log.info("POST /api/organizations/{}/workflow/test", orgId);
        
        WorkflowEntity workflow = workflowService.getOrganizationWorkflow(orgId);
        
        // Filter enabled steps
        java.util.List<String> enabledSteps = new java.util.ArrayList<>();
        int estimatedDays = 0;
        
        for (WorkflowEntity.WorkflowStep step : workflow.getSteps()) {
            boolean enabled = isStepEnabled(step, contractData);
            if (enabled) {
                enabledSteps.add(step.getName());
                estimatedDays += (step.getTimeoutHours() / 24);
            }
        }
        
        return ResponseEntity.ok(java.util.Map.of(
            "enabledSteps", enabledSteps,
            "totalSteps", workflow.getSteps().size(),
            "estimatedDays", estimatedDays
        ));
    }

    private boolean isStepEnabled(WorkflowEntity.WorkflowStep step, 
                                 java.util.Map<String, Object> contractData) {
        WorkflowEntity.EnabledCondition condition = step.getEnabledCondition();
        
        if (condition == null) {
            return true;
        }

        switch (condition.getType()) {
            case "always":
                return (Boolean) condition.getValue();

            case "value_threshold":
                String field = condition.getField();
                String operator = condition.getOperator();
                Double thresholdValue = ((Number) condition.getValue()).doubleValue();

                Object fieldValue = contractData.get(field);
                if (fieldValue == null) {
                    return false;
                }

                Double contractValue = ((Number) fieldValue).doubleValue();

                switch (operator) {
                    case ">=":
                        return contractValue >= thresholdValue;
                    case "<=":
                        return contractValue <= thresholdValue;
                    case ">":
                        return contractValue > thresholdValue;
                    case "<":
                        return contractValue < thresholdValue;
                    case "==":
                        return contractValue.equals(thresholdValue);
                    default:
                        return false;
                }

            default:
                return true;
        }
    }
}
