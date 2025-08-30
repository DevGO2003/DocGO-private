package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractRiskAssessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRiskAssessmentRepository extends JpaRepository<ContractRiskAssessment, Long> {
    
    List<ContractRiskAssessment> findByContractId(Long contractId);
    
    Optional<ContractRiskAssessment> findByContractIdAndId(Long contractId, Long id);
    
    void deleteByContractId(Long contractId);
}
