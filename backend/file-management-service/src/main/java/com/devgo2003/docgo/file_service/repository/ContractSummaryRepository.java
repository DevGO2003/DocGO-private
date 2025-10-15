package com.devgo2003.docgo.file_service.repository;

import com.devgo2003.docgo.file_service.entity.ContractSummary;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho ContractSummary entity
 * Cung cấp các query cơ bản và custom queries
 */
@Repository
public interface ContractSummaryRepository extends MongoRepository<ContractSummary, String> {

    /**
     * Tìm contract summary theo contract ID
     * @param contractId ID của contract
     * @return Optional ContractSummary
     */
    @Query("{ 'contractId': ?0, 'isDeleted': false }")
    Optional<ContractSummary> findByContractId(String contractId);

    /**
     * Kiểm tra xem contract summary có tồn tại cho contract ID không
     * @param contractId ID của contract
     * @return true nếu tồn tại, false nếu không
     */
    @Query(value = "{ 'contractId': ?0, 'isDeleted': false }", exists = true)
    boolean existsByContractId(String contractId);

    /**
     * Tìm tất cả contract summaries theo trạng thái
     * @param status Trạng thái contract
     * @return List ContractSummary
     */
    @Query("{ 'status': ?0, 'isDeleted': false }")
    List<ContractSummary> findByStatus(String status);

    /**
     * Tìm tất cả contract summaries theo loại contract
     * @param contractType Loại contract
     * @return List ContractSummary
     */
    @Query("{ 'contractType': ?0, 'isDeleted': false }")
    List<ContractSummary> findByContractType(String contractType);

    /**
     * Tìm tất cả contract summaries đã được AI xử lý
     * @param aiProcessed Trạng thái AI processing
     * @return List ContractSummary
     */
    @Query("{ 'aiProcessed': ?0, 'isDeleted': false }")
    List<ContractSummary> findByAiProcessed(Boolean aiProcessed);

    /**
     * Tìm tất cả contract summaries theo processing status
     * @param processingStatus Trạng thái processing
     * @return List ContractSummary
     */
    @Query("{ 'processingStatus': ?0, 'isDeleted': false }")
    List<ContractSummary> findByProcessingStatus(ContractSummary.ProcessingStatus processingStatus);

    /**
     * Tìm contract summaries theo tags
     * @param tag Tag cần tìm
     * @return List ContractSummary
     */
    @Query("{ 'tags': { $in: [?0] }, 'isDeleted': false }")
    List<ContractSummary> findByTagsContaining(String tag);

    /**
     * Đếm số lượng contract summaries theo trạng thái
     * @param status Trạng thái contract
     * @return Số lượng
     */
    @Query(value = "{ 'status': ?0, 'isDeleted': false }", count = true)
    long countByStatus(String status);

    /**
     * Đếm số lượng contract summaries theo loại contract
     * @param contractType Loại contract
     * @return Số lượng
     */
    @Query(value = "{ 'contractType': ?0, 'isDeleted': false }", count = true)
    long countByContractType(String contractType);
}