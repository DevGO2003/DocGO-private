package com.devgo2003.docgo.repository_service.service;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.devgo2003.docgo.repository_service.dto.FullFileResponseDto;
import com.devgo2003.docgo.repository_service.dto.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.multipart.MultipartFile;
import java.util.Optional;
import java.util.List;
import java.util.Map;
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
        log.debug("Getting full file by ID: {}", id);
        Optional<FileEntity> fileOpt = getFileById(id);
        if (fileOpt.isEmpty()) {
            log.warn("File not found for ID: {}", id);
            return null;
        }

        FileEntity file = fileOpt.get();
        try {
            // Build DTO from nested Map fields
            FullFileResponseDto dto = FullFileResponseDto.builder()
                .id(file.getId())
                .overview(mapToOverview(file.getOverview()))
                .contract(mapToContract(file))
                .content(mapToContent(file.getContent()))
                .file(mapToFileInfo(file))
                .storage(mapToStorage(file.getStorage()))
                .versioning(mapToVersioning(file.getVersioning()))
                .metadata(mapToMetadata(file.getMetadata()))
                .audit(mapToAudit(file.getAudit()))
                .processing(file.getStatus() != null && file.getStatus().equals("completed") ? null : file.getProcessingStatus())
                .build();

            log.info("Built full DTO for fileId={}", id);
            return dto;
        } catch (Exception e) {
            log.error("Error building DTO for ID {}: {}", id, e.getMessage(), e);
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

    // Helper methods for mapping nested structures
    private OverviewDto mapToOverview(Map<String, Object> overviewMap) {
        if (overviewMap == null || overviewMap.isEmpty()) return null;

        return OverviewDto.builder()
            .title(asString(overviewMap.get("title")))
            .status(asString(overviewMap.get("status")))
            .documentType(asString(overviewMap.get("documentType")))
            .contractType(asString(overviewMap.get("contractType")))
            .category(asString(overviewMap.get("category")))
            .tags(asList(overviewMap.get("tags")))
            .ownerUserId(asString(overviewMap.get("ownerUserId")))
            .language(asString(overviewMap.get("language")))
            .region(asString(overviewMap.get("region")))
            .isNew(asBoolean(overviewMap.get("isNew")))
            .build();
    }

    private ContractDto mapToContract(FileEntity file) {
        // Only return contract if documentType is CONTRACT or contract field exists
        if (!"CONTRACT".equalsIgnoreCase(file.getDocumentType()) &&
            (file.getContract() == null || file.getContract().isEmpty())) {
            return null;
        }

        Map<String, Object> contractMap = file.getContract();
        if (contractMap == null) contractMap = new java.util.HashMap<>();

        return ContractDto.builder()
            .effectiveDate(asLocalDateTime(contractMap.get("effectiveDate")))
            .expiryDate(asLocalDateTime(contractMap.get("expiryDate")))
            .totalValue(asDouble(contractMap.get("totalValue")))
            .currency(asString(contractMap.get("currency")))
            .summary(asString(contractMap.get("summary")))
            .project(asString(contractMap.get("project")))
            .department(asString(contractMap.get("department")))
            .priority(asString(contractMap.get("priority")))
            .confidentiality(asString(contractMap.get("confidentiality")))
            .workflow(mapToWorkflow(asMap(contractMap.get("workflow"))))
            .parties(mapToParties(asList(contractMap.get("parties"))))
            .payment(mapToPayment(asMap(contractMap.get("payment"))))
            .clauses(mapToClauses(asMap(contractMap.get("clauses"))))
            .reminders(mapToReminders(asList(contractMap.get("reminders"))))
            .risk(mapToRisk(asMap(contractMap.get("risk"))))
            .compliance(mapToCompliance(asMap(contractMap.get("compliance"))))
            .build();
    }

    private ContentDto mapToContent(Map<String, Object> contentMap) {
        if (contentMap == null || contentMap.isEmpty()) return null;
        return ContentDto.builder()
            .extractedText(asString(contentMap.get("extractedText")))
            .summary(asString(contentMap.get("summary")))
            .keyTerms(asList(contentMap.get("keyTerms")))
            .sections(mapToSections(asList(contentMap.get("sections"))))
            .plaintext(asString(contentMap.get("plaintext")))
            .ocr(mapToOcr(asMap(contentMap.get("ocr"))))
            .classification(mapToClassification(asMap(contentMap.get("classification"))))
            .processing(mapToProcessing(asMap(contentMap.get("processing"))))
            .jsonContent(contentMap.get("jsonContent"))
            .jsonAnalysisStatus(asString(contentMap.get("jsonAnalysisStatus")))
            .build();
    }

    private FileInfoDto mapToFileInfo(FileEntity file) {
        if (file == null) return null;
        Map<String, Object> fileMap = file.getFile();
        if (fileMap == null) fileMap = new java.util.HashMap<>();

        return FileInfoDto.builder()
            .id(file.getId())
            .name(file.getName())
            .type(file.getMimeType())
            .size(file.getSize())
            .hash(mapToHash(asMap(fileMap.get("hash"))))
            .permissions(mapToPermissions(asMap(fileMap.get("permissions"))))
            .security(mapToSecurity(asMap(fileMap.get("security"))))
            .version(file.getVersion())
            .build();
    }

    private StorageDto mapToStorage(Map<String, Object> storageMap) {
        if (storageMap == null || storageMap.isEmpty()) return null;
        return StorageDto.builder()
            .location(asString(storageMap.get("location")))
            .backupLocations(asList(storageMap.get("backupLocations")))
            .retentionPolicy(mapToRetentionPolicy(asMap(storageMap.get("retentionPolicy"))))
            .accessControl(mapToAccessControl(asMap(storageMap.get("accessControl"))))
            .s3(mapToS3(asMap(storageMap.get("s3"))))
            .local(mapToLocal(asMap(storageMap.get("local"))))
            .build();
    }

    private VersioningDto mapToVersioning(Map<String, Object> versioningMap) {
        if (versioningMap == null || versioningMap.isEmpty()) return null;
        return VersioningDto.builder()
            .currentVersionInfo(mapToCurrentVersionInfo(asMap(versioningMap.get("currentVersionInfo"))))
            .versions(mapToVersions(asList(versioningMap.get("versions"))))
            .changeLog(mapToChangeLog(asList(versioningMap.get("changeLog"))))
            .previousVersion(asString(versioningMap.get("previousVersion")))
            .changeSummary(asString(versioningMap.get("changeSummary")))
            .changedFields(asList(versioningMap.get("changedFields")))
            .diff(asMap(versioningMap.get("diff")))
            .history(mapToHistory(asList(versioningMap.get("history"))))
            .build();
    }

    private MetadataDto mapToMetadata(Map<String, Object> metadataMap) {
        if (metadataMap == null || metadataMap.isEmpty()) return null;
        return MetadataDto.builder()
            .fileSystem(mapToFileSystem(asMap(metadataMap.get("fileSystem"))))
            .originalFile(mapToOriginalFile(asMap(metadataMap.get("originalDocument"))))
            .archivedFile(mapToArchivedFile(asMap(metadataMap.get("archivedDocument"))))
            .technical(mapToTechnical(asMap(metadataMap.get("technical"))))
            .build();
    }

    private AuditDto mapToAudit(Map<String, Object> auditMap) {
        if (auditMap == null || auditMap.isEmpty()) return null;
        return AuditDto.builder()
            .createdAt(asLocalDateTime(auditMap.get("createdAt")))
            .createdBy(asString(auditMap.get("createdBy")))
            .lastModifiedAt(asLocalDateTime(auditMap.get("lastModifiedAt")))
            .lastModifiedBy(asString(auditMap.get("lastModifiedBy")))
            .version(asInteger(auditMap.get("version")))
            .changeHistory(mapToChangeHistory(asList(auditMap.get("changeHistory"))))
            .accessLog(mapToAccessLog(asList(auditMap.get("accessLog"))))
            .updatedAt(asLocalDateTime(auditMap.get("updatedAt")))
            .updatedBy(asString(auditMap.get("updatedBy")))
            .deletedAt(asLocalDateTime(auditMap.get("deletedAt")))
            .deletedBy(asString(auditMap.get("deletedBy")))
            .isDeleted(asBoolean(auditMap.get("isDeleted")))
            .build();
    }

    // Utility methods for safe casting
    private String asString(Object o) { return o != null ? String.valueOf(o) : null; }
    private Double asDouble(Object o) {
        if (o instanceof Number) return ((Number) o).doubleValue();
        try { return o != null ? Double.parseDouble(o.toString()) : null; } catch (Exception e) { return null; }
    }
    private Integer asInteger(Object o) {
        if (o instanceof Number) return ((Number) o).intValue();
        try { return o != null ? Integer.parseInt(o.toString()) : null; } catch (Exception e) { return null; }
    }
    private Boolean asBoolean(Object o) {
        if (o instanceof Boolean) return (Boolean) o;
        if (o != null) return "true".equalsIgnoreCase(o.toString());
        return null;
    }
    private LocalDateTime asLocalDateTime(Object o) {
        if (o == null) return null;
        if (o instanceof LocalDateTime) return (LocalDateTime) o;
        try { return LocalDateTime.parse(o.toString()); } catch (Exception e) { return null; }
    }
    @SuppressWarnings("unchecked")
    private <T> List<T> asList(Object o) {
        if (o instanceof List) return (List<T>) o;
        return new java.util.ArrayList<>();
    }
    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        if (o instanceof Map) return (Map<String, Object>) o;
        return new java.util.HashMap<>();
    }

    // Stub implementations for nested mappers - using separate DTO classes
    private WorkflowDto mapToWorkflow(Map<String, Object> map) { return null; }
    private List<PartyDto> mapToParties(List<Object> list) { return null; }
    private PaymentDto mapToPayment(Map<String, Object> map) { return null; }
    private ClausesDto mapToClauses(Map<String, Object> map) { return null; }
    private List<ReminderDto> mapToReminders(List<Object> list) { return null; }
    private RiskDto mapToRisk(Map<String, Object> map) { return null; }
    private ComplianceDto mapToCompliance(Map<String, Object> map) { return null; }
    private List<ContentDto.SectionDto> mapToSections(List<Object> list) { return null; }
    private ContentDto.OcrDto mapToOcr(Map<String, Object> map) { return null; }
    private ContentDto.ClassificationDto mapToClassification(Map<String, Object> map) { return null; }
    private ContentDto.ProcessingDto mapToProcessing(Map<String, Object> map) { return null; }
    private FileInfoDto.HashDto mapToHash(Map<String, Object> map) { return null; }
    private FileInfoDto.PermissionsDto mapToPermissions(Map<String, Object> map) { return null; }
    private FileInfoDto.SecurityDto mapToSecurity(Map<String, Object> map) { return null; }
    private StorageDto.RetentionPolicyDto mapToRetentionPolicy(Map<String, Object> map) { return null; }
    private StorageDto.AccessControlDto mapToAccessControl(Map<String, Object> map) { return null; }
    private StorageDto.S3Dto mapToS3(Map<String, Object> map) { return null; }
    private StorageDto.LocalDto mapToLocal(Map<String, Object> map) { return null; }
    private VersioningDto.CurrentVersionInfoDto mapToCurrentVersionInfo(Map<String, Object> map) { return null; }
    private List<VersioningDto.VersionDto> mapToVersions(List<Object> list) { return null; }
    private List<VersioningDto.ChangeLogDto> mapToChangeLog(List<Object> list) { return null; }
    private List<VersioningDto.HistoryDto> mapToHistory(List<Object> list) { return null; }
    private MetadataDto.FileSystemDto mapToFileSystem(Map<String, Object> map) { return null; }
    private MetadataDto.OriginalFileDto mapToOriginalFile(Map<String, Object> map) { return null; }
    private MetadataDto.ArchivedFileDto mapToArchivedFile(Map<String, Object> map) { return null; }
    private MetadataDto.TechnicalDto mapToTechnical(Map<String, Object> map) { return null; }
    private List<AuditDto.ChangeHistoryDto> mapToChangeHistory(List<Object> list) { return null; }
    private List<AuditDto.AccessLogDto> mapToAccessLog(List<Object> list) { return null; }
}


