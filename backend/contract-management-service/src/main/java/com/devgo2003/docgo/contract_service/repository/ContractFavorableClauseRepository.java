package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractFavorableClause;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractFavorableClauseRepository extends JpaRepository<ContractFavorableClause, Long> {
    List<ContractFavorableClause> findByContractId(Long contractId);
}
