package com.devgo2003.docgo.repository_service.controller;

import com.devgo2003.docgo.repository_service.entity.ContractApprovalWorkflow;
import com.devgo2003.docgo.repository_service.service.ContractApprovalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/repository-management-service/contracts")
@Tag(name = "Contract Approval", description = "API quản lý phê duyệt hợp đồng")
@RequiredArgsConstructor
public class ContractApprovalController {

    private final ContractApprovalService approvalService;

    @PostMapping("/{contractId}/approvals/start")
    @Operation(summary = "Submit contract for approval")
    public ResponseEntity<ApiResponse<ContractApprovalWorkflow>> startApproval(
        @PathVariable String contractId,
        @RequestHeader("X-User-Id") String userId,
        @RequestHeader("X-User-Name") String userName,
        @RequestHeader("X-User-Email") String userEmail,
        @RequestHeader("X-Organization-Id") String organizationId,
        @RequestBody StartApprovalRequest request
    ) {
        log.info("Starting approval for contract: {} by user: {}", contractId, userId);

        ContractApprovalWorkflow workflow = approvalService.createWorkflow(
            contractId,
            organizationId,
            userId,
            userName,
            userEmail,
            request.getComment()
        );

        return ResponseEntity.ok(ApiResponse.success(workflow, "Workflow started successfully"));
    }

    @GetMapping("/{contractId}/approvals/workflow")
    @Operation(summary = "Get workflow status for contract")
    public ResponseEntity<ApiResponse<ContractApprovalWorkflow>> getWorkflow(
        @PathVariable String contractId
    ) {
        log.info("Getting workflow for contract: {}", contractId);

        ContractApprovalWorkflow workflow = approvalService.getWorkflowByContractId(contractId);

        if (workflow == null) {
            return ResponseEntity.ok(ApiResponse.error("No workflow found for this contract"));
        }

        return ResponseEntity.ok(ApiResponse.success(workflow, "Workflow retrieved successfully"));
    }

    @GetMapping("/{contractId}/approvals/history")
    @Operation(summary = "Get workflow history for contract")
    public ResponseEntity<ApiResponse<List<ContractApprovalWorkflow>>> getWorkflowHistory(
        @PathVariable String contractId
    ) {
        log.info("Getting workflow history for contract: {}", contractId);

        List<ContractApprovalWorkflow> history = approvalService.getWorkflowHistory(contractId);

        return ResponseEntity.ok(ApiResponse.success(history, "Workflow history retrieved successfully"));
    }

    @PostMapping("/{contractId}/approvals/approve")
    @Operation(summary = "Approve current level")
    public ResponseEntity<ApiResponse<ContractApprovalWorkflow>> approve(
        @PathVariable String contractId,
        @RequestHeader("X-User-Id") String userId,
        @RequestHeader("X-User-Name") String userName,
        @RequestHeader("X-User-Email") String userEmail,
        @RequestHeader("X-User-Role") String userRole,
        @RequestHeader(value = "X-User-Permissions", required = false) String permissionsStr,
        @RequestBody ApprovalActionRequest request
    ) {
        log.info("Approving contract: {} by user: {}", contractId, userId);

        // Get current workflow
        ContractApprovalWorkflow workflow = approvalService.getWorkflowByContractId(contractId);
        if (workflow == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No active workflow found"));
        }

        // Parse permissions
        List<String> permissions = permissionsStr != null 
            ? List.of(permissionsStr.split(","))
            : List.of();

        // Approve
        ContractApprovalWorkflow updated = approvalService.approve(
            workflow.getId(),
            userId,
            userName,
            userEmail,
            userRole,
            permissions,
            request.getComment()
        );

        return ResponseEntity.ok(ApiResponse.success(updated, "Approved successfully"));
    }

    @PostMapping("/{contractId}/approvals/reject")
    @Operation(summary = "Reject current level")
    public ResponseEntity<ApiResponse<ContractApprovalWorkflow>> reject(
        @PathVariable String contractId,
        @RequestHeader("X-User-Id") String userId,
        @RequestHeader("X-User-Name") String userName,
        @RequestHeader("X-User-Email") String userEmail,
        @RequestHeader("X-User-Role") String userRole,
        @RequestHeader(value = "X-User-Permissions", required = false) String permissionsStr,
        @RequestBody ApprovalActionRequest request
    ) {
        log.info("Rejecting contract: {} by user: {}", contractId, userId);

        // Get current workflow
        ContractApprovalWorkflow workflow = approvalService.getWorkflowByContractId(contractId);
        if (workflow == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("No active workflow found"));
        }

        // Parse permissions
        List<String> permissions = permissionsStr != null 
            ? List.of(permissionsStr.split(","))
            : List.of();

        // Reject
        ContractApprovalWorkflow updated = approvalService.reject(
            workflow.getId(),
            userId,
            userName,
            userEmail,
            userRole,
            permissions,
            request.getComment()
        );

        return ResponseEntity.ok(ApiResponse.success(updated, "Rejected successfully"));
    }

    @GetMapping("/approvals/me/pending")
    @Operation(summary = "Get my pending approvals")
    public ResponseEntity<ApiResponse<Page<ContractApprovalWorkflow>>> getMyPendingApprovals(
        @RequestHeader("X-Organization-Id") String organizationId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        log.info("Getting pending approvals for organization: {}", organizationId);

        Pageable pageable = PageRequest.of(page, size);
        Page<ContractApprovalWorkflow> workflows = approvalService.getPendingApprovals(organizationId, pageable);

        return ResponseEntity.ok(ApiResponse.success(workflows, "Pending approvals retrieved successfully"));
    }

    // DTOs

    @Data
    public static class StartApprovalRequest {
        private String comment;
    }

    @Data
    public static class ApprovalActionRequest {
        private String comment;
    }

    @Data
    public static class ApiResponse<T> {
        private int statusCode;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(T data, String message) {
            ApiResponse<T> response = new ApiResponse<>();
            response.setStatusCode(200);
            response.setMessage(message);
            response.setData(data);
            return response;
        }

        public static <T> ApiResponse<T> error(String message) {
            ApiResponse<T> response = new ApiResponse<>();
            response.setStatusCode(400);
            response.setMessage(message);
            return response;
        }
    }
}
