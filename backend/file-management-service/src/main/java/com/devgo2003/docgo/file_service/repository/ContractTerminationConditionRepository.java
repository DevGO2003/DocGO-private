package com.devgo2003.docgo.file_service.repository;

import com.devgo2003.docgo.file_service.entity.ContractTerminationCondition;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContractTerminationConditionRepository extends MongoRepository<ContractTerminationCondition, String> {
    List<ContractTerminationCondition> findByContractId(String contractId);
}
