package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractRiskAssessment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContractRiskAssessmentRepository extends MongoRepository<ContractRiskAssessment, String> {
    Optional<ContractRiskAssessment> findByContractId(String contractId);
}
