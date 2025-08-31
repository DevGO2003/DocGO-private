package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.Contract;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByIsDeletedFalse();

    Page<Contract> findByIsDeletedFalse(Pageable pageable);

    List<Contract> findByStatusAndIsDeletedFalse(Contract.ContractStatus status);
    
    Optional<Contract> findBySystemId(String systemId);
    
    // Validation methods
    boolean existsByContractNumber(String contractNumber);
    
    boolean existsByContractNumberAndIdNot(String contractNumber, Long id);
}
