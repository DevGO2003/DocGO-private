package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractEventRepository extends JpaRepository<ContractEvent, Long> {
    List<ContractEvent> findByContractIdOrderByEventTimeDesc(Long contractId);
}