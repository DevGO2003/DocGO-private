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
            // Debug logging
            log.debug("FileEntity nested maps - file: {}, storage: {}, metadata: {}, audit: {}", 
                file.getFile() != null ? file.getFile().size() : "null",
                file.getStorage() != null ? file.getStorage().size() : "null",
                file.getMetadata() != null ? file.getMetadata().size() : "null",
                file.getAudit() != null ? file.getAudit().size() : "null");
            
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

        log.debug("Mapping overview with status={}, documentType={}", 
                  overviewMap.get("status"), overviewMap.get("documentType"));

        return OverviewDto.builder()
            .title(asString(overviewMap.get("title")))
            .status(normalizeOverviewStatus(asString(overviewMap.get("status"))))
            .documentType(normalizeDocumentType(asString(overviewMap.get("documentType"))))
            .contractType(asString(overviewMap.get("contractType")))
            .category(asString(overviewMap.get("category")))
            .tags(asList(overviewMap.get("tags")))
            .ownerUserId(asString(overviewMap.get("ownerUserId")))
            .language(normalizeLanguage(asString(overviewMap.get("language"))))
            .region(normalizeRegion(asString(overviewMap.get("region"))))
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

        log.debug("Mapping contract with priority={}, confidentiality={}, currency={}", 
                  contractMap.get("priority"), contractMap.get("confidentiality"), contractMap.get("currency"));

        return ContractDto.builder()
            .effectiveDate(asLocalDateTime(contractMap.get("effectiveDate")))
            .expiryDate(asLocalDateTime(contractMap.get("expiryDate")))
            .totalValue(asDouble(contractMap.get("totalValue")))
            .currency(toUpperEnum(asString(contractMap.get("currency"))))
            .summary(asString(contractMap.get("summary")))
            .project(asString(contractMap.get("project")))
            .department(asString(contractMap.get("department")))
            .priority(normalizePriority(asString(contractMap.get("priority"))))
            .confidentiality(normalizeConfidentiality(asString(contractMap.get("confidentiality"))))
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

        // Get version from audit or default to 1
        Integer version = 1;
        if (file.getAudit() != null && file.getAudit().get("version") != null) {
            version = asInteger(file.getAudit().get("version"));
        }

        return FileInfoDto.builder()
            .id(file.getId())
            .name(file.getName())
            .type(file.getMimeType())
            .size(file.getSize())
            .hash(mapToHash(asMap(fileMap.get("hash"))))
            .permissions(mapToPermissions(asMap(fileMap.get("permissions"))))
            .security(mapToSecurity(asMap(fileMap.get("security"))))
            .version(version)
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
    private Long asLong(Object o) {
        if (o instanceof Number) return ((Number) o).longValue();
        try { return o != null ? Long.parseLong(o.toString()) : null; } catch (Exception e) { return null; }
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

    // Basic implementations for nested mappers
    private WorkflowDto mapToWorkflow(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        log.debug("Mapping workflow with status={}, currentStage={}", 
                  map.get("status"), map.get("currentStage"));
        return WorkflowDto.builder()
            .status(toUpperEnum(asString(map.get("status"))))
            .currentStage(toUpperEnum(asString(map.get("currentStage"))))
            .nextStage(toUpperEnum(asString(map.get("nextStage"))))
            .build();
    }
    
    private List<PartyDto> mapToParties(List<Object> list) {
        if (list == null || list.isEmpty()) return new java.util.ArrayList<>();
        
        List<PartyDto> parties = new java.util.ArrayList<>();
        for (Object item : list) {
            Map<String, Object> partyMap = asMap(item);
            if (partyMap == null) continue;
            
            PartyDto party = PartyDto.builder()
                .id(asString(partyMap.get("id")))
                .name(asString(partyMap.get("name")))
                .type(toUpperEnum(asString(partyMap.get("type"))))
                .role(asString(partyMap.get("role")))
                .contact(mapToContact(asMap(partyMap.get("contact"))))
                .representative(mapToRepresentative(asMap(partyMap.get("representative"))))
                .taxCode(asString(partyMap.get("taxCode")))
                .build();
            parties.add(party);
        }
        
        log.debug("Mapped {} parties", parties.size());
        return parties;
    }
    
    private PartyDto.ContactDto mapToContact(Map<String, Object> map) {
        if (map == null) return null;
        return PartyDto.ContactDto.builder()
            .email(asString(map.get("email")))
            .phone(asString(map.get("phone")))
            .address(asString(map.get("address")))
            .build();
    }
    
    private PartyDto.RepresentativeDto mapToRepresentative(Map<String, Object> map) {
        if (map == null) return null;
        return PartyDto.RepresentativeDto.builder()
            .name(asString(map.get("name")))
            .position(asString(map.get("position")))
            .email(asString(map.get("email")))
            .build();
    }
    private PaymentDto mapToPayment(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return null;
        
        return PaymentDto.builder()
            .totalValue(asDouble(map.get("totalValue")))
            .currency(toUpperEnum(asString(map.get("currency"))))
            .schedule(mapToSchedule(asList(map.get("schedule"))))
            .method(asString(map.get("method")))
            .paymentMethod(asString(map.get("paymentMethod")))
            .build();
    }
    
    private List<PaymentDto.ScheduleDto> mapToSchedule(List<Object> list) {
        if (list == null || list.isEmpty()) return new java.util.ArrayList<>();
        
        List<PaymentDto.ScheduleDto> schedules = new java.util.ArrayList<>();
        for (Object item : list) {
            Map<String, Object> scheduleMap = asMap(item);
            if (scheduleMap == null) continue;
            
            PaymentDto.ScheduleDto schedule = PaymentDto.ScheduleDto.builder()
                .milestone(asString(scheduleMap.get("milestone")))
                .percentage(asInteger(scheduleMap.get("percentage")))
                .amount(asDouble(scheduleMap.get("amount")))
                .dueDate(asLocalDateTime(scheduleMap.get("dueDate")))
                .status(toUpperEnum(asString(scheduleMap.get("status"))))
                .build();
            schedules.add(schedule);
        }
        
        return schedules;
    }
    private ClausesDto mapToClauses(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return null;
        return ClausesDto.builder()
            .key(asList(map.get("key")))
            .unfavorable(asList(map.get("unfavorable")))
            .build();
    }
    private List<ReminderDto> mapToReminders(List<Object> list) {
        if (list == null || list.isEmpty()) return new java.util.ArrayList<>();
        
        List<ReminderDto> reminders = new java.util.ArrayList<>();
        for (Object item : list) {
            Map<String, Object> reminderMap = asMap(item);
            if (reminderMap == null) continue;
            
            ReminderDto reminder = ReminderDto.builder()
                .type(asString(reminderMap.get("type")))
                .date(asLocalDateTime(reminderMap.get("date")))
                .description(asString(reminderMap.get("description")))
                .notifyBefore(asInteger(reminderMap.get("notifyBefore")))
                .build();
            reminders.add(reminder);
        }
        
        return reminders;
    }
    private RiskDto mapToRisk(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return null;
        return RiskDto.builder()
            .level(toUpperEnum(asString(map.get("level"))))
            .factors(asList(map.get("factors")))
            .mitigations(asList(map.get("mitigations")))
            .build();
    }
    private ComplianceDto mapToCompliance(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return null;
        return ComplianceDto.builder()
            .status(toUpperEnum(asString(map.get("status"))))
            .issues(asList(map.get("issues")))
            .recommendations(asList(map.get("recommendations")))
            .build();
    }
    
    private List<ContentDto.SectionDto> mapToSections(List<Object> list) {
        if (list == null || list.isEmpty()) return new java.util.ArrayList<>();
        
        List<ContentDto.SectionDto> sections = new java.util.ArrayList<>();
        for (Object item : list) {
            Map<String, Object> sectionMap = asMap(item);
            if (sectionMap == null) continue;
            
            ContentDto.SectionDto section = ContentDto.SectionDto.builder()
                .title(asString(sectionMap.get("title")))
                .description(asString(sectionMap.get("description")))
                .content(asString(sectionMap.get("content")))
                .pageNumber(asInteger(sectionMap.get("pageNumber")))
                .build();
            sections.add(section);
        }
        
        return sections;
    }
    
    private ContentDto.OcrDto mapToOcr(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return ContentDto.OcrDto.builder()
            .text(asString(map.get("text")))
            .status(asString(map.get("status")))
            .build();
    }
    
    private ContentDto.ClassificationDto mapToClassification(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return ContentDto.ClassificationDto.builder()
            .isContract(asBoolean(map.get("isContract")))
            .confidence(asDouble(map.get("confidence")))
            .category(asString(map.get("category")))
            .language(asString(map.get("language")))
            .build();
    }
    
    private ContentDto.ProcessingDto mapToProcessing(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return ContentDto.ProcessingDto.builder()
            .status(asString(map.get("status")))
            .error(asString(map.get("error")))
            .build();
    }
    
    private FileInfoDto.HashDto mapToHash(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return FileInfoDto.HashDto.builder()
            .md5(asString(map.get("md5")))
            .sha256(asString(map.get("sha256")))
            .build();
    }
    
    private FileInfoDto.PermissionsDto mapToPermissions(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return FileInfoDto.PermissionsDto.builder()
            .read(asList(map.get("read")))
            .write(asList(map.get("write")))
            .delete(asList(map.get("delete")))
            .share(asList(map.get("share")))
            .build();
    }
    private FileInfoDto.SecurityDto mapToSecurity(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return FileInfoDto.SecurityDto.builder()
            .encryption(asString(map.get("encryption")))
            .watermark(asBoolean(map.get("watermark")))
            .digitalSignature(asBoolean(map.get("digitalSignature")))
            .accessLogging(asBoolean(map.get("accessLogging")))
            .build();
    }
    private StorageDto.RetentionPolicyDto mapToRetentionPolicy(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return StorageDto.RetentionPolicyDto.builder()
            .retentionPeriod(asInteger(map.get("retentionPeriod")))
            .unit(asString(map.get("unit")))
            .deleteAfter(asLocalDateTime(map.get("deleteAfter")))
            .build();
    }
    private StorageDto.AccessControlDto mapToAccessControl(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return StorageDto.AccessControlDto.builder()
            .allowedUsers(asList(map.get("allowedUsers")))
            .allowedRoles(asList(map.get("allowedRoles")))
            .deniedUsers(asList(map.get("deniedUsers")))
            .build();
    }
    private StorageDto.S3Dto mapToS3(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return StorageDto.S3Dto.builder()
            .url(asString(map.get("url")))
            .bucket(asString(map.get("bucket")))
            .objectKey(asString(map.get("objectKey")))
            .key(asString(map.get("key")))
            .region(asString(map.get("region")))
            .contentType(asString(map.get("contentType")))
            .size(asLong(map.get("size")))
            .versionId(asString(map.get("versionId")))
            .checksum(mapToChecksum(asMap(map.get("checksum"))))
            .storageClass(asString(map.get("storageClass")))
            .build();
    }
    
    private StorageDto.ChecksumDto mapToChecksum(Map<String, Object> map) {
        if (map == null) return null;
        return StorageDto.ChecksumDto.builder()
            .originalMD5(asString(map.get("originalMD5")))
            .archiveMD5(asString(map.get("archiveMD5")))
            .build();
    }
    private StorageDto.LocalDto mapToLocal(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return StorageDto.LocalDto.builder()
            .path(asString(map.get("path")))
            .directory(asString(map.get("directory")))
            .build();
    }
    private VersioningDto.CurrentVersionInfoDto mapToCurrentVersionInfo(Map<String, Object> map) {
        if (map == null) return null;
        return VersioningDto.CurrentVersionInfoDto.builder()
            .tag(asString(map.get("tag")))
            .number(asInteger(map.get("number")))
            .build();
    }
    private List<VersioningDto.VersionDto> mapToVersions(List<Object> list) {
        if (list == null || list.isEmpty()) return new java.util.ArrayList<>();
        
        List<VersioningDto.VersionDto> versions = new java.util.ArrayList<>();
        for (Object item : list) {
            Map<String, Object> versionMap = asMap(item);
            if (versionMap == null) continue;
            
            VersioningDto.VersionDto version = VersioningDto.VersionDto.builder()
                .version(asString(versionMap.get("version")))
                .createdAt(asLocalDateTime(versionMap.get("createdAt")))
                .createdBy(asString(versionMap.get("createdBy")))
                .changes(asString(versionMap.get("changes")))
                .fileId(asString(versionMap.get("fileId")))
                .build();
            versions.add(version);
        }
        
        return versions;
    }
    private List<VersioningDto.ChangeLogDto> mapToChangeLog(List<Object> list) {
        if (list == null || list.isEmpty()) return new java.util.ArrayList<>();
        
        List<VersioningDto.ChangeLogDto> changeLogs = new java.util.ArrayList<>();
        for (Object item : list) {
            Map<String, Object> changeLogMap = asMap(item);
            if (changeLogMap == null) continue;
            
            VersioningDto.ChangeLogDto changeLog = VersioningDto.ChangeLogDto.builder()
                .version(asString(changeLogMap.get("version")))
                .date(asLocalDateTime(changeLogMap.get("date")))
                .author(asString(changeLogMap.get("author")))
                .changes(asString(changeLogMap.get("changes")))
                .build();
            changeLogs.add(changeLog);
        }
        
        return changeLogs;
    }
    private List<VersioningDto.HistoryDto> mapToHistory(List<Object> list) {
        if (list == null || list.isEmpty()) return new java.util.ArrayList<>();
        
        List<VersioningDto.HistoryDto> histories = new java.util.ArrayList<>();
        for (Object item : list) {
            Map<String, Object> historyMap = asMap(item);
            if (historyMap == null) continue;
            
            VersioningDto.HistoryDto history = VersioningDto.HistoryDto.builder()
                .version(asInteger(historyMap.get("version")))
                .versionTag(asString(historyMap.get("versionTag")))
                .changedAt(asLocalDateTime(historyMap.get("changedAt")))
                .changedBy(asString(historyMap.get("changedBy")))
                .changeType(toUpperEnum(asString(historyMap.get("changeType"))))
                .storage(mapToStorage(asMap(historyMap.get("storage"))))
                .build();
            histories.add(history);
        }
        
        return histories;
    }
    private MetadataDto.FileSystemDto mapToFileSystem(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return MetadataDto.FileSystemDto.builder()
            .createdAt(asLocalDateTime(map.get("createdAt")))
            .modifiedAt(asLocalDateTime(map.get("modifiedAt")))
            .owner(asString(map.get("owner")))
            .permissions(asString(map.get("permissions")))
            .build();
    }
    private MetadataDto.OriginalFileDto mapToOriginalFile(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return null;
        return MetadataDto.OriginalFileDto.builder()
            .name(asString(map.get("name")))
            .path(asString(map.get("path")))
            .source(asString(map.get("source")))
            .build();
    }
    private MetadataDto.ArchivedFileDto mapToArchivedFile(Map<String, Object> map) {
        if (map == null || map.isEmpty()) return null;
        return MetadataDto.ArchivedFileDto.builder()
            .name(asString(map.get("name")))
            .path(asString(map.get("path")))
            .archivedAt(asLocalDateTime(map.get("archivedAt")))
            .build();
    }
    private MetadataDto.TechnicalDto mapToTechnical(Map<String, Object> map) { 
        if (map == null || map.isEmpty()) return null;
        return MetadataDto.TechnicalDto.builder()
            .format(asString(map.get("format")))
            .mimeType(asString(map.get("mimeType")))
            .size(asLong(map.get("size")))
            .encoding(asString(map.get("encoding")))
            .build();
    }
    private List<AuditDto.ChangeHistoryDto> mapToChangeHistory(List<Object> list) { return null; }
    private List<AuditDto.AccessLogDto> mapToAccessLog(List<Object> list) { return null; }
    
    // =====================
    // Normalization helpers
    // =====================

    private String toUpperEnum(String s) {
        return s != null ? s.trim().toUpperCase() : null;
    }

    private String normalizeLanguage(String s) {
        return s != null ? s.trim().toLowerCase() : null; // ISO 639-1
    }

    private String normalizeRegion(String s) {
        return toUpperEnum(s); // ISO 3166-1 alpha-2
    }

    private String normalizeOverviewStatus(String s) {
        if (s == null) return null;
        String v = s.trim().toLowerCase();
        switch (v) {
            case "processed":
            case "completed": 
            case "active":
            case "uploaded":
                return "ACTIVE";
            case "draft":
                return "DRAFT";
            case "archived":
                return "ARCHIVED";
            case "deleted":
                return "DELETED";
            case "inactive":
            case "processing":
                return "INACTIVE";
            default:
                log.debug("Unknown overview status '{}', using uppercase", s);
                return toUpperEnum(s);
        }
    }

    private String normalizeDocumentType(String s) {
        if (s == null) return null;
        String v = s.trim().toLowerCase();
        switch (v) {
            case "contract":
                return "CONTRACT";
            case "invoice":
                return "INVOICE";
            case "memo":
                return "MEMO";
            case "report":
                return "REPORT";
            case "agreement":
                return "AGREEMENT";
            default:
                log.debug("Unknown document type '{}', using uppercase", s);
                return toUpperEnum(s);
        }
    }

    private String normalizePriority(String s) {
        if (s == null) return null;
        String v = s.trim().toLowerCase();
        switch (v) {
            case "high":
                return "HIGH";
            case "medium":
                return "MEDIUM";
            case "low":
                return "LOW";
            default:
                log.debug("Unknown priority '{}', using uppercase", s);
                return toUpperEnum(s);
        }
    }

    private String normalizeConfidentiality(String s) {
        if (s == null) return null;
        String v = s.trim().toLowerCase();
        switch (v) {
            case "confidential":
                return "CONFIDENTIAL";
            case "internal":
                return "INTERNAL";
            case "public":
                return "PUBLIC";
            case "restricted":
                return "RESTRICTED";
            default:
                log.debug("Unknown confidentiality '{}', using uppercase", s);
                return toUpperEnum(s);
        }
    }
}


