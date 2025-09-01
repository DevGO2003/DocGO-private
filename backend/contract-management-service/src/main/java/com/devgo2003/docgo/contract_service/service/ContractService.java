package com.devgo2003.docgo.contract_service.service;

import com.devgo2003.docgo.contract_service.entity.Contract;
import com.devgo2003.docgo.contract_service.entity.ContractAttachment;
import com.devgo2003.docgo.contract_service.entity.ContractEvent;
import com.devgo2003.docgo.contract_service.entity.ContractSummary;
import com.devgo2003.docgo.contract_service.entity.ContractParty;
import com.devgo2003.docgo.contract_service.repository.ContractRepository;
import com.devgo2003.docgo.contract_service.repository.ContractAttachmentRepository;
import com.devgo2003.docgo.contract_service.repository.ContractEventRepository;
import com.devgo2003.docgo.contract_service.repository.ContractSummaryRepository;
import com.devgo2003.docgo.contract_service.repository.ContractPartyRepository;
import com.devgo2003.docgo.contract_service.repository.ContractPaymentDetailRepository;
import com.devgo2003.docgo.contract_service.repository.ContractRiskAssessmentRepository;
import com.devgo2003.docgo.contract_service.repository.ContractComplianceStatusRepository;
import com.devgo2003.docgo.contract_service.repository.ContractKeyTermRepository;
import com.devgo2003.docgo.contract_service.repository.ContractFavorableClauseRepository;
import com.devgo2003.docgo.contract_service.repository.ContractUnfavorableClauseRepository;
import com.devgo2003.docgo.contract_service.repository.ContractTerminationConditionRepository;
import com.devgo2003.docgo.contract_service.dto.ContractWithSummaryDto;
import com.devgo2003.docgo.contract_service.dto.ContractSummaryDto;
import com.devgo2003.docgo.contract_service.dto.ContractDetailDto;
import com.devgo2003.docgo.contract_service.dto.ContractPartyDto;
import com.devgo2003.docgo.contract_service.dto.ContractResponseDto;
import com.devgo2003.docgo.contract_service.dto.ContractDetailResponseDto;
import com.devgo2003.docgo.contract_service.service.event.ContractEventPublisher;
import com.devgo2003.docgo.contract_service.service.event.ContractEventPayload;
import com.devgo2003.docgo.contract_service.common.exception.ConflictException;
import com.devgo2003.docgo.contract_service.common.exception.InvalidInputException;
import com.devgo2003.docgo.contract_service.common.exception.NoContentException;
import com.devgo2003.docgo.contract_service.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.Arrays;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class ContractService {
    private static final Logger logger = LoggerFactory.getLogger(ContractService.class);
    
    private final ContractRepository contractRepository;
    private final ContractAttachmentRepository attachmentRepository;
    private final ContractEventRepository eventRepository;
    private final ContractSummaryRepository summaryRepository;
    private final ContractPartyRepository partyRepository;
    private final ContractPaymentDetailRepository paymentDetailRepository;
    private final ContractRiskAssessmentRepository riskAssessmentRepository;
    private final ContractComplianceStatusRepository complianceStatusRepository;
    private final ContractKeyTermRepository keyTermRepository;
    private final ContractFavorableClauseRepository favorableClauseRepository;
    private final ContractUnfavorableClauseRepository unfavorableClauseRepository;
    private final ContractTerminationConditionRepository terminationConditionRepository;
    private final ContractEventPublisher eventPublisher;
    private final ContractStatusEventPublisher contractStatusEventPublisher;
    private final ObjectMapper objectMapper;
    private final ContractValidationService validationService;

    private static final Set<String> VALID_SORT_BY_PROPERTIES = new HashSet<>(Arrays.asList(
            "id", "contractNumber", "title", "status", "partiesJson", "startDate", "endDate", "systemId",
            "createdAt", "createdBy", "deletedAt", "deletedBy", "isDeleted", "version"
    ));

    @Autowired
    public ContractService(ContractRepository contractRepository,
                           ContractAttachmentRepository attachmentRepository,
                           ContractEventRepository eventRepository,
                           ContractSummaryRepository summaryRepository,
                           ContractPartyRepository partyRepository,
                           ContractPaymentDetailRepository paymentDetailRepository,
                           ContractRiskAssessmentRepository riskAssessmentRepository,
                           ContractComplianceStatusRepository complianceStatusRepository,
                           ContractKeyTermRepository keyTermRepository,
                           ContractFavorableClauseRepository favorableClauseRepository,
                           ContractUnfavorableClauseRepository unfavorableClauseRepository,
                           ContractTerminationConditionRepository terminationConditionRepository,
                           ContractEventPublisher eventPublisher,
                           ContractStatusEventPublisher contractStatusEventPublisher,
                           ObjectMapper objectMapper,
                           ContractValidationService validationService) {
        this.contractRepository = contractRepository;
        this.attachmentRepository = attachmentRepository;
        this.eventRepository = eventRepository;
        this.summaryRepository = summaryRepository;
        this.partyRepository = partyRepository;
        this.paymentDetailRepository = paymentDetailRepository;
        this.riskAssessmentRepository = riskAssessmentRepository;
        this.complianceStatusRepository = complianceStatusRepository;
        this.keyTermRepository = keyTermRepository;
        this.favorableClauseRepository = favorableClauseRepository;
        this.unfavorableClauseRepository = unfavorableClauseRepository;
        this.terminationConditionRepository = terminationConditionRepository;
        this.eventPublisher = eventPublisher;
        this.contractStatusEventPublisher = contractStatusEventPublisher;
        this.objectMapper = objectMapper;
        this.validationService = validationService;
    }

    /**
     * Hàm tiện ích để lấy contract hoặc ném ResourceNotFoundException
     */
    private Contract getContractOrThrow(String id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hợp đồng với ID: " + id));
    }

    @Transactional
    public Contract createContract(Contract contract) {
        // Validate contract data
        ContractDetailDto contractDto = convertToContractDetailDto(contract);
        validationService.validateContractCreation(contractDto);
        
        contract.setContractNumber("CONTRACT-" + System.currentTimeMillis());
        contract.setStatus(Contract.ContractStatus.DRAFT);

        Contract savedContract = contractRepository.save(contract);

        ContractEvent event = new ContractEvent();
        event.setContractId(savedContract.getId());
        event.setEventType("CREATE");
        event.setEventData("{\"message\": \"Tạo hợp đồng mới\"}");
        event.setUserId("system");

        eventRepository.save(event);
        eventPublisher.publishEvent(new ContractEventPayload(savedContract, "created"));
        contractStatusEventPublisher.publishContractCreated(savedContract, "system", "system", "system");
        return savedContract;
    }

    public Optional<Contract> getContract(String id) {
        return contractRepository.findById(id);
    }

    public Page<ContractWithSummaryDto> getAllContracts(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, boolean includeDeleted) {
        List<Sort.Order> orders = new ArrayList<>();
        if (sortBy != null && !sortBy.isEmpty()) {
            for (int i = 0; i < sortBy.size(); i++) {
                String property = sortBy.get(i);
                if (!VALID_SORT_BY_PROPERTIES.contains(property)) {
                    throw new InvalidInputException("Thuộc tính sắp xếp không hợp lệ: " + property);
                }
                Sort.Direction direction = (sortDirection != null && i < sortDirection.size())
                        ? Sort.Direction.fromString(sortDirection.get(i))
                        : Sort.Direction.ASC;
                orders.add(new Sort.Order(direction, property));
            }
        }

        Sort sort = Sort.by(orders);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        Page<Contract> contractsPage;
        if (includeDeleted) {
            contractsPage = contractRepository.findAll(pageable);
        } else {
            contractsPage = contractRepository.findByIsDeletedFalse(pageable);
        }

        // Chuyển đổi thành ContractWithSummaryDto
        List<ContractWithSummaryDto> contractsWithSummary = contractsPage.getContent().stream()
                .map(this::convertToContractWithSummaryDto)
                .collect(Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(
                contractsWithSummary,
                contractsPage.getPageable(),
                contractsPage.getTotalElements()
        );
    }

    public List<Contract> getActiveContracts() {
        return contractRepository.findByIsDeletedFalse();
    }

    public List<Contract> getContractsByStatus(String status) {
        try {
            Contract.ContractStatus contractStatus = Contract.ContractStatus.valueOf(status.toUpperCase());
            return contractRepository.findByStatusAndIsDeletedFalse(contractStatus);
        } catch (IllegalArgumentException e) {
            throw new InvalidInputException("Trạng thái hợp đồng không hợp lệ: " + status);
        }
    }

    @Transactional
    public Contract updateContract(String id, Contract updatedContract) {
        Contract existingContract = getContractOrThrow(id);

        if (existingContract.getIsDeleted()) {
            throw new ConflictException("Không thể cập nhật hợp đồng đã bị xóa");
        }

        // Validate status transition
        if (!existingContract.getStatus().equals(updatedContract.getStatus())) {
            validationService.validateStatusTransition(existingContract.getStatus().name(), updatedContract.getStatus().name());
        }

        // Validate updated contract data
        ContractDetailDto contractDto = convertToContractDetailDto(updatedContract);
        validationService.validateContractUpdate(id, contractDto);

        existingContract.setTitle(updatedContract.getTitle());
        existingContract.setStatus(updatedContract.getStatus());
        existingContract.setPartiesJson(updatedContract.getPartiesJson());
        existingContract.setStartDate(updatedContract.getStartDate());
        existingContract.setEndDate(updatedContract.getEndDate());
        existingContract.setSystemId(updatedContract.getSystemId());

        Contract savedContract = contractRepository.save(existingContract);

        ContractEvent event = new ContractEvent();
        event.setContractId(savedContract.getId());
        event.setEventType("UPDATE");
        event.setEventData("{\"message\": \"Cập nhật hợp đồng\"}");
        event.setUserId("system");
        eventRepository.save(event);

        eventPublisher.publishEvent(new ContractEventPayload(savedContract, "updated"));
        return savedContract;
    }

    @Transactional
    public void softDeleteContract(String id) {
        Contract contract = getContractOrThrow(id);

        if (contract.getIsDeleted()) {
            throw new ConflictException("Hợp đồng đã bị xóa trước đó");
        }

        // Validate contract for deletion
        validationService.validateContractDeletion(contract);

        contract.markAsDeleted("system");
        contract.setStatus(Contract.ContractStatus.EXPIRED);
        contractRepository.save(contract);

        ContractEvent event = new ContractEvent();
        event.setContractId(contract.getId());
        event.setEventType("SOFT_DELETE");
        event.setEventData("{\"message\": \"Xóa mềm hợp đồng\"}");
        event.setUserId("system");
        eventRepository.save(event);

        eventPublisher.publishEvent(new ContractEventPayload(contract, "soft_deleted"));
    }

    @Transactional
    public void restoreContract(String id) {
        Contract contract = getContractOrThrow(id);

        if (!contract.getIsDeleted()) {
            throw new ConflictException("Hợp đồng chưa bị xóa");
        }

        contract.restore();
        contract.setStatus(Contract.ContractStatus.DRAFT);
        contractRepository.save(contract);

        ContractEvent event = new ContractEvent();
        event.setContractId(contract.getId());
        event.setEventType("RESTORE");
        event.setEventData("{\"message\": \"Khôi phục hợp đồng\"}");
        event.setUserId("system");
        eventRepository.save(event);

        eventPublisher.publishEvent(new ContractEventPayload(contract, "restored"));
    }

    @Transactional
    public ContractAttachment addAttachment(String contractId, ContractAttachment attachment) {
        Contract contract = getContractOrThrow(contractId);

        if (contract.getIsDeleted()) {
            throw new ConflictException("Không thể thêm file đính kèm cho hợp đồng đã bị xóa");
        }

        attachment.setContractId(contractId);
        ContractAttachment savedAttachment = attachmentRepository.save(attachment);

        ContractEvent event = new ContractEvent();
        event.setContractId(contractId);
        event.setEventType("ATTACHMENT_ADD");
        event.setEventData("{\"file_name\": \"" + savedAttachment.getFileName() + "\"}");
        event.setUserId("system");
        eventRepository.save(event);

        return savedAttachment;
    }

    public List<ContractAttachment> getAttachments(String contractId) {
        getContractOrThrow(contractId);
        List<ContractAttachment> attachments = attachmentRepository.findByContractId(contractId);
        if (attachments.isEmpty()) {
            throw new NoContentException("Không tìm thấy file đính kèm nào cho hợp đồng này.");
        }
        return attachments;
    }

    public List<ContractEvent> getContractEvents(String contractId) {
        return eventRepository.findByContractIdOrderByTimestampDesc(contractId);
    }

    /**
     * Lấy tất cả contracts cơ bản (không có summary) - giữ lại để tương thích
     */
    public Page<Contract> getAllContractsBasic(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, boolean includeDeleted) {
        List<Sort.Order> orders = new ArrayList<>();
        if (sortBy != null && !sortBy.isEmpty()) {
            for (int i = 0; i < sortBy.size(); i++) {
                String property = sortBy.get(i);
                if (!VALID_SORT_BY_PROPERTIES.contains(property)) {
                    throw new InvalidInputException("Thuộc tính sắp xếp không hợp lệ: " + property);
                }
                Sort.Direction direction = (sortDirection != null && i < sortDirection.size())
                        ? Sort.Direction.fromString(sortDirection.get(i))
                        : Sort.Direction.ASC;
                orders.add(new Sort.Order(direction, property));
            }
        }

        Sort sort = Sort.by(orders);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

        if (includeDeleted) {
            return contractRepository.findAll(pageable);
        } else {
            return contractRepository.findByIsDeletedFalse(pageable);
        }
    }

    /**
     * Lấy tất cả contracts với summary information (API chính)
     */
    public Page<ContractWithSummaryDto> getAllContractsWithSummary(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, boolean includeDeleted) {
        Page<Contract> contractsPage = getAllContractsBasic(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        List<ContractWithSummaryDto> contractsWithSummary = contractsPage.getContent().stream()
                .map(this::convertToContractWithSummaryDto)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
                contractsWithSummary,
                contractsPage.getPageable(),
                contractsPage.getTotalElements()
        );
    }

    /**
     * Lấy contract với summary theo ID
     */
    public ContractWithSummaryDto getContractWithSummary(String id) {
        Contract contract = getContractOrThrow(id);
        return convertToContractWithSummaryDto(contract);
    }

    /**
     * Chuyển đổi Contract entity thành ContractWithSummaryDto
     */
    private ContractWithSummaryDto convertToContractWithSummaryDto(Contract contract) {
        Optional<ContractSummary> summaryOpt = summaryRepository.findByContractId(contract.getId());
        List<ContractSummaryDto> summaryDtos = new ArrayList<>();
        if (summaryOpt.isPresent()) {
            summaryDtos.add(convertToContractSummaryDto(summaryOpt.get()));
        }

        return ContractWithSummaryDto.builder()
                .id(contract.getId())
                .contractNumber(contract.getContractNumber())
                .title(contract.getTitle())
                .status(contract.getStatus().name())
                .partiesJson(contract.getPartiesJson())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .systemId(contract.getSystemId())
                .summary(contract.getSummary())
                .contractType(contract.getContractType())
                .riskLevel(contract.getRiskLevel())
                .keyTerms(contract.getKeyTerms())
                .aiProcessed(contract.getAiProcessed())
                .processingStatus(contract.getProcessingStatus() != null ? contract.getProcessingStatus().name() : null)
                .createdAt(contract.getCreatedAt())
                .createdBy(contract.getCreatedBy())
                .deletedAt(contract.getDeletedAt())
                .deletedBy(contract.getDeletedBy())
                .isDeleted(contract.getIsDeleted())
                .version(contract.getVersion())
                .summaries(summaryDtos)
                .build();
    }

    /**
     * Chuyển đổi ContractSummary entity thành ContractSummaryDto
     */
    private ContractSummaryDto convertToContractSummaryDto(ContractSummary summary) {
        List<String> keyPoints = new ArrayList<>();
        List<String> riskAssessment = new ArrayList<>();
        
        try {
            if (summary.getKeyPoints() != null) {
                keyPoints = objectMapper.readValue(summary.getKeyPoints(), new TypeReference<List<String>>() {});
            }
            if (summary.getRiskAssessment() != null) {
                riskAssessment = objectMapper.readValue(summary.getRiskAssessment(), new TypeReference<List<String>>() {});
            }
        } catch (Exception e) {
            // Log error but continue with empty lists
        }

        return ContractSummaryDto.builder()
                .id(summary.getId())
                .contractId(summary.getContractId())
                .summary(summary.getSummaryText())
                .keyPoints(keyPoints)
                .categories(riskAssessment)
                .createdAt(summary.getCreatedAt())
                .updatedAt(summary.getUpdatedAt())
                .build();
    }

    /**
     * Tạo hoặc cập nhật contract summary từ AI processing
     */
    @Transactional
    public ContractSummary createOrUpdateContractSummary(String contractId, String fileId, String filename, 
                                                       String summary, Integer summaryLength, List<String> keyPoints,
                                                       String extractionMethod, java.math.BigDecimal confidence,
                                                       String classification, java.math.BigDecimal classificationConfidence,
                                                       List<String> categories) {
        
        Optional<ContractSummary> existingSummary = summaryRepository.findByContractId(contractId);
        ContractSummary contractSummary;
        
        if (existingSummary.isPresent()) {
            contractSummary = existingSummary.get();
        } else {
            contractSummary = new ContractSummary();
            contractSummary.setContractId(contractId);
        }
        
        contractSummary.setSummaryText(summary);
        try {
            contractSummary.setKeyPoints(objectMapper.writeValueAsString(keyPoints));
            contractSummary.setRiskAssessment(objectMapper.writeValueAsString(categories));
            contractSummary.setRecommendations(objectMapper.writeValueAsString(categories));
        } catch (Exception e) {
            logger.error("Error serializing data for contract summary: {}", e.getMessage());
            // Fallback to empty strings if serialization fails
            contractSummary.setKeyPoints("[]");
            contractSummary.setRiskAssessment("[]");
            contractSummary.setRecommendations("[]");
        }
        
        return summaryRepository.save(contractSummary);
    }

    /**
     * Lấy tất cả contracts với thông tin chi tiết đầy đủ
     */
    public Page<ContractDetailDto> getAllContractsWithDetails(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, boolean includeDeleted) {
        Page<Contract> contractsPage = getAllContractsBasic(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        List<ContractDetailDto> contractsWithDetails = contractsPage.getContent().stream()
                .map(this::convertToContractDetailDto)
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
                contractsWithDetails,
                contractsPage.getPageable(),
                contractsPage.getTotalElements()
        );
    }

    /**
     * Lấy contract với thông tin chi tiết đầy đủ theo ID
     */
    public ContractDetailDto getContractWithDetails(String id) {
        Contract contract = getContractOrThrow(id);
        return convertToContractDetailDto(contract);
    }

    /**
     * Chuyển đổi Contract entity thành ContractDetailDto
     */
    private ContractDetailDto convertToContractDetailDto(Contract contract) {
        // Lấy summaries
        Optional<ContractSummary> summaryOpt = summaryRepository.findByContractId(contract.getId());
        List<ContractSummaryDto> summaryDtos = new ArrayList<>();
        if (summaryOpt.isPresent()) {
            summaryDtos.add(convertToContractSummaryDto(summaryOpt.get()));
        }

        // Lấy parties
        List<ContractParty> parties = partyRepository.findByContractId(contract.getId());
        List<ContractPartyDto> partyDtos = parties.stream()
                .map(this::convertToContractPartyDto)
                .collect(Collectors.toList());

        return ContractDetailDto.builder()
                .id(contract.getId())
                .contractNumber(contract.getContractNumber())
                .title(contract.getTitle())
                .status(contract.getStatus().name())
                .partiesJson(contract.getPartiesJson())
                .startDate(contract.getStartDate())
                .endDate(contract.getEndDate())
                .systemId(contract.getSystemId())
                .summary(contract.getSummary())
                .contractType(contract.getContractType())
                .riskLevel(contract.getRiskLevel())
                .keyTerms(contract.getKeyTerms())
                .aiProcessed(contract.getAiProcessed())
                .processingStatus(contract.getProcessingStatus() != null ? contract.getProcessingStatus().name() : null)
                .createdAt(contract.getCreatedAt())
                .createdBy(contract.getCreatedBy())
                .deletedAt(contract.getDeletedAt())
                .deletedBy(contract.getDeletedBy())
                .isDeleted(contract.getIsDeleted())
                .version(contract.getVersion())
                // New fields from updated schema
                .contractObject(contract.getContractObject())
                .effectiveDate(contract.getEffectiveDate())
                .contractTerm(contract.getContractTerm())
                .totalValue(contract.getTotalValue())
                .paymentSchedule(contract.getPaymentSchedule())
                .currency(contract.getCurrency())
                .terminationConditions(contract.getTerminationConditions())
                .riskAssessment(contract.getRiskAssessment())
                .complianceStatus(contract.getComplianceStatus())
                .legalReviewRequired(contract.getLegalReviewRequired())
                .reviewDeadline(contract.getReviewDeadline())
                // Related data
                .summaries(summaryDtos)
                .parties(partyDtos)
                .build();
    }

    /**
     * Chuyển đổi ContractParty entity thành ContractPartyDto
     */
    private ContractPartyDto convertToContractPartyDto(ContractParty party) {
        return ContractPartyDto.builder()
                .id(party.getId())
                .contractId(party.getContractId())
                .partyName(party.getPartyName())
                .partyRole(party.getPartyType())
                .representative(party.getContactPerson())
                .taxCode(party.getTaxCode())
                .contact(party.getPhone())
                .address(party.getAddress())
                .createdAt(party.getCreatedAt())
                .updatedAt(party.getUpdatedAt())
                .build();
    }

    /**
     * Tạo hoặc cập nhật contract party
     */
    @Transactional
    public ContractParty createOrUpdateContractParty(String contractId, String name, String role, 
                                                   String representative, String taxCode, String contact) {
        ContractParty party = new ContractParty();
        party.setContractId(contractId);
        party.setPartyName(name);
        party.setPartyType(role);
        party.setContactPerson(representative);
        party.setTaxCode(taxCode);
        party.setPhone(contact);
        party.setAddress("");
        
        return partyRepository.save(party);
    }

    /**
     * Tạo hoặc cập nhật contract clause
     */
    @Transactional
    public void createOrUpdateContractClause(String contractId, String name, String description, 
                                           String source, String clauseType) {
        // Note: This would require a ContractClause entity and repository
        // For now, we'll store this information in the contract's keyTerms field
        Contract contract = getContractOrThrow(contractId);
        String currentKeyTerms = contract.getKeyTerms();
        
        String newClause = String.format("Type: %s, Name: %s, Description: %s, Source: %s", 
                                       clauseType, name, description, source);
        
        if (currentKeyTerms == null || currentKeyTerms.isEmpty()) {
            contract.setKeyTerms(newClause);
        } else {
            contract.setKeyTerms(currentKeyTerms + "; " + newClause);
        }
        
        contractRepository.save(contract);
    }

    /**
     * Tạo hoặc cập nhật contract payment details
     */
    @Transactional
    public void createOrUpdateContractPayment(String contractId, String totalValue, 
                                            String schedule, String currency) {
        Contract contract = getContractOrThrow(contractId);
        contract.setTotalValue(totalValue);
        contract.setPaymentSchedule(schedule);
        contract.setCurrency(currency);
        
        contractRepository.save(contract);
    }

    /**
     * Cập nhật contract details
     */
    @Transactional
    public void updateContractDetails(String contractId, String contractObject, String effectiveDate, 
                                    String contractTerm, String terminationConditions) {
        Contract contract = getContractOrThrow(contractId);
        contract.setContractObject(contractObject);
        contract.setEffectiveDate(effectiveDate);
        contract.setContractTerm(contractTerm);
        contract.setTerminationConditions(terminationConditions);
        
        contractRepository.save(contract);
    }

    /**
     * Tạo hoặc cập nhật contract file từ AI event
     */
    @Transactional
    public void createOrUpdateContractFile(String contractId, String fileId, String filename, 
                                         String fileType, String fileKey, String bucket, String summary, 
                                         Integer summaryLength, List<String> keyPoints, String extractionMethod, 
                                         java.math.BigDecimal confidence, String classification, 
                                         java.math.BigDecimal classificationConfidence, List<String> categories) {
        // Note: This would require a ContractFile entity and repository
        // For now, we'll store this information in the contract's systemId field
        Contract contract = getContractOrThrow(contractId);
        contract.setSystemId(fileId);
        
        // Có thể lưu thêm thông tin file vào các trường khác nếu cần
        if (contract.getSummary() == null || contract.getSummary().isEmpty()) {
            contract.setSummary(summary);
        }
        
        contractRepository.save(contract);
        
        logger.info("✅ Saved contract file info for contract ID: {} and file: {}", contractId, filename);
    }

    /**
     * Lấy contract với response format mới nhất quán
     */
    public ContractResponseDto getContractWithNewFormat(String id) {
        Contract contract = getContractOrThrow(id);
        Optional<ContractSummary> summaryOpt = summaryRepository.findByContractId(contract.getId());
        List<ContractSummary> summaries = new ArrayList<>();
        if (summaryOpt.isPresent()) {
            summaries.add(summaryOpt.get());
        }
        List<ContractParty> parties = partyRepository.findByContractId(contract.getId());
        
        return ContractResponseDto.fromContract(contract, summaries, parties);
    }

    /**
     * Lấy tất cả contracts với response format mới nhất quán
     */
    public Page<ContractResponseDto> getAllContractsWithNewFormat(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, boolean includeDeleted) {
        Page<Contract> contractsPage = getAllContractsBasic(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        List<ContractResponseDto> contractsWithNewFormat = contractsPage.getContent().stream()
                .map(contract -> {
                    Optional<ContractSummary> summaryOpt = summaryRepository.findByContractId(contract.getId());
                    List<ContractSummary> summaries = new ArrayList<>();
                    if (summaryOpt.isPresent()) {
                        summaries.add(summaryOpt.get());
                    }
                    List<ContractParty> parties = partyRepository.findByContractId(contract.getId());
                    return ContractResponseDto.fromContract(contract, summaries, parties);
                })
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
                contractsWithNewFormat,
                contractsPage.getPageable(),
                contractsPage.getTotalElements()
        );
    }

    /**
     * Lấy contract với format mới theo cấu trúc response mới
     */
    public ContractDetailResponseDto getContractWithDetailFormat(String id) {
        Contract contract = getContractOrThrow(id);
        List<ContractParty> parties = partyRepository.findByContractId(contract.getId());
        
        return ContractDetailResponseDto.fromContract(contract, parties);
    }

    /**
     * Lấy tất cả contracts với format mới theo cấu trúc response mới
     */
    public Page<ContractDetailResponseDto> getAllContractsWithDetailFormat(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, boolean includeDeleted) {
        Page<Contract> contractsPage = getAllContractsBasic(pageNumber, pageSize, sortBy, sortDirection, includeDeleted);
        
        List<ContractDetailResponseDto> contractsWithDetailFormat = contractsPage.getContent().stream()
                .map(contract -> {
                    List<ContractParty> parties = partyRepository.findByContractId(contract.getId());
                    return ContractDetailResponseDto.fromContract(contract, parties);
                })
                .collect(Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(
                contractsWithDetailFormat,
                contractsPage.getPageable(),
                contractsPage.getTotalElements()
        );
    }
}