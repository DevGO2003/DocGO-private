package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractTerminationCondition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractTerminationConditionRepository extends JpaRepository<ContractTerminationCondition, Long> {
    Optional<ContractTerminationCondition> findByContractId(Long contractId);
}
