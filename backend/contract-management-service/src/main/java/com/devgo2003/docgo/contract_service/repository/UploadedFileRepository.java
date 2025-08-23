package com.devgo2003.docgo.contract_service.repository;

import com.devgo2003.docgo.contract_service.entity.UploadedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UploadedFileRepository extends JpaRepository<UploadedFile, Long> {
    
    List<UploadedFile> findByContractId(Long contractId);
    
    List<UploadedFile> findByProcessingStatus(UploadedFile.ProcessingStatus status);
    
    List<UploadedFile> findByIsContract(Boolean isContract);
}
