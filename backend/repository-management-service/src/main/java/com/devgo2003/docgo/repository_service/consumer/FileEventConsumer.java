package com.devgo2003.docgo.repository_service.consumer;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@Component
public class FileEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(FileEventConsumer.class);

    private final FileRepository fileRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FileEventConsumer(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    @KafkaListener(topics = "${app.kafka.topic.file-metadata-recorded}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleFileMetadataRecorded(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        logger.debug("[FILE_METADATA_RECORDED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<String, Object> payload = objectMapper.readValue(event, Map.class);
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            FileEntity entity = getOrCreate(fileId);

            // Populate top-level fields
            entity.setName(asString(data.get("name")));
            entity.setMimeType(asString(data.get("contentType")));
            entity.setSize(asLong(data.get("size")));
            entity.setOwnerUserId(asString(data.get("ownerUserId")));
            entity.setStatus("uploaded");

            // Populate file info fields
            Map<String, Object> fileData = asMap(data.get("file"));
            if (fileData != null) {
                entity.setFile(fileData);
                entity.setHash(asMap(fileData.get("hash")));
                entity.setPermissions(asMap(fileData.get("permissions")));
                entity.setSecurity(asMap(fileData.get("security")));
                entity.setVersion(asInteger(fileData.get("version")));
            }

            // Populate storage fields
            Map<String, Object> storageData = asMap(data.get("storage"));
            if (storageData != null) {
                entity.setStorage(storageData);
                entity.setLocation(asString(storageData.get("location")));
                entity.setBackupLocations(asList(storageData.get("backupLocations")));
                entity.setRetentionPolicy(asMap(storageData.get("retentionPolicy")));
                entity.setAccessControl(asMap(storageData.get("accessControl")));
                entity.setS3(asMap(storageData.get("s3")));
                entity.setLocal(asMap(storageData.get("local")));
            }

            // Populate metadata fields
            Map<String, Object> metadataData = asMap(data.get("metadata"));
            if (metadataData != null) {
                entity.setMetadata(metadataData);
                entity.setFileSystem(asMap(metadataData.get("fileSystem")));
                entity.setOriginalDocument(asMap(metadataData.get("originalDocument")));
                entity.setArchivedDocument(asMap(metadataData.get("archivedDocument")));
                entity.setTechnical(asMap(metadataData.get("technical")));
            }

            // Populate audit fields
            Map<String, Object> actor = asMap(payload.get("actor"));
            if (actor != null) {
                entity.setCreatedBy(asString(actor.get("userId")));
                entity.setUpdatedBy(asString(actor.get("userId")));
            }
            entity.setCreatedAt(parseDate(asString(payload.get("timestamp"))));
            entity.setLastModifiedAt(LocalDateTime.now());

            // Build audit map
            Map<String, Object> auditMap = new java.util.HashMap<>();
            auditMap.put("createdAt", entity.getCreatedAt());
            auditMap.put("createdBy", entity.getCreatedBy());
            auditMap.put("lastModifiedAt", entity.getLastModifiedAt());
            auditMap.put("lastModifiedBy", entity.getLastModifiedBy());
            auditMap.put("version", 1);
            auditMap.put("isDeleted", false);
            entity.setAudit(auditMap);

            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved metadata for fileId={}", fileId);
        } catch (Exception e) {
            logger.error("Error processing FILE_METADATA_RECORDED: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.file-content-extracted}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleFileContentExtracted(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        logger.debug("[FILE_CONTENT_EXTRACTED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<String, Object> payload = objectMapper.readValue(event, Map.class);
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            FileEntity entity = getOrCreate(fileId);

            // Build comprehensive content object
            Map<String, Object> content = new java.util.HashMap<>();
            content.put("plaintext", asString(data.get("plaintext")));
            content.put("extractedText", asString(data.get("plaintext"))); // Alias for compatibility
            content.put("summary", asString(data.get("summary")));
            content.put("keyTerms", asList(data.get("keyTerms")));
            content.put("sections", asList(data.get("sections")));
            content.put("ocr", data.get("ocr") != null ? data.get("ocr") : new java.util.HashMap<>());
            content.put("classification", data.get("classification") != null ? data.get("classification") : new java.util.HashMap<>());
            content.put("processing", data.get("processing") != null ? data.get("processing") : new java.util.HashMap<>());
            content.put("jsonContent", data.get("jsonContent"));
            content.put("jsonAnalysisStatus", asString(data.get("jsonAnalysisStatus")));
            entity.setContent(content);

            // Set individual content fields for backward compatibility
            entity.setPlaintext(asString(data.get("plaintext")));
            entity.setKeyTerms(asList(data.get("keyTerms")));
            entity.setSections(asList(data.get("sections")));
            entity.setOcr(asMap(data.get("ocr")));
            entity.setClassification(asMap(data.get("classification")));
            entity.setProcessing(asMap(data.get("processing")));
            entity.setJsonContent(data.get("jsonContent"));
            entity.setJsonAnalysisStatus(asString(data.get("jsonAnalysisStatus")));

            // Extract classification data and build comprehensive overview
            Map<String, Object> classification = asMap(data.get("classification"));
            if (classification != null) {
                Map<String, Object> overview = new java.util.HashMap<>();
                overview.put("title", asString(data.get("title")));
                overview.put("status", "processed");
                overview.put("documentType", asString(classification.get("documentType")));
                overview.put("contractType", asString(classification.get("contractType")));
                overview.put("category", asString(classification.get("category")));
                overview.put("tags", asList(classification.get("tags")));
                overview.put("ownerUserId", entity.getOwnerUserId());
                overview.put("language", asString(classification.get("language")));
                overview.put("region", asString(classification.get("region")));
                overview.put("isNew", asBoolean(classification.get("isNew")));
                overview.put("isContract", asBoolean(classification.get("isContract")));
                entity.setOverview(overview);
                entity.setDocumentType(asString(classification.get("documentType")));
                entity.setCategory(asString(classification.get("category")));
                entity.setLanguage(asString(classification.get("language")));
                entity.setRegion(asString(classification.get("region")));
                entity.setTags(asList(classification.get("tags")));
            }

            entity.setStatus("processed");
            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved content for fileId={}", fileId);
        } catch (Exception e) {
            logger.error("Error processing FILE_CONTENT_EXTRACTED: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.contract-summary-generated}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleContractSummaryGenerated(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        logger.debug("[CONTRACT_SUMMARY_GENERATED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<String, Object> payload = objectMapper.readValue(event, Map.class);
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            FileEntity entity = getOrCreate(fileId);

            // Force document type to CONTRACT
            entity.setDocumentType("CONTRACT");

            // Build comprehensive contract data
            Map<String, Object> contractData = new java.util.HashMap<>();
            
            // Basic contract fields
            contractData.put("effectiveDate", asString(data.get("effectiveDate")));
            contractData.put("expiryDate", asString(data.get("expiryDate")));
            contractData.put("totalValue", asDouble(data.get("totalValue")));
            contractData.put("currency", asString(data.get("currency")));
            contractData.put("summary", asString(data.get("summary")));
            contractData.put("project", asString(data.get("project")));
            contractData.put("department", asString(data.get("department")));
            contractData.put("priority", asString(data.get("priority")));
            contractData.put("confidentiality", asString(data.get("confidentiality")));
            
            // Nested contract structures
            contractData.put("workflow", data.get("workflow") != null ? data.get("workflow") : new java.util.HashMap<>());
            contractData.put("parties", data.get("parties") != null ? data.get("parties") : new java.util.ArrayList<>());
            contractData.put("payment", data.get("payment") != null ? data.get("payment") : new java.util.HashMap<>());
            contractData.put("clauses", data.get("clauses") != null ? data.get("clauses") : new java.util.HashMap<>());
            contractData.put("reminders", data.get("reminders") != null ? data.get("reminders") : new java.util.ArrayList<>());
            contractData.put("risk", data.get("risk") != null ? data.get("risk") : new java.util.HashMap<>());
            contractData.put("compliance", data.get("compliance") != null ? data.get("compliance") : new java.util.HashMap<>());
            
            entity.setContract(contractData);
            
            // Set individual contract fields for backward compatibility
            entity.setEffectiveDate(parseDate(asString(data.get("effectiveDate"))));
            entity.setExpiryDate(parseDate(asString(data.get("expiryDate"))));
            entity.setTotalValue(asDouble(data.get("totalValue")));
            entity.setCurrency(asString(data.get("currency")));
            entity.setSummary(asString(data.get("summary")));
            entity.setProject(asString(data.get("project")));
            entity.setDepartment(asString(data.get("department")));
            entity.setPriority(asString(data.get("priority")));
            entity.setConfidentiality(asString(data.get("confidentiality")));
            
            // Set nested contract fields
            entity.setWorkflow(asMap(data.get("workflow")));
            entity.setParties(asList(data.get("parties")));
            entity.setPayment(asMap(data.get("payment")));
            entity.setClauses(asMap(data.get("clauses")));
            entity.setReminders(asList(data.get("reminders")));
            entity.setRisk(asMap(data.get("risk")));
            entity.setCompliance(asMap(data.get("compliance")));

            // Update overview to reflect contract status
            Map<String, Object> overview = entity.getOverview();
            if (overview == null) overview = new java.util.HashMap<>();
            overview.put("documentType", "CONTRACT");
            overview.put("contractType", asString(data.get("contractType")));
            overview.put("status", "completed");
            overview.put("isContract", true);
            entity.setOverview(overview);

            entity.setStatus("completed");
            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved contract summary for fileId={}", fileId);
        } catch (Exception e) {
            logger.error("Error processing CONTRACT_SUMMARY_GENERATED: {}", e.getMessage(), e);
        }
    }

    private FileEntity getOrCreate(String fileId) {
        Optional<FileEntity> opt = fileRepository.findById(fileId);
        return opt.orElseGet(() -> {
            FileEntity f = new FileEntity();
            f.setId(fileId);
            f.setCreatedAt(LocalDateTime.now());
            f.setIsDeleted(false);
            return f;
        });
    }

    private void touchUpdated(FileEntity e, Map<String, Object> payload) {
        e.setUpdatedAt(LocalDateTime.now());
        Map<String, Object> actor = asMap(payload.get("actor"));
        if (actor != null) e.setUpdatedBy(asString(actor.get("userId")));
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> asMap(Object o) {
        if (o instanceof Map) {
            return (Map<String, Object>) o;
        }
        return null;
    }

    private String asString(Object o) { return o == null ? null : String.valueOf(o); }

    private Long asLong(Object o) {
        if (o instanceof Number) return ((Number) o).longValue();
        try { return o != null ? Long.parseLong(o.toString()) : null; } catch (Exception e) { return null; }
    }

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

    @SuppressWarnings("unchecked")
    private <T> List<T> asList(Object o) {
        if (o instanceof List) return (List<T>) o;
        return new java.util.ArrayList<>();
    }

    private LocalDateTime parseDate(String s) {
        if (s == null || s.isEmpty()) return null;
        try { return OffsetDateTime.parse(s).toLocalDateTime(); } catch (Exception ignored) {}
        try { return LocalDateTime.parse(s, DateTimeFormatter.ISO_LOCAL_DATE_TIME); } catch (Exception ignored) {}
        return null;
    }
}
