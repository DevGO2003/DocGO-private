package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractParty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractPartyRepository extends JpaRepository<ContractParty, Long> {
    
    /**
     * Tìm tất cả parties theo contract ID
     */
    List<ContractParty> findByContractId(Long contractId);
    
    /**
     * Tìm parties theo contract ID và sắp xếp theo isPrimary
     */
    List<ContractParty> findByContractIdOrderByIsPrimaryDesc(Long contractId);
    
    /**
     * Tìm party chính của contract
     */
    List<ContractParty> findByContractIdAndIsPrimaryTrue(Long contractId);
    
    /**
     * Kiểm tra xem có party nào cho contract này không
     */
    boolean existsByContractId(Long contractId);
    
    /**
     * Xóa tất cả parties theo contract ID
     */
    void deleteByContractId(Long contractId);
}
