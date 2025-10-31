package com.devgo2003.docgo.repository_service.service.file.impl;

import com.devgo2003.docgo.repository_service.dto.FileUpdateRequestDto;
import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.service.file.IFileDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileDetailServiceImpl implements IFileDetailService {
    
    private final FileRepository fileRepository;
    
    @Override
    public FileEntity updateFileDetails(String fileId, FileUpdateRequestDto updateRequest) {
        log.info("Updating file details for fileId: {}", fileId);
        
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));
        
        // Update overview fields
        if (updateRequest.getTitle() != null) {
            file.setName(updateRequest.getTitle());
        }
        
        if (updateRequest.getArchiveSerial() != null) {
            file.setArchiveSerial(updateRequest.getArchiveSerial());
        }
        
        if (updateRequest.getDateCreated() != null) {
            file.setDateCreated(updateRequest.getDateCreated());
        }
        
        if (updateRequest.getCorrespondentId() != null) {
            file.setCorrespondentId(updateRequest.getCorrespondentId());
        }
        
        if (updateRequest.getDocumentType() != null) {
            file.setDocumentType(updateRequest.getDocumentType());
        }
        
        if (updateRequest.getStoragePath() != null) {
            file.setStoragePath(updateRequest.getStoragePath());
        }
        
        if (updateRequest.getTags() != null) {
            file.setTags(updateRequest.getTags());
        }
        
        if (updateRequest.getDescription() != null) {
            file.setDescription(updateRequest.getDescription());
        }
        
        if (updateRequest.getStatus() != null) {
            file.setStatus(updateRequest.getStatus());
        }
        
        // Update audit fields
        file.setUpdatedAt(Instant.now().toString());
        
        return fileRepository.save(file);
    }
    
    @Override
    public String incrementArchiveSerial(String fileId) {
        log.info("Incrementing archive serial for fileId: {}", fileId);
        
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));
        
        String currentSerial = file.getArchiveSerial();
        String newSerial;
        
        if (currentSerial == null || currentSerial.isEmpty()) {
            newSerial = "0000001";
        } else {
            try {
                int serialNumber = Integer.parseInt(currentSerial);
                newSerial = String.format("%07d", serialNumber + 1);
            } catch (NumberFormatException e) {
                log.warn("Invalid serial format: {}, resetting to 0000001", currentSerial);
                newSerial = "0000001";
            }
        }
        
        file.setArchiveSerial(newSerial);
        file.setUpdatedAt(Instant.now().toString());
        fileRepository.save(file);
        
        return newSerial;
    }
    
    @Override
    public void deleteFile(String fileId) {
        log.info("Soft deleting file: {}", fileId);
        
        FileEntity file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));
        
        file.setIsDeleted(true);
        file.setUpdatedAt(Instant.now().toString());
        fileRepository.save(file);
    }
}
