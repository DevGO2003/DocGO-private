package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractComplianceStatus;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractComplianceStatusRepository extends MongoRepository<ContractComplianceStatus, String> {
    Optional<ContractComplianceStatus> findByContractId(String contractId);
}
