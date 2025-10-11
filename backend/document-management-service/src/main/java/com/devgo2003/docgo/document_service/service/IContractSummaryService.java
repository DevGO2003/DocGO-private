package com.devgo2003.docgo.document_service.service;

import com.devgo2003.docgo.document_service.dto.ContractSummaryCreateRequest;
import com.devgo2003.docgo.document_service.dto.ContractSummaryResponseDto;
import com.devgo2003.docgo.document_service.entity.ContractSummary;

import java.util.List;
import java.util.Optional;

/**
 * Interface cho ContractSummaryService
 * Cung cấp các method xử lý contract summary
 */
public interface IContractSummaryService {

    /**
     * Lấy contract summary theo contract ID
     * @param contractId ID của contract
     * @return Optional ContractSummaryResponseDto
     */
    Optional<ContractSummaryResponseDto> getContractSummary(String contractId);

    /**
     * Tạo contract summary mới
     * @param request ContractSummaryCreateRequest
     * @return ContractSummaryResponseDto
     */
    ContractSummaryResponseDto createContractSummary(ContractSummaryCreateRequest request);

    /**
     * Cập nhật contract summary
     * @param contractId ID của contract
     * @param request ContractSummaryCreateRequest
     * @return ContractSummaryResponseDto
     */
    ContractSummaryResponseDto updateContractSummary(String contractId, ContractSummaryCreateRequest request);

    /**
     * Xóa contract summary (soft delete)
     * @param contractId ID của contract
     */
    void deleteContractSummary(String contractId);

    /**
     * Regenerate contract summary bằng AI
     * @param contractId ID của contract
     * @return ContractSummaryResponseDto
     */
    ContractSummaryResponseDto regenerateContractSummary(String contractId);

    /**
     * Lấy tất cả contract summaries theo trạng thái
     * @param status Trạng thái contract
     * @return List ContractSummaryResponseDto
     */
    List<ContractSummaryResponseDto> getContractSummariesByStatus(String status);

    /**
     * Lấy tất cả contract summaries theo loại contract
     * @param contractType Loại contract
     * @return List ContractSummaryResponseDto
     */
    List<ContractSummaryResponseDto> getContractSummariesByType(String contractType);

    /**
     * Lấy tất cả contract summaries đã được AI xử lý
     * @param aiProcessed Trạng thái AI processing
     * @return List ContractSummaryResponseDto
     */
    List<ContractSummaryResponseDto> getContractSummariesByAiProcessed(Boolean aiProcessed);

    /**
     * Kiểm tra contract summary có tồn tại không
     * @param contractId ID của contract
     * @return true nếu tồn tại, false nếu không
     */
    boolean existsByContractId(String contractId);

    /**
     * Đếm số lượng contract summaries theo trạng thái
     * @param status Trạng thái contract
     * @return Số lượng
     */
    long countByStatus(String status);

    /**
     * Đếm số lượng contract summaries theo loại contract
     * @param contractType Loại contract
     * @return Số lượng
     */
    long countByContractType(String contractType);
}
