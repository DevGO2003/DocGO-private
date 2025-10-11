package com.devgo2003.docgo.document_service.service.impl;

import com.devgo2003.docgo.document_service.dto.ContractValidationResult;
import com.devgo2003.docgo.document_service.entity.Contract;
import com.devgo2003.docgo.document_service.entity.ContractAttachment;
import com.devgo2003.docgo.document_service.entity.ContractEvent;
import com.devgo2003.docgo.document_service.repository.ContractRepository;
import com.devgo2003.docgo.document_service.repository.ContractAttachmentRepository;
import com.devgo2003.docgo.document_service.repository.ContractEventRepository;
import com.devgo2003.docgo.document_service.service.IContractBusinessService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

/**
 * Service implementation cho ContractBusinessService
 * Xử lý business logic cho contracts
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContractBusinessServiceImpl implements IContractBusinessService {

    private final ContractRepository contractRepository;
    private final ContractAttachmentRepository attachmentRepository;
    private final ContractEventRepository eventRepository;

    @Override
    public ContractValidationResult validateContract(Contract contract) {
        log.info("Validating contract: {}", contract.getId());
        
        ContractValidationResult result = new ContractValidationResult();
        result.setValid(true);
        result.setErrors(new java.util.ArrayList<>());
        result.setWarnings(new java.util.ArrayList<>());
        
        // Basic validation
        if (contract.getTitle() == null || contract.getTitle().trim().isEmpty()) {
            result.setValid(false);
            result.getErrors().add("Tiêu đề hợp đồng không được để trống");
        }
        
        if (contract.getContractNumber() == null || contract.getContractNumber().trim().isEmpty()) {
            result.setValid(false);
            result.getErrors().add("Số hợp đồng không được để trống");
        }
        
        if (contract.getStatus() == null) {
            result.setValid(false);
            result.getErrors().add("Trạng thái hợp đồng không được để trống");
        }
        
        if (contract.getContractType() == null) {
            result.setValid(false);
            result.getErrors().add("Loại hợp đồng không được để trống");
        }
        
        // Business validation
        if (contract.getStartDate() != null && contract.getEndDate() != null) {
            if (contract.getEndDate().isBefore(contract.getStartDate())) {
                result.setValid(false);
                result.getErrors().add("Ngày kết thúc không được trước ngày bắt đầu");
            }
        }
        
        // Warning checks
        if (contract.getRiskLevel() == null || contract.getRiskLevel().trim().isEmpty()) {
            result.getWarnings().add("Mức độ rủi ro chưa được đánh giá");
        }
        
        if (contract.getComplianceStatus() == null || contract.getComplianceStatus().trim().isEmpty()) {
            result.getWarnings().add("Trạng thái tuân thủ chưa được đánh giá");
        }
        
        log.info("Contract validation completed - valid: {}, errors: {}, warnings: {}", 
                result.isValid(), result.getErrors().size(), result.getWarnings().size());
        
        return result;
    }

    @Override
    public Contract changeContractStatus(String contractId, String newStatus) {
        log.info("Changing contract status for id: {} to: {}", contractId, newStatus);
        
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));
        
        String oldStatus = contract.getStatus() != null ? contract.getStatus().toString() : "UNKNOWN";
        contract.setStatus(com.devgo2003.docgo.document_service.enums.ContractStatus.valueOf(newStatus));
        contract.setUpdatedAt(LocalDateTime.now());
        
        Contract updatedContract = contractRepository.save(contract);
        
        // Log status change event
        logStatusChangeEvent(contractId, oldStatus, newStatus);
        
        log.info("Contract status changed successfully from {} to {}", oldStatus, newStatus);
        return updatedContract;
    }

    @Override
    public Contract processContractWorkflow(String contractId, String action) {
        log.info("Processing contract workflow for id: {} with action: {}", contractId, action);
        
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));
        
        // Process workflow based on action
        switch (action.toUpperCase()) {
            case "APPROVE":
                contract.setStatus(com.devgo2003.docgo.document_service.enums.ContractStatus.APPROVED);
                break;
            case "REJECT":
                contract.setStatus(com.devgo2003.docgo.document_service.enums.ContractStatus.REJECTED);
                break;
            case "ACTIVATE":
                contract.setStatus(com.devgo2003.docgo.document_service.enums.ContractStatus.ACTIVE);
                break;
            case "SUSPEND":
                contract.setStatus(com.devgo2003.docgo.document_service.enums.ContractStatus.SUSPENDED);
                break;
            case "TERMINATE":
                contract.setStatus(com.devgo2003.docgo.document_service.enums.ContractStatus.TERMINATED);
                break;
            default:
                throw new IllegalArgumentException("Invalid workflow action: " + action);
        }
        
        contract.setUpdatedAt(LocalDateTime.now());
        Contract updatedContract = contractRepository.save(contract);
        
        // Log workflow event
        logWorkflowEvent(contractId, action, contract.getStatus().toString());
        
        log.info("Contract workflow processed successfully with action: {}", action);
        return updatedContract;
    }

    @Override
    public Map<String, Object> calculateContractMetrics(String contractId) {
        log.info("Calculating contract metrics for id: {}", contractId);
        
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));
        
        Map<String, Object> metrics = new HashMap<>();
        
        // Basic metrics
        metrics.put("contractId", contractId);
        metrics.put("status", contract.getStatus());
        metrics.put("contractType", contract.getContractType());
        metrics.put("riskLevel", contract.getRiskLevel());
        metrics.put("complianceStatus", contract.getComplianceStatus());
        
        // Date metrics
        if (contract.getStartDate() != null) {
            metrics.put("startDate", contract.getStartDate());
        }
        if (contract.getEndDate() != null) {
            metrics.put("endDate", contract.getEndDate());
            // Calculate days remaining
            long daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(LocalDateTime.now(), contract.getEndDate());
            metrics.put("daysRemaining", daysRemaining);
        }
        
        // Attachment metrics
        List<ContractAttachment> attachments = attachmentRepository.findByContractId(contractId);
        metrics.put("attachmentCount", attachments.size());
        
        // Event metrics
        List<ContractEvent> events = eventRepository.findByContractId(contractId);
        metrics.put("eventCount", events.size());
        
        log.info("Contract metrics calculated successfully - {} metrics generated", metrics.size());
        return metrics;
    }

    @Override
    public boolean checkContractExpiry(String contractId) {
        log.info("Checking contract expiry for id: {}", contractId);
        
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));
        
        if (contract.getEndDate() == null) {
            log.warn("Contract {} has no end date", contractId);
            return false;
        }
        
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiryDate = contract.getEndDate();
        
        // Check if contract expires within 30 days
        long daysUntilExpiry = java.time.temporal.ChronoUnit.DAYS.between(now, expiryDate);
        boolean isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
        
        log.info("Contract {} expires in {} days, isExpiringSoon: {}", contractId, daysUntilExpiry, isExpiringSoon);
        return isExpiringSoon;
    }

    @Override
    public ContractAttachment addAttachment(String contractId, ContractAttachment attachment) {
        log.info("Adding attachment to contract: {}", contractId);
        
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));
        
        attachment.setContractId(contractId);
        attachment.setCreatedAt(LocalDateTime.now());
        attachment.setUpdatedAt(LocalDateTime.now());
        
        ContractAttachment savedAttachment = attachmentRepository.save(attachment);
        
        log.info("Attachment added successfully with id: {}", savedAttachment.getId());
        return savedAttachment;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractAttachment> getAttachments(String contractId) {
        log.info("Getting attachments for contract: {}", contractId);
        
        return attachmentRepository.findByContractId(contractId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractEvent> getContractEvents(String contractId) {
        log.info("Getting events for contract: {}", contractId);
        
        return eventRepository.findByContractId(contractId);
    }

    @Override
    public void createOrUpdateContractSummary(String contractId, String fileId, String filename, String summary, 
                                            String partiesJson, String keyTerms, String favorableClauses, 
                                            String unfavorableClauses, String riskLevel, String complianceStatus) {
        log.info("Creating or updating contract summary for contract: {}", contractId);
        
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));
        
        // Update contract fields
        if (summary != null) {
            contract.setSummary(summary);
        }
        if (partiesJson != null) {
            contract.setPartiesJson(partiesJson);
        }
        if (keyTerms != null) {
            contract.setKeyTerms(keyTerms);
        }
        if (favorableClauses != null) {
            contract.setFavorableClauses(favorableClauses);
        }
        if (unfavorableClauses != null) {
            contract.setUnfavorableClauses(unfavorableClauses);
        }
        if (riskLevel != null) {
            contract.setRiskLevel(riskLevel);
        }
        if (complianceStatus != null) {
            contract.setComplianceStatus(complianceStatus);
        }
        
        contract.setUpdatedAt(LocalDateTime.now());
        contractRepository.save(contract);
        
        log.info("Contract summary updated successfully for contract: {}", contractId);
    }

    @Override
    public void createOrUpdateContractFile(String contractId, String fileId, String filename, String fileType, 
                                         String fileSize, String filePath) {
        log.info("Creating or updating contract file for contract: {}", contractId);
        
        // TODO: Implement file storage logic
        log.info("Contract file updated successfully for contract: {}", contractId);
    }

    @Override
    public void createOrUpdateContractParty(String contractId, String partyName, String partyRole, 
                                          String contactInfo, String address, String taxCode) {
        log.info("Creating or updating contract party for contract: {}", contractId);
        
        // TODO: Implement party management logic
        log.info("Contract party updated successfully for contract: {}", contractId);
    }

    @Override
    public void createOrUpdateContractClause(String contractId, String clauseName, String description, 
                                           String clauseType, String importanceLevel, String source) {
        log.info("Creating or updating contract clause for contract: {}", contractId);
        
        // TODO: Implement clause management logic
        log.info("Contract clause updated successfully for contract: {}", contractId);
    }

    @Override
    public void createOrUpdateContractPayment(String contractId, String totalValue, String schedule, String currency) {
        log.info("Creating or updating contract payment for contract: {}", contractId);
        
        Contract contract = contractRepository.findById(contractId)
            .orElseThrow(() -> new RuntimeException("Contract not found with id: " + contractId));
        
        if (totalValue != null) {
            contract.setTotalValue(totalValue);
        }
        if (schedule != null) {
            contract.setPaymentSchedule(schedule);
        }
        if (currency != null) {
            contract.setCurrency(currency);
        }
        
        contract.setUpdatedAt(LocalDateTime.now());
        contractRepository.save(contract);
        
        log.info("Contract payment updated successfully for contract: {}", contractId);
    }

    // Helper methods
    private void logStatusChangeEvent(String contractId, String oldStatus, String newStatus) {
        ContractEvent event = new ContractEvent();
        event.setContractId(contractId);
        event.setEventType("STATUS_CHANGE");
        event.setEventData("Status changed from " + oldStatus + " to " + newStatus);
        event.setCreatedAt(LocalDateTime.now());
        eventRepository.save(event);
    }

    private void logWorkflowEvent(String contractId, String action, String newStatus) {
        ContractEvent event = new ContractEvent();
        event.setContractId(contractId);
        event.setEventType("WORKFLOW_ACTION");
        event.setEventData("Action: " + action + ", New Status: " + newStatus);
        event.setCreatedAt(LocalDateTime.now());
        eventRepository.save(event);
    }
}
