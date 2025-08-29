package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractSummary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractSummaryRepository extends JpaRepository<ContractSummary, Long> {

    /**
     * Tìm tất cả summary theo contract ID
     */
    List<ContractSummary> findByContractId(Long contractId);

    /**
     * Tìm summary theo file ID
     */
    Optional<ContractSummary> findByFileId(String fileId);

    /**
     * Tìm summary theo contract ID và file ID
     */
    Optional<ContractSummary> findByContractIdAndFileId(Long contractId, String fileId);

    /**
     * Kiểm tra xem có summary nào cho contract này không
     */
    boolean existsByContractId(Long contractId);

    /**
     * Xóa tất cả summary theo contract ID
     */
    void deleteByContractId(Long contractId);

    /**
     * Tìm summary với thông tin contract (JOIN)
     */
    @Query("SELECT cs FROM ContractSummary cs WHERE cs.contractId = :contractId")
    List<ContractSummary> findSummariesWithContract(@Param("contractId") Long contractId);
}
