package com.devgo2003.docgo.document_service.service.impl;

import com.devgo2003.docgo.document_service.client.AutomationServiceClient;
import com.devgo2003.docgo.document_service.dto.ContractSummaryCreateRequest;
import com.devgo2003.docgo.document_service.dto.ContractSummaryResponseDto;
import com.devgo2003.docgo.document_service.entity.ContractSummary;
import com.devgo2003.docgo.document_service.repository.ContractSummaryRepository;
import com.devgo2003.docgo.document_service.service.IContractSummaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service implementation cho ContractSummary
 * Xử lý business logic cho contract summary
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ContractSummaryServiceImpl implements IContractSummaryService {

    private final ContractSummaryRepository contractSummaryRepository;
    private final AutomationServiceClient automationServiceClient;

    @Override
    @Transactional(readOnly = true)
    public Optional<ContractSummaryResponseDto> getContractSummary(String contractId) {
        log.info("Getting contract summary for contractId: {}", contractId);
        
        return contractSummaryRepository.findByContractId(contractId)
            .map(this::convertToResponseDto);
    }

    @Override
    public ContractSummaryResponseDto createContractSummary(ContractSummaryCreateRequest request) {
        log.info("Creating contract summary for contractId: {}", request.getContractId());

        // Check if summary already exists
        if (contractSummaryRepository.existsByContractId(request.getContractId())) {
            throw new IllegalArgumentException("Contract summary already exists for contractId: " + request.getContractId());
        }

        ContractSummary summary = convertToEntity(request);
        summary.setAiProcessed(false);
        summary.setProcessingStatus(ContractSummary.ProcessingStatus.PENDING_REVIEW);
        summary.initializeNewEntity();

        ContractSummary savedSummary = contractSummaryRepository.save(summary);
        log.info("Successfully created contract summary with id: {}", savedSummary.getId());

        return convertToResponseDto(savedSummary);
    }

    @Override
    public ContractSummaryResponseDto updateContractSummary(String contractId, ContractSummaryCreateRequest request) {
        log.info("Updating contract summary for contractId: {}", contractId);

        ContractSummary existingSummary = contractSummaryRepository.findByContractId(contractId)
            .orElseThrow(() -> new IllegalArgumentException("Contract summary not found for contractId: " + contractId));

        // Update fields
        updateEntityFromRequest(existingSummary, request);
        existingSummary.setUpdatedAt(LocalDateTime.now());

        ContractSummary updatedSummary = contractSummaryRepository.save(existingSummary);
        log.info("Successfully updated contract summary with id: {}", updatedSummary.getId());

        return convertToResponseDto(updatedSummary);
    }

    @Override
    public void deleteContractSummary(String contractId) {
        log.info("Deleting contract summary for contractId: {}", contractId);

        ContractSummary summary = contractSummaryRepository.findByContractId(contractId)
            .orElseThrow(() -> new IllegalArgumentException("Contract summary not found for contractId: " + contractId));

        summary.markAsDeleted("system");
        contractSummaryRepository.save(summary);
        
        log.info("Successfully deleted contract summary for contractId: {}", contractId);
    }

    @Override
    public ContractSummaryResponseDto regenerateContractSummary(String contractId) {
        log.info("Regenerating contract summary for contractId: {}", contractId);

        // Check if automation service is available
        if (!automationServiceClient.isServiceAvailable()) {
            throw new RuntimeException("Automation service is not available");
        }

        // TODO: Get file content from file storage service
        String fileContent = "Sample file content"; // Placeholder
        String fileId = contractId; // Placeholder

        try {
            // Call automation service to generate new summary
            ContractSummaryCreateRequest aiGeneratedSummary = automationServiceClient.generateContractSummary(fileId, fileContent);
            aiGeneratedSummary.setContractId(contractId);

            // Update existing summary or create new one
            ContractSummaryResponseDto result;
            if (contractSummaryRepository.existsByContractId(contractId)) {
                result = updateContractSummary(contractId, aiGeneratedSummary);
            } else {
                result = createContractSummary(aiGeneratedSummary);
            }

            // Mark as AI processed
            ContractSummary summary = contractSummaryRepository.findByContractId(contractId).orElseThrow();
            summary.setAiProcessed(true);
            summary.setLastAiAnalysis(LocalDateTime.now());
            summary.setProcessingStatus(ContractSummary.ProcessingStatus.COMPLETED);
            contractSummaryRepository.save(summary);

            log.info("Successfully regenerated contract summary for contractId: {}", contractId);
            return result;

        } catch (Exception e) {
            log.error("Error regenerating contract summary for contractId: {}", contractId, e);
            
            // Update processing status to failed
            contractSummaryRepository.findByContractId(contractId).ifPresent(summary -> {
                summary.setProcessingStatus(ContractSummary.ProcessingStatus.FAILED);
                contractSummaryRepository.save(summary);
            });
            
            throw new RuntimeException("Failed to regenerate contract summary: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractSummaryResponseDto> getContractSummariesByStatus(String status) {
        log.info("Getting contract summaries by status: {}", status);
        
        return contractSummaryRepository.findByStatus(status)
            .stream()
            .map(this::convertToResponseDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractSummaryResponseDto> getContractSummariesByType(String contractType) {
        log.info("Getting contract summaries by type: {}", contractType);
        
        return contractSummaryRepository.findByContractType(contractType)
            .stream()
            .map(this::convertToResponseDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractSummaryResponseDto> getContractSummariesByAiProcessed(Boolean aiProcessed) {
        log.info("Getting contract summaries by aiProcessed: {}", aiProcessed);
        
        return contractSummaryRepository.findByAiProcessed(aiProcessed)
            .stream()
            .map(this::convertToResponseDto)
            .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByContractId(String contractId) {
        return contractSummaryRepository.existsByContractId(contractId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(String status) {
        return contractSummaryRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByContractType(String contractType) {
        return contractSummaryRepository.countByContractType(contractType);
    }

    // Helper methods
    private ContractSummary convertToEntity(ContractSummaryCreateRequest request) {
        ContractSummary summary = new ContractSummary();
        summary.setContractId(request.getContractId());
        summary.setContractNumber(request.getContractNumber());
        summary.setStatus(request.getStatus());
        summary.setContractType(request.getContractType());
        summary.setTitle(request.getTitle());
        summary.setTags(request.getTags());
        summary.setContractObject(request.getContractObject());
        summary.setEffectiveDate(request.getEffectiveDate());
        summary.setContractTerm(request.getContractTerm());
        summary.setTerminationConditions(request.getTerminationConditions());
        
        // Convert nested objects
        if (request.getParties() != null) {
            summary.setParties(request.getParties().stream()
                .map(this::convertPartyDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getPaymentDetails() != null) {
            summary.setPaymentDetails(convertPaymentDetailsDtoToEntity(request.getPaymentDetails()));
        }
        
        if (request.getKeyClauses() != null) {
            summary.setKeyClauses(request.getKeyClauses().stream()
                .map(this::convertKeyClauseDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getFavorableClauses() != null) {
            summary.setFavorableClauses(request.getFavorableClauses().stream()
                .map(this::convertFavorableClauseDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getUnfavorableClauses() != null) {
            summary.setUnfavorableClauses(request.getUnfavorableClauses().stream()
                .map(this::convertUnfavorableClauseDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getReminders() != null) {
            summary.setReminders(request.getReminders().stream()
                .map(this::convertReminderDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getRiskAssessment() != null) {
            summary.setRiskAssessment(convertRiskAssessmentDtoToEntity(request.getRiskAssessment()));
        }
        
        if (request.getComplianceStatus() != null) {
            summary.setComplianceStatus(convertComplianceStatusDtoToEntity(request.getComplianceStatus()));
        }
        
        return summary;
    }

    private void updateEntityFromRequest(ContractSummary entity, ContractSummaryCreateRequest request) {
        entity.setContractNumber(request.getContractNumber());
        entity.setStatus(request.getStatus());
        entity.setContractType(request.getContractType());
        entity.setTitle(request.getTitle());
        entity.setTags(request.getTags());
        entity.setContractObject(request.getContractObject());
        entity.setEffectiveDate(request.getEffectiveDate());
        entity.setContractTerm(request.getContractTerm());
        entity.setTerminationConditions(request.getTerminationConditions());
        
        // Update nested objects
        if (request.getParties() != null) {
            entity.setParties(request.getParties().stream()
                .map(this::convertPartyDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getPaymentDetails() != null) {
            entity.setPaymentDetails(convertPaymentDetailsDtoToEntity(request.getPaymentDetails()));
        }
        
        if (request.getKeyClauses() != null) {
            entity.setKeyClauses(request.getKeyClauses().stream()
                .map(this::convertKeyClauseDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getFavorableClauses() != null) {
            entity.setFavorableClauses(request.getFavorableClauses().stream()
                .map(this::convertFavorableClauseDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getUnfavorableClauses() != null) {
            entity.setUnfavorableClauses(request.getUnfavorableClauses().stream()
                .map(this::convertUnfavorableClauseDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getReminders() != null) {
            entity.setReminders(request.getReminders().stream()
                .map(this::convertReminderDtoToEntity)
                .collect(Collectors.toList()));
        }
        
        if (request.getRiskAssessment() != null) {
            entity.setRiskAssessment(convertRiskAssessmentDtoToEntity(request.getRiskAssessment()));
        }
        
        if (request.getComplianceStatus() != null) {
            entity.setComplianceStatus(convertComplianceStatusDtoToEntity(request.getComplianceStatus()));
        }
    }

    private ContractSummaryResponseDto convertToResponseDto(ContractSummary entity) {
        return ContractSummaryResponseDto.builder()
            .id(entity.getId())
            .contractId(entity.getContractId())
            .contractNumber(entity.getContractNumber())
            .status(entity.getStatus())
            .contractType(entity.getContractType())
            .title(entity.getTitle())
            .tags(entity.getTags())
            .contractObject(entity.getContractObject())
            .effectiveDate(entity.getEffectiveDate())
            .contractTerm(entity.getContractTerm())
            .terminationConditions(entity.getTerminationConditions())
            .aiProcessed(entity.getAiProcessed())
            .processingStatus(entity.getProcessingStatus())
            .lastAiAnalysis(entity.getLastAiAnalysis())
            .aiConfidenceScore(entity.getAiConfidenceScore())
            .createdAt(entity.getCreatedAt())
            .updatedAt(entity.getUpdatedAt())
            .build();
    }

    // Conversion methods for nested objects
    private com.devgo2003.docgo.document_service.entity.ContractParty convertPartyDtoToEntity(ContractSummaryCreateRequest.ContractPartyDto dto) {
        com.devgo2003.docgo.document_service.entity.ContractParty entity = new com.devgo2003.docgo.document_service.entity.ContractParty();
        entity.setRole(dto.getRole());
        entity.setName(dto.getName());
        entity.setRepresentative(dto.getRepresentative());
        entity.setTaxCode(dto.getTaxCode());
        entity.setContact(dto.getContact());
        entity.setAddress(dto.getAddress());
        entity.setBusinessLicense(dto.getBusinessLicense());
        return entity;
    }

    private com.devgo2003.docgo.document_service.entity.ContractPaymentDetails convertPaymentDetailsDtoToEntity(ContractSummaryCreateRequest.ContractPaymentDetailsDto dto) {
        com.devgo2003.docgo.document_service.entity.ContractPaymentDetails entity = new com.devgo2003.docgo.document_service.entity.ContractPaymentDetails();
        entity.setTotalValue(dto.getTotalValue());
        entity.setSchedule(dto.getSchedule());
        entity.setCurrency(dto.getCurrency());
        entity.setPaymentMethod(dto.getPaymentMethod());
        return entity;
    }

    private com.devgo2003.docgo.document_service.entity.ContractKeyClause convertKeyClauseDtoToEntity(ContractSummaryCreateRequest.ContractKeyClauseDto dto) {
        com.devgo2003.docgo.document_service.entity.ContractKeyClause entity = new com.devgo2003.docgo.document_service.entity.ContractKeyClause();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setSource(dto.getSource());
        return entity;
    }

    private com.devgo2003.docgo.document_service.entity.ContractFavorableClause convertFavorableClauseDtoToEntity(ContractSummaryCreateRequest.ContractFavorableClauseDto dto) {
        com.devgo2003.docgo.document_service.entity.ContractFavorableClause entity = new com.devgo2003.docgo.document_service.entity.ContractFavorableClause();
        entity.setClauseName(dto.getClauseName());
        entity.setDescription(dto.getDescription());
        entity.setBenefitTo(dto.getBenefitTo());
        return entity;
    }

    private com.devgo2003.docgo.document_service.entity.ContractUnfavorableClause convertUnfavorableClauseDtoToEntity(ContractSummaryCreateRequest.ContractUnfavorableClauseDto dto) {
        com.devgo2003.docgo.document_service.entity.ContractUnfavorableClause entity = new com.devgo2003.docgo.document_service.entity.ContractUnfavorableClause();
        entity.setClauseName(dto.getClauseName());
        entity.setDescription(dto.getDescription());
        entity.setRiskTo(dto.getRiskTo());
        return entity;
    }

    private com.devgo2003.docgo.document_service.entity.ContractReminder convertReminderDtoToEntity(ContractSummaryCreateRequest.ContractReminderDto dto) {
        com.devgo2003.docgo.document_service.entity.ContractReminder entity = new com.devgo2003.docgo.document_service.entity.ContractReminder();
        entity.setType(dto.getType());
        entity.setDate(dto.getDate());
        entity.setContent(dto.getContent());
        return entity;
    }

    private com.devgo2003.docgo.document_service.entity.ContractRiskAssessment convertRiskAssessmentDtoToEntity(ContractSummaryCreateRequest.ContractRiskAssessmentDto dto) {
        com.devgo2003.docgo.document_service.entity.ContractRiskAssessment entity = new com.devgo2003.docgo.document_service.entity.ContractRiskAssessment();
        entity.setRiskLevel(dto.getRiskLevel());
        entity.setRiskFactors(dto.getRiskFactors());
        entity.setMitigationMeasures(dto.getMitigationMeasures());
        return entity;
    }

    private com.devgo2003.docgo.document_service.entity.ContractComplianceStatus convertComplianceStatusDtoToEntity(ContractSummaryCreateRequest.ContractComplianceStatusDto dto) {
        com.devgo2003.docgo.document_service.entity.ContractComplianceStatus entity = new com.devgo2003.docgo.document_service.entity.ContractComplianceStatus();
        entity.setStatus(dto.getStatus());
        entity.setIssues(dto.getIssues());
        entity.setRecommendations(dto.getRecommendations());
        return entity;
    }
}
