package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractPaymentDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractPaymentDetailRepository extends JpaRepository<ContractPaymentDetail, Long> {
    
    List<ContractPaymentDetail> findByContractId(Long contractId);
    
    Optional<ContractPaymentDetail> findByContractIdAndId(Long contractId, Long id);
    
    void deleteByContractId(Long contractId);
}
