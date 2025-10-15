package com.devgo2003.docgo.file_service.service.impl;

import com.devgo2003.docgo.file_service.dto.ContractDetailDto;
import com.devgo2003.docgo.file_service.dto.ContractDetailResponseDto;
import com.devgo2003.docgo.file_service.dto.ContractResponseDto;
import com.devgo2003.docgo.file_service.dto.ContractWithSummaryDto;
import com.devgo2003.docgo.file_service.entity.Contract;
import com.devgo2003.docgo.file_service.repository.ContractRepository;
import com.devgo2003.docgo.file_service.service.IContractQueryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service implementation cho ContractQueryService
 * Xử lý các query và search cho contracts
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ContractQueryServiceImpl implements IContractQueryService {

    private final ContractRepository contractRepository;
    private final MongoTemplate mongoTemplate;

    @Override
    public Page<ContractWithSummaryDto> getAllContracts(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, boolean includeDeleted) {
        log.info("Getting all contracts with pagination - page: {}, size: {}, includeDeleted: {}", pageNumber, pageSize, includeDeleted);
        
        // Create sort object
        Sort sort = createSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Create query
        Query query = new Query();
        if (!includeDeleted) {
            query.addCriteria(Criteria.where("isDeleted").is(false));
        }
        
        // Execute query with pagination
        long total = mongoTemplate.count(query, Contract.class);
        List<Contract> contracts = mongoTemplate.find(query.with(pageable), Contract.class);
        
        // Convert to DTOs
        List<ContractWithSummaryDto> contractDtos = contracts.stream()
            .map(this::convertToContractWithSummaryDto)
            .collect(java.util.stream.Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(contractDtos, pageable, total);
    }

    @Override
    public Page<Contract> getAllContractsBasic(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted) {
        log.info("Getting all contracts basic with pagination - page: {}, size: {}, searchTerm: {}, includeDeleted: {}", pageNumber, pageSize, searchTerm, includeDeleted);
        
        // Create sort object
        Sort sort = createSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Create query
        Query query = new Query();
        if (!includeDeleted) {
            query.addCriteria(Criteria.where("isDeleted").is(false));
        }
        
        // Add search criteria
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                Criteria.where("title").regex(searchTerm, "i"),
                Criteria.where("contractNumber").regex(searchTerm, "i"),
                Criteria.where("summary").regex(searchTerm, "i")
            );
            query.addCriteria(searchCriteria);
        }
        
        // Execute query with pagination
        long total = mongoTemplate.count(query, Contract.class);
        List<Contract> contracts = mongoTemplate.find(query.with(pageable), Contract.class);
        
        return new org.springframework.data.domain.PageImpl<>(contracts, pageable, total);
    }

    @Override
    public Page<ContractWithSummaryDto> getAllContractsWithSummary(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted) {
        log.info("Getting all contracts with summary - page: {}, size: {}, searchTerm: {}, includeDeleted: {}", pageNumber, pageSize, searchTerm, includeDeleted);
        
        // Create sort object
        Sort sort = createSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Create query
        Query query = new Query();
        if (!includeDeleted) {
            query.addCriteria(Criteria.where("isDeleted").is(false));
        }
        
        // Add search criteria
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                Criteria.where("title").regex(searchTerm, "i"),
                Criteria.where("contractNumber").regex(searchTerm, "i"),
                Criteria.where("summary").regex(searchTerm, "i")
            );
            query.addCriteria(searchCriteria);
        }
        
        // Execute query with pagination
        long total = mongoTemplate.count(query, Contract.class);
        List<Contract> contracts = mongoTemplate.find(query.with(pageable), Contract.class);
        
        // Convert to DTOs
        List<ContractWithSummaryDto> contractDtos = contracts.stream()
            .map(this::convertToContractWithSummaryDto)
            .collect(java.util.stream.Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(contractDtos, pageable, total);
    }

    @Override
    public Page<ContractDetailDto> getAllContractsWithDetails(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted) {
        log.info("Getting all contracts with details - page: {}, size: {}, searchTerm: {}, includeDeleted: {}", pageNumber, pageSize, searchTerm, includeDeleted);
        
        // Create sort object
        Sort sort = createSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Create query
        Query query = new Query();
        if (!includeDeleted) {
            query.addCriteria(Criteria.where("isDeleted").is(false));
        }
        
        // Add search criteria
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                Criteria.where("title").regex(searchTerm, "i"),
                Criteria.where("contractNumber").regex(searchTerm, "i"),
                Criteria.where("summary").regex(searchTerm, "i")
            );
            query.addCriteria(searchCriteria);
        }
        
        // Execute query with pagination
        long total = mongoTemplate.count(query, Contract.class);
        List<Contract> contracts = mongoTemplate.find(query.with(pageable), Contract.class);
        
        // Convert to DTOs
        List<ContractDetailDto> contractDtos = contracts.stream()
            .map(this::convertToContractDetailDto)
            .collect(java.util.stream.Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(contractDtos, pageable, total);
    }

    @Override
    public Page<ContractResponseDto> getAllContractsWithNewFormat(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted) {
        log.info("Getting all contracts with new format - page: {}, size: {}, searchTerm: {}, includeDeleted: {}", pageNumber, pageSize, searchTerm, includeDeleted);
        
        // Create sort object
        Sort sort = createSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Create query
        Query query = new Query();
        if (!includeDeleted) {
            query.addCriteria(Criteria.where("isDeleted").is(false));
        }
        
        // Add search criteria
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                Criteria.where("title").regex(searchTerm, "i"),
                Criteria.where("contractNumber").regex(searchTerm, "i"),
                Criteria.where("summary").regex(searchTerm, "i")
            );
            query.addCriteria(searchCriteria);
        }
        
        // Execute query with pagination
        long total = mongoTemplate.count(query, Contract.class);
        List<Contract> contracts = mongoTemplate.find(query.with(pageable), Contract.class);
        
        // Convert to DTOs
        List<ContractResponseDto> contractDtos = contracts.stream()
            .map(this::convertToContractResponseDto)
            .collect(java.util.stream.Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(contractDtos, pageable, total);
    }

    @Override
    public Page<ContractDetailResponseDto> getAllContractsWithDetailFormat(int pageNumber, int pageSize, List<String> sortBy, List<String> sortDirection, String searchTerm, boolean includeDeleted) {
        log.info("Getting all contracts with detail format - page: {}, size: {}, searchTerm: {}, includeDeleted: {}", pageNumber, pageSize, searchTerm, includeDeleted);
        
        // Create sort object
        Sort sort = createSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        // Create query
        Query query = new Query();
        if (!includeDeleted) {
            query.addCriteria(Criteria.where("isDeleted").is(false));
        }
        
        // Add search criteria
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            Criteria searchCriteria = new Criteria().orOperator(
                Criteria.where("title").regex(searchTerm, "i"),
                Criteria.where("contractNumber").regex(searchTerm, "i"),
                Criteria.where("summary").regex(searchTerm, "i")
            );
            query.addCriteria(searchCriteria);
        }
        
        // Execute query with pagination
        long total = mongoTemplate.count(query, Contract.class);
        List<Contract> contracts = mongoTemplate.find(query.with(pageable), Contract.class);
        
        // Convert to DTOs
        List<ContractDetailResponseDto> contractDtos = contracts.stream()
            .map(this::convertToContractDetailResponseDto)
            .collect(java.util.stream.Collectors.toList());
        
        return new org.springframework.data.domain.PageImpl<>(contractDtos, pageable, total);
    }

    @Override
    public List<Contract> getContractsByStatus(String status) {
        log.info("Getting contracts by status: {}", status);
        
        Query query = new Query();
        query.addCriteria(Criteria.where("status").is(status));
        query.addCriteria(Criteria.where("isDeleted").is(false));
        
        return mongoTemplate.find(query, Contract.class);
    }

    @Override
    public List<Contract> getActiveContracts() {
        log.info("Getting active contracts");
        
        Query query = new Query();
        query.addCriteria(Criteria.where("status").in("ACTIVE", "PENDING_REVIEW", "IN_PROGRESS"));
        query.addCriteria(Criteria.where("isDeleted").is(false));
        
        return mongoTemplate.find(query, Contract.class);
    }

    @Override
    public ContractWithSummaryDto getContractWithSummary(String id) {
        log.info("Getting contract with summary for id: {}", id);
        
        Optional<Contract> contract = contractRepository.findById(id);
        if (contract.isPresent()) {
            return convertToContractWithSummaryDto(contract.get());
        }
        return null;
    }

    @Override
    public ContractDetailDto getContractWithDetails(String id) {
        log.info("Getting contract with details for id: {}", id);
        
        Optional<Contract> contract = contractRepository.findById(id);
        if (contract.isPresent()) {
            return convertToContractDetailDto(contract.get());
        }
        return null;
    }

    @Override
    public ContractResponseDto getContractWithNewFormat(String id) {
        log.info("Getting contract with new format for id: {}", id);
        
        Optional<Contract> contract = contractRepository.findById(id);
        if (contract.isPresent()) {
            return convertToContractResponseDto(contract.get());
        }
        return null;
    }

    @Override
    public ContractDetailResponseDto getContractWithDetailFormat(String id) {
        log.info("Getting contract with detail format for id: {}", id);
        
        Optional<Contract> contract = contractRepository.findById(id);
        if (contract.isPresent()) {
            return convertToContractDetailResponseDto(contract.get());
        }
        return null;
    }

    @Override
    public boolean existsByContractNumber(String contractNumber) {
        return contractRepository.existsByContractNumber(contractNumber);
    }

    @Override
    public boolean existsBySystemId(String systemId) {
        return contractRepository.existsBySystemId(systemId);
    }

    // Helper methods
    private Sort createSort(List<String> sortBy, List<String> sortDirection) {
        if (sortBy == null || sortBy.isEmpty()) {
            return Sort.by(Sort.Direction.DESC, "createdAt");
        }
        
        Sort.Direction direction = Sort.Direction.DESC;
        if (sortDirection != null && !sortDirection.isEmpty() && "ASC".equalsIgnoreCase(sortDirection.get(0))) {
            direction = Sort.Direction.ASC;
        }
        
        return Sort.by(direction, sortBy.get(0));
    }

    private ContractWithSummaryDto convertToContractWithSummaryDto(Contract contract) {
        // TODO: Implement conversion logic
        return ContractWithSummaryDto.builder()
            .id(contract.getId())
            .contractNumber(contract.getContractNumber())
            .title(contract.getTitle())
            .status(contract.getStatus() != null ? contract.getStatus().name() : null)
            .contractType(contract.getContractType() != null ? contract.getContractType().name() : null)
            .build();
    }

    private ContractDetailDto convertToContractDetailDto(Contract contract) {
        // TODO: Implement conversion logic
        return ContractDetailDto.builder()
            .id(contract.getId())
            .contractNumber(contract.getContractNumber())
            .title(contract.getTitle())
            .status(contract.getStatus() != null ? contract.getStatus().name() : null)
            .contractType(contract.getContractType() != null ? contract.getContractType().name() : null)
            .build();
    }

    private ContractResponseDto convertToContractResponseDto(Contract contract) {
        // TODO: Implement conversion logic
        return ContractResponseDto.builder()
            .id(contract.getId())
            .contractNumber(contract.getContractNumber())
            .title(contract.getTitle())
            .status(contract.getStatus() != null ? contract.getStatus().name() : null)
            .contractType(contract.getContractType() != null ? contract.getContractType().name() : null)
            .build();
    }

    private ContractDetailResponseDto convertToContractDetailResponseDto(Contract contract) {
        // TODO: Implement conversion logic
        return ContractDetailResponseDto.builder()
            .id(contract.getId())
            .contractNumber(contract.getContractNumber())
            .title(contract.getTitle())
            .status(contract.getStatus() != null ? contract.getStatus().name() : null)
            .contractType(contract.getContractType() != null ? contract.getContractType().name() : null)
            .build();
    }
}
