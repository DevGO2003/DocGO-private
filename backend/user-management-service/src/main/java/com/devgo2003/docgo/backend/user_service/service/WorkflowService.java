package com.devgo2003.docgo.backend.user_service.service;

import com.devgo2003.docgo.backend.user_service.entity.WorkflowEntity;
import com.devgo2003.docgo.backend.user_service.entity.WorkflowInstanceEntity;
import com.devgo2003.docgo.backend.user_service.repository.WorkflowRepository;
import com.devgo2003.docgo.backend.user_service.repository.WorkflowInstanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WorkflowService {

    private final WorkflowRepository workflowRepository;
    private final WorkflowInstanceRepository workflowInstanceRepository;

    /**
     * Tạo workflow mặc định cho organization
     * Unified Workflow với 3 steps:
     * - Step 1: Department Review (always)
     * - Step 2: Expert Review (if value >= 100M)
     * - Step 3: Director Approval (if value >= 1B)
     */
    @Transactional
    public WorkflowEntity createDefaultWorkflow(String organizationId) {
        log.info("Creating default workflow for organization: {}", organizationId);

        WorkflowEntity workflow = WorkflowEntity.builder()
                .name("Default Approval Workflow")
                .description("Quy trình phê duyệt mặc định - tự động điều chỉnh theo giá trị hợp đồng")
                .organizationId(organizationId)
                .isDefault(true)
                .isActive(true)
                .steps(createDefaultSteps())
                .settings(createDefaultSettings())
                .build();

        return workflowRepository.save(workflow);
    }

    private List<WorkflowEntity.WorkflowStep> createDefaultSteps() {
        List<WorkflowEntity.WorkflowStep> steps = new ArrayList<>();

        // STEP 1: Department Review (Luôn chạy)
        steps.add(WorkflowEntity.WorkflowStep.builder()
                .order(1)
                .name("Department Review")
                .description("Phê duyệt cấp phòng ban")
                .enabledCondition(WorkflowEntity.EnabledCondition.builder()
                        .type("always")
                        .value(true)
                        .build())
                .type("any")
                .approvers(WorkflowEntity.Approvers.builder()
                        .roles(List.of("manager", "approver"))
                        .minApprovals(1)
                        .build())
                .timeoutHours(24)
                .actions(List.of("approve", "reject", "request_changes"))
                .build());

        // STEP 2: Expert Review (Nếu >= 100M)
        steps.add(WorkflowEntity.WorkflowStep.builder()
                .order(2)
                .name("Expert Review")
                .description("Đánh giá chuyên môn (Pháp lý + Tài chính)")
                .enabledCondition(WorkflowEntity.EnabledCondition.builder()
                        .type("value_threshold")
                        .field("totalValue")
                        .operator(">=")
                        .value(100_000_000.0)
                        .build())
                .type("parallel")
                .approvers(WorkflowEntity.Approvers.builder()
                        .roles(List.of("legal_reviewer", "finance_reviewer"))
                        .minApprovals(2)
                        .build())
                .timeoutHours(48)
                .actions(List.of("approve", "reject", "request_changes"))
                .build());

        // STEP 3: Director Approval (Nếu >= 1B)
        steps.add(WorkflowEntity.WorkflowStep.builder()
                .order(3)
                .name("Director Approval")
                .description("Phê duyệt cấp giám đốc")
                .enabledCondition(WorkflowEntity.EnabledCondition.builder()
                        .type("value_threshold")
                        .field("totalValue")
                        .operator(">=")
                        .value(1_000_000_000.0)
                        .build())
                .type("any")
                .approvers(WorkflowEntity.Approvers.builder()
                        .roles(List.of("admin"))
                        .minApprovals(1)
                        .build())
                .timeoutHours(48)
                .escalateTo(List.of("owner"))
                .actions(List.of("approve", "reject"))
                .build());

        return steps;
    }

    private WorkflowEntity.WorkflowSettings createDefaultSettings() {
        return WorkflowEntity.WorkflowSettings.builder()
                .allowSkip(false)
                .requireComment(true)
                .notifyOnEachStep(true)
                .autoEscalate(true)
                .build();
    }

    /**
     * Execute workflow cho contract
     */
    @Transactional
    public WorkflowInstanceEntity executeWorkflow(String contractId, String workflowId, 
                                                   Map<String, Object> contractData) {
        log.info("Executing workflow {} for contract {}", workflowId, contractId);

        // Get workflow
        WorkflowEntity workflow = workflowRepository.findById(workflowId)
                .orElseThrow(() -> new RuntimeException("Workflow not found: " + workflowId));

        // Filter enabled steps based on contract data
        List<WorkflowEntity.WorkflowStep> enabledSteps = workflow.getSteps().stream()
                .filter(step -> isStepEnabled(step, contractData))
                .collect(Collectors.toList());

        log.info("Contract {} will run {} steps out of {}", 
                contractId, enabledSteps.size(), workflow.getSteps().size());

        // Create workflow instance
        WorkflowInstanceEntity instance = WorkflowInstanceEntity.builder()
                .contractId(contractId)
                .workflowId(workflowId)
                .organizationId(workflow.getOrganizationId())
                .currentStep(0)
                .steps(createStepInstances(enabledSteps))
                .status("in_progress")
                .createdBy((String) contractData.get("createdBy"))
                .build();

        instance = workflowInstanceRepository.save(instance);

        // Start first step
        startStep(instance, 0);

        return instance;
    }

    /**
     * Check nếu step được enable dựa vào contract data
     */
    private boolean isStepEnabled(WorkflowEntity.WorkflowStep step, Map<String, Object> contractData) {
        WorkflowEntity.EnabledCondition condition = step.getEnabledCondition();

        if (condition == null) {
            return true;
        }

        switch (condition.getType()) {
            case "always":
                return (Boolean) condition.getValue();

            case "value_threshold":
                return checkValueThreshold(condition, contractData);

            case "contract_type":
                return checkContractType(condition, contractData);

            default:
                log.warn("Unknown condition type: {}", condition.getType());
                return true;
        }
    }

    private boolean checkValueThreshold(WorkflowEntity.EnabledCondition condition, 
                                       Map<String, Object> contractData) {
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
    }

    private boolean checkContractType(WorkflowEntity.EnabledCondition condition, 
                                     Map<String, Object> contractData) {
        String contractType = (String) contractData.get("contractType");
        List<String> allowedTypes = (List<String>) condition.getValue();
        return allowedTypes.contains(contractType);
    }

    private List<WorkflowInstanceEntity.StepInstance> createStepInstances(
            List<WorkflowEntity.WorkflowStep> steps) {
        return steps.stream()
                .map(step -> WorkflowInstanceEntity.StepInstance.builder()
                        .order(step.getOrder())
                        .name(step.getName())
                        .description(step.getDescription())
                        .status("pending")
                        .approvals(new ArrayList<>())
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Start một step trong workflow
     */
    private void startStep(WorkflowInstanceEntity instance, int stepIndex) {
        if (stepIndex >= instance.getSteps().size()) {
            log.warn("Step index {} out of bounds for workflow instance {}", 
                    stepIndex, instance.getId());
            return;
        }

        WorkflowInstanceEntity.StepInstance step = instance.getSteps().get(stepIndex);
        step.setStatus("in_progress");
        step.setStartedAt(LocalDateTime.now());

        // Calculate timeout
        // TODO: Get timeout from workflow definition
        step.setTimeoutAt(LocalDateTime.now().plusHours(24));

        instance.setCurrentStep(stepIndex);
        workflowInstanceRepository.save(instance);

        log.info("Started step {} for workflow instance {}", stepIndex, instance.getId());

        // TODO: Notify approvers
    }

    /**
     * Handle approval action
     */
    @Transactional
    public void handleApproval(String workflowInstanceId, String userId, 
                              String action, String comment, Object metadata) {
        log.info("Handling approval: instance={}, user={}, action={}", 
                workflowInstanceId, userId, action);

        WorkflowInstanceEntity instance = workflowInstanceRepository.findById(workflowInstanceId)
                .orElseThrow(() -> new RuntimeException("Workflow instance not found"));

        int currentStepIndex = instance.getCurrentStep();
        WorkflowInstanceEntity.StepInstance currentStep = instance.getSteps().get(currentStepIndex);

        // Add approval
        WorkflowInstanceEntity.Approval approval = WorkflowInstanceEntity.Approval.builder()
                .userId(userId)
                .action(action)
                .comment(comment)
                .metadata(metadata)
                .timestamp(LocalDateTime.now())
                .build();

        currentStep.getApprovals().add(approval);

        // Handle based on action
        switch (action) {
            case "approve":
                handleApprove(instance, currentStepIndex);
                break;
            case "reject":
                handleReject(instance, currentStepIndex, comment);
                break;
            case "request_changes":
                handleRequestChanges(instance, currentStepIndex, comment);
                break;
        }

        workflowInstanceRepository.save(instance);
    }

    private void handleApprove(WorkflowInstanceEntity instance, int stepIndex) {
        WorkflowInstanceEntity.StepInstance step = instance.getSteps().get(stepIndex);

        // Count approvals
        long approveCount = step.getApprovals().stream()
                .filter(a -> "approve".equals(a.getAction()))
                .count();

        // TODO: Get minApprovals from workflow definition
        int minApprovals = 1;

        if (approveCount >= minApprovals) {
            // Step completed
            step.setStatus("completed");
            step.setCompletedAt(LocalDateTime.now());

            // Move to next step or complete workflow
            if (stepIndex + 1 < instance.getSteps().size()) {
                startStep(instance, stepIndex + 1);
            } else {
                // Workflow completed
                instance.setStatus("completed");
                instance.setCompletedAt(LocalDateTime.now());
                log.info("Workflow instance {} completed", instance.getId());
                // TODO: Update contract status to approved
            }
        }
    }

    private void handleReject(WorkflowInstanceEntity instance, int stepIndex, String reason) {
        WorkflowInstanceEntity.StepInstance step = instance.getSteps().get(stepIndex);
        step.setStatus("rejected");
        step.setCompletedAt(LocalDateTime.now());

        instance.setStatus("rejected");
        instance.setCompletedAt(LocalDateTime.now());

        log.info("Workflow instance {} rejected: {}", instance.getId(), reason);
        // TODO: Notify contract creator
    }

    private void handleRequestChanges(WorkflowInstanceEntity instance, int stepIndex, String reason) {
        WorkflowInstanceEntity.StepInstance step = instance.getSteps().get(stepIndex);
        step.setStatus("changes_requested");
        step.setCompletedAt(LocalDateTime.now());

        instance.setStatus("changes_requested");
        instance.setCompletedAt(LocalDateTime.now());

        log.info("Workflow instance {} requested changes: {}", instance.getId(), reason);
        // TODO: Notify contract creator
    }

    /**
     * Get workflow của organization
     */
    public WorkflowEntity getOrganizationWorkflow(String organizationId) {
        return workflowRepository.findByOrganizationIdAndIsDefaultTrue(organizationId)
                .orElseThrow(() -> new RuntimeException("Default workflow not found for organization"));
    }

    /**
     * Get active workflow instance của contract
     */
    public WorkflowInstanceEntity getActiveWorkflowInstance(String contractId) {
        return workflowInstanceRepository.findByContractIdAndStatus(contractId, "in_progress")
                .orElse(null);
    }

    /**
     * Check timeout và escalate
     */
    @Transactional
    public void checkAndHandleTimeouts() {
        List<WorkflowInstanceEntity> instances = workflowInstanceRepository
                .findByStatus("in_progress");

        LocalDateTime now = LocalDateTime.now();

        for (WorkflowInstanceEntity instance : instances) {
            int currentStepIndex = instance.getCurrentStep();
            WorkflowInstanceEntity.StepInstance currentStep = instance.getSteps().get(currentStepIndex);

            if (currentStep.getTimeoutAt() != null && 
                currentStep.getTimeoutAt().isBefore(now) && 
                !currentStep.getEscalated()) {
                
                log.warn("Step {} of workflow instance {} timed out", 
                        currentStepIndex, instance.getId());
                
                escalateStep(instance, currentStepIndex);
            }
        }
    }

    private void escalateStep(WorkflowInstanceEntity instance, int stepIndex) {
        WorkflowInstanceEntity.StepInstance step = instance.getSteps().get(stepIndex);
        step.setEscalated(true);
        step.setEscalatedAt(LocalDateTime.now());

        // TODO: Get escalation targets from workflow definition
        // TODO: Notify escalation targets

        workflowInstanceRepository.save(instance);
        log.info("Escalated step {} of workflow instance {}", stepIndex, instance.getId());
    }
}
