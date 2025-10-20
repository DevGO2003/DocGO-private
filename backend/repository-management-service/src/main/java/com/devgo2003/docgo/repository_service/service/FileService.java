package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class FileService {
    
    @Autowired
    private FileRepository fileRepository;
    
    private static final Logger log = LoggerFactory.getLogger(FileService.class);

    public Optional<FileEntity> getFileById(String id) {
        return fileRepository.findById(id);
    }
    
    public FileEntity saveFile(FileEntity file) {
        return fileRepository.save(file);
    }
    
    public List<FileEntity> getFilesByStatus(String status) {
        return fileRepository.findByStatus(status);
    }
    
    public List<FileEntity> getFilesByDocumentType(String documentType) {
        return fileRepository.findByDocumentType(documentType);
    }
    
    public List<FileEntity> getFilesByOwner(String ownerUserId) {
        return fileRepository.findByOwnerUserId(ownerUserId);
    }
    
    public List<FileEntity> getAllFiles() {
        return fileRepository.findAll();
    }
    
    public Optional<FileEntity> findById(String id) {
        return fileRepository.findById(id);
    }
    
    public FileEntity save(FileEntity file) {
        return fileRepository.save(file);
    }
    
    public FileEntity getDocumentById(String id) {
        Optional<FileEntity> document = fileRepository.findById(id);
        return document.orElse(null);
    }

    public FullFileResponseDto getFullFileById(String id) {
        log.info("Starting getFullFileById for ID: " + id);
        Optional<FileEntity> fileOpt = getFileById(id);
        log.info("File found: " + (fileOpt.isPresent() ? "yes" : "no"));
        if (fileOpt.isEmpty()) {
            log.warn("File not found for ID: " + id);
            return null;
        }
        FileEntity file = fileOpt.get();
        try {
            log.info("Building overview for file: " + (file.getName() != null ? file.getName() : "unknown"));
            Overview overview = Overview.builder()
                .title(file.getTitle() != null ? file.getTitle() : file.getName())
                .status(file.getStatus() != null ? file.getStatus() : "ACTIVE")
                .documentType(file.getDocumentType() != null ? file.getDocumentType() : "CONTRACT")
                .contractType(file.getContractType())
                .category(file.getCategory())
                .tags(file.getTags())
                .ownerUserId(file.getOwnerUserId())
                .language(file.getLanguage())
                .region(file.getRegion())
                .isNew(file.getIsNew())
                .build();

            Contract contract = null;
            if ("CONTRACT".equalsIgnoreCase(file.getDocumentType()) || (file.getDocumentType() == null && file.getSummary() != null)) {
                contract = Contract.builder()
                    .effectiveDate(file.getEffectiveDate())
                    .expiryDate(file.getExpiryDate())
                    .totalValue(file.getTotalValue())
                    .currency(file.getCurrency())
                    .summary(file.getSummary())
                    .project(file.getProject())
                    .department(file.getDepartment())
                    .priority(file.getPriority())
                    .confidentiality(file.getConfidentiality())
                    .build();
            }

            Content content = Content.builder()
                .extractedText(file.getExtractedText() != null ? file.getExtractedText() : "")
                .plaintext(file.getPlaintext())
                .keyTerms(file.getKeyTerms())
                .sections(null)
                .ocr(null)
                .classification(null)
                .processing(null) // Changed from file.getProcessing() to null
                .jsonContent(file.getJsonContent())
                .jsonAnalysisStatus(file.getJsonAnalysisStatus())
                .build();

            FileInfo fileInfo = FileInfo.builder()
                .id(file.getId() != null ? file.getId() : "")
                .name(file.getName() != null ? file.getName() : "")
                .type(file.getMimeType() != null ? file.getMimeType() : "application/octet-stream")
                .size(file.getSize() != null ? file.getSize() : 0L)
                .hash(null)
                .permissions(null)
                .security(null)
                .version(file.getVersion())
                .build();

            Storage storage = Storage.builder()
                .location(file.getLocation())
                .backupLocations(file.getBackupLocations())
                .retentionPolicy(null)
                .accessControl(null)
                .s3(null)
                .local(null) // Changed from file.getLocal() to null
                .build();
                
            Versioning versioning = Versioning.builder()
                .currentVersionInfo(null)
                .versions(null)
                .changeLog(null)
                .previousVersion(file.getPreviousVersion())
                .changeSummary(file.getChangeSummary())
                .changedFields(file.getChangedFields())
                .diff(file.getDiff())
                .history(null) // Changed from file.getHistory() to null
                .build();
                
            Metadata metadata = Metadata.builder()
                .fileSystem(null)
                .originalFile(null)
                .archivedFile(null)
                .technical(null) // Changed from file.getTechnical() to null
                .build();
                
            Audit audit = Audit.builder()
                .createdAt(file.getCreatedAt() != null ? file.getCreatedAt() : LocalDateTime.now())
                .createdBy(file.getCreatedBy() != null ? file.getCreatedBy() : "system")
                .lastModifiedAt(file.getLastModifiedAt() != null ? file.getLastModifiedAt() : LocalDateTime.now())
                .lastModifiedBy(file.getLastModifiedBy() != null ? file.getLastModifiedBy() : "system")
                .version(file.getAuditVersion() != null ? file.getAuditVersion() : 1)
                .changeHistory(null)
                .accessLog(null)
                .updatedAt(file.getUpdatedAt())
                .updatedBy(file.getUpdatedBy())
                .deletedAt(file.getDeletedAt())
                .deletedBy(file.getDeletedBy())
                .isDeleted(file.getIsDeleted())
                .build();

            FullFileResponseDto dto = FullFileResponseDto.builder()
                .id(file.getId() != null ? file.getId() : "")
                .overview(overview)
                .contract(contract)
                .content(content)
                .file(fileInfo)
                .storage(storage)
                .versioning(versioning)
                .metadata(metadata)
                .audit(audit)
                .processing(file.getProcessingStatus())
                .build();
            log.info("Built full DTO successfully for ID: " + id);
            return dto;
        } catch (Exception e) {
            log.error("Error building DTO for ID " + id + ": " + e.getMessage(), e);
            return null;
        }
    }
    
    public Page<FileEntity> getAllFiles(int pageNumber, int pageSize, String sortBy, String sortDirection, String searchTerm) {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);
        
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            return fileRepository.findByNameContainingIgnoreCase(searchTerm, pageable);
        }
        
        return fileRepository.findAll(pageable);
    }
    
    public FileEntity uploadFile(MultipartFile file, String metadata) {
        try {
            FileEntity fileEntity = new FileEntity();
            fileEntity.setId("FILE-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
            fileEntity.setName(file.getOriginalFilename());
            fileEntity.setMimeType(file.getContentType());
            fileEntity.setSize(file.getSize());
            fileEntity.setExtractedText(""); // Will be populated by OCR later
            
            return fileRepository.save(fileEntity);
        } catch (Exception e) {
            log.error("Error uploading file: " + e.getMessage(), e);
            throw new RuntimeException("Failed to upload file", e);
        }
    }
    
    public FileEntity updateFileMetadata(String id, String metadata) {
        Optional<FileEntity> fileOpt = fileRepository.findById(id);
        if (fileOpt.isPresent()) {
            FileEntity file = fileOpt.get();
            // Update metadata logic here
            return fileRepository.save(file);
        }
        return null;
    }
    
    public boolean deleteFile(String id) {
        try {
            fileRepository.deleteById(id);
            return true;
        } catch (Exception e) {
            log.error("Error deleting file: " + e.getMessage(), e);
            return false;
        }
    }
    
    public String getDownloadUrl(String id) {
        Optional<FileEntity> fileOpt = fileRepository.findById(id);
        if (fileOpt.isPresent()) {
            // Return download URL logic here
            return "http://localhost:8002/api/v1/repository-management-service/files/" + id + "/download";
        }
        return null;
    }
}


