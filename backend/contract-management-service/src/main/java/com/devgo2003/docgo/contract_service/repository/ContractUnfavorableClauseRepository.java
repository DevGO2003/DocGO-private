package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractUnfavorableClause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractUnfavorableClauseRepository extends JpaRepository<ContractUnfavorableClause, Long> {
    List<ContractUnfavorableClause> findByContractId(Long contractId);
}
