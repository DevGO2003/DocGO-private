package com.devgo2003.docgo.file_service.listener;

import com.devgo2003.docgo.file_service.dto.FileMetadataRecordedEventDto;
import com.devgo2003.docgo.file_service.dto.FilePlaintextExtractedEventDto;
import com.devgo2003.docgo.file_service.dto.ContractSummaryGeneratedEventDto;
import com.devgo2003.docgo.file_service.entity.FileEntity;
import com.devgo2003.docgo.file_service.service.FileService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class UnifiedFileEventsListener {

    private static final Logger log = LoggerFactory.getLogger(UnifiedFileEventsListener.class);
    
    public UnifiedFileEventsListener() {
        log.info("UnifiedFileEventsListener initialized!");
    }
    
    @Autowired
    private FileService fileService;
    
    @KafkaListener(topics = "file.metadata.recorded", groupId = "repository-service-group")
    public void onFileMetadataRecorded(FileMetadataRecordedEventDto event) {
        log.info("Received file.metadata.recorded event for fileId: {}", event.getData().getFileId());
        
        try {
            FileEntity fileEntity = fileService.getFileById(event.getData().getFileId()).orElse(null);
            if (fileEntity == null) {
                // Create new file entity
                fileEntity = FileEntity.builder()
                    .id(event.getData().getFileId())
                    .name(event.getData().getName())
                    .mimeType(event.getData().getContentType())
                    .size(event.getData().getSize())
                    .ownerUserId(event.getData().getOwnerUserId())
                    .status("ACTIVE")
                    .documentType("CONTRACT")
                    .language("vi")
                    .region("VN")
                    .isNew(true)
                    .build();
            } else {
                // Update existing file entity
                fileEntity.setName(event.getData().getName());
                fileEntity.setMimeType(event.getData().getContentType());
                fileEntity.setSize(event.getData().getSize());
                fileEntity.setOwnerUserId(event.getData().getOwnerUserId());
            }
            
            fileService.saveFile(fileEntity);
            log.info("Successfully processed file.metadata.recorded for fileId: {}", event.getData().getFileId());
            
        } catch (Exception e) {
            log.error("Error processing file.metadata.recorded event for fileId: {} - {}", 
                event.getData().getFileId(), e.getMessage(), e);
        }
    }
    
    @KafkaListener(topics = "file.plaintext.extracted", groupId = "repository-service-group")
    public void onFilePlaintextExtracted(FilePlaintextExtractedEventDto event) {
        log.info("Received file.plaintext.extracted event for fileId: {}", event.getData().getFileId());
        
        try {
            FileEntity fileEntity = fileService.getFileById(event.getData().getFileId()).orElse(null);
            if (fileEntity != null) {
                // Update file with extracted text and classification
                fileEntity.setExtractedText(event.getData().getPlaintext());
                
                // Update document type based on classification
                if (event.getData().getClassification() != null) {
                    if (event.getData().getClassification().getIsContract() != null && 
                        event.getData().getClassification().getIsContract()) {
                        fileEntity.setDocumentType("CONTRACT");
                    } else {
                        fileEntity.setDocumentType(event.getData().getClassification().getDocumentType());
                    }
                }
                
                fileService.saveFile(fileEntity);
                log.info("Successfully processed file.plaintext.extracted for fileId: {}", event.getData().getFileId());
            } else {
                log.warn("File not found for fileId: {} in file.plaintext.extracted event", event.getData().getFileId());
            }
            
        } catch (Exception e) {
            log.error("Error processing file.plaintext.extracted event for fileId: {} - {}", 
                event.getData().getFileId(), e.getMessage(), e);
        }
    }
    
    @KafkaListener(topics = "contract.summary.generated", groupId = "repository-service-group")
    public void onContractSummaryGenerated(ContractSummaryGeneratedEventDto event) {
        log.info("Received contract.summary.generated event for fileId: {}", event.getData().getFileId());
        
        try {
            FileEntity fileEntity = fileService.getFileById(event.getData().getFileId()).orElse(null);
            if (fileEntity != null) {
                // Update file with contract summary information
                // For now, we'll store the summary in extractedText field
                // Later we can enhance FileEntity to have dedicated contract fields
                String summary = event.getData().getSummaryResult() != null ? 
                    event.getData().getSummaryResult().getSummary() : "";
                
                if (summary != null && !summary.isEmpty()) {
                    fileEntity.setExtractedText(fileEntity.getExtractedText() + "\n\nSUMMARY: " + summary);
                }
                
                fileEntity.setDocumentType("CONTRACT");
                fileService.saveFile(fileEntity);
                log.info("Successfully processed contract.summary.generated for fileId: {}", event.getData().getFileId());
            } else {
                log.warn("File not found for fileId: {} in contract.summary.generated event", event.getData().getFileId());
            }
            
        } catch (Exception e) {
            log.error("Error processing contract.summary.generated event for fileId: {} - {}", 
                event.getData().getFileId(), e.getMessage(), e);
        }
    }
}