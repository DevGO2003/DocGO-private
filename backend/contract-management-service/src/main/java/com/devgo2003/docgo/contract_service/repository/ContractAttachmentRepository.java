package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.ContractAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContractAttachmentRepository extends JpaRepository<ContractAttachment, Long> {
    List<ContractAttachment> findByContractIdAndIsDeletedFalse(Long contractId);
}