package com.devgo2003.docgo.repository_service.consumer;

import com.devgo2003.docgo.repository_service.entity.FileEntity;
import com.devgo2003.docgo.repository_service.repository.FileRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import com.devgo2003.docgo.repository_service.service.FileUpdateService;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@Component
@Slf4j
public class FileEventConsumer {

    private final FileRepository fileRepository;
    private final FileUpdateService fileUpdateService;
    private final ObjectMapper objectMapper;

    @Autowired
    public FileEventConsumer(FileRepository fileRepository, FileUpdateService fileUpdateService) {
        this.fileRepository = fileRepository;
        this.fileUpdateService = fileUpdateService;
        this.objectMapper = new ObjectMapper();
    }

    @KafkaListener(topics = "${app.kafka.topic.file-metadata-recorded}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleFileMetadataRecorded(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.debug("[FILE_METADATA_RECORDED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<String, Object> payload = objectMapper.readValue(event, Map.class);
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            // Check entity đã tồn tại chưa
            boolean exists = fileRepository.existsById(fileId);
            
            if (!exists) {
                // Tạo mới entity lần đầu
                FileEntity entity = new FileEntity();
                entity.setId(fileId);
                entity.setName(asString(data.get("name")));
                entity.setMimeType(asString(data.get("contentType")));
                entity.setSize(asLong(data.get("size")));
                entity.setOwnerUserId(asString(data.get("ownerUserId")));
                entity.setStatus("uploaded");
                entity.setCreatedAt(parseDate(asString(payload.get("timestamp"))));
                entity.setIsDeleted(false);
                
                Map<String, Object> actor = asMap(payload.get("actor"));
                if (actor != null) {
                    entity.setCreatedBy(asString(actor.get("userId")));
                }
                
                Map<String, Object> fileData = asMap(data.get("file"));
                if (fileData != null) entity.setFile(fileData);
                
                Map<String, Object> storageData = asMap(data.get("storage"));
                if (storageData != null) entity.setStorage(storageData);
                
                Map<String, Object> metadataData = asMap(data.get("metadata"));
                if (metadataData != null) entity.setMetadata(metadataData);
                
                Map<String, Object> auditMap = new java.util.HashMap<>();
                auditMap.put("createdAt", entity.getCreatedAt());
                auditMap.put("createdBy", entity.getCreatedBy());
                auditMap.put("version", 1);
                auditMap.put("isDeleted", false);
                entity.setAudit(auditMap);
                
                fileRepository.save(entity);
                log.info("Created new entity for fileId={}", fileId);
            } else {
                // Entity đã tồn tại - chỉ update metadata fields, KHÔNG touch content/overview
                Map<String, Object> fileData = asMap(data.get("file"));
                Map<String, Object> storageData = asMap(data.get("storage"));
                Map<String, Object> metadataData = asMap(data.get("metadata"));
                
                Map<String, Object> auditMap = new java.util.HashMap<>();
                auditMap.put("lastModifiedAt", LocalDateTime.now());
                Map<String, Object> actor = asMap(payload.get("actor"));
                if (actor != null) {
                    auditMap.put("lastModifiedBy", asString(actor.get("userId")));
                }
                auditMap.put("version", 1);
                auditMap.put("isDeleted", false);
                
                fileUpdateService.updateMetadataFields(
                    fileId,
                    fileData,
                    storageData,
                    metadataData,
                    auditMap,
                    asString(data.get("name")),
                    asString(data.get("contentType")),
                    asLong(data.get("size")),
                    asString(data.get("ownerUserId")),
                    "uploaded"
                );
                log.info("Updated metadata for fileId={}", fileId);
            }
        } catch (Exception e) {
            log.error("Error processing FILE_METADATA_RECORDED: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.file-content-extracted}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleFileContentExtracted(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.debug("[FILE_CONTENT_EXTRACTED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<String, Object> payload = objectMapper.readValue(event, Map.class);
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            // Build content object
            Map<String, Object> contentMap = new java.util.HashMap<>();
            contentMap.put("plaintext", asString(data.get("plaintext")));
            contentMap.put("extractedText", asString(data.get("plaintext")));
            contentMap.put("summary", asString(data.get("summary")));
            contentMap.put("keyTerms", asList(data.get("keyTerms")));
            contentMap.put("sections", asList(data.get("sections")));
            contentMap.put("ocr", data.get("ocr") != null ? data.get("ocr") : new java.util.HashMap<>());
            contentMap.put("classification", data.get("classification") != null ? data.get("classification") : new java.util.HashMap<>());
            contentMap.put("processing", data.get("processing") != null ? data.get("processing") : new java.util.HashMap<>());
            contentMap.put("jsonContent", data.get("jsonContent"));
            contentMap.put("jsonAnalysisStatus", asString(data.get("jsonAnalysisStatus")));

            // Build overview object
            Map<String, Object> overviewMap = new java.util.HashMap<>();
            Map<String, Object> classification = asMap(data.get("classification"));
            if (classification != null) {
                overviewMap.put("title", asString(data.get("title")));
                overviewMap.put("status", "processed");
                overviewMap.put("documentType", asString(classification.get("documentType")));
                overviewMap.put("contractType", asString(classification.get("contractType")));
                overviewMap.put("category", asString(classification.get("category")));
                overviewMap.put("tags", asList(classification.get("tags")));
                overviewMap.put("language", asString(classification.get("language")));
                overviewMap.put("region", asString(classification.get("region")));
                overviewMap.put("isNew", asBoolean(classification.get("isNew")));
                overviewMap.put("isContract", asBoolean(classification.get("isContract")));
            }

            // Chỉ update content/overview fields - KHÔNG touch metadata
            fileUpdateService.updateContentFields(
                fileId,
                contentMap,
                overviewMap,
                "processed",
                LocalDateTime.now()
            );
            
            log.info("Updated content for fileId={}", fileId);
        } catch (Exception e) {
            log.error("Error processing FILE_CONTENT_EXTRACTED: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.contract-summary-generated}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleContractSummaryGenerated(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.debug("[CONTRACT_SUMMARY_GENERATED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<String, Object> payload = objectMapper.readValue(event, Map.class);
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            // Build comprehensive contract data
            Map<String, Object> contractData = new java.util.HashMap<>();
            contractData.put("effectiveDate", asString(data.get("effectiveDate")));
            contractData.put("expiryDate", asString(data.get("expiryDate")));
            contractData.put("totalValue", asDouble(data.get("totalValue")));
            contractData.put("currency", asString(data.get("currency")));
            contractData.put("summary", asString(data.get("summary")));
            contractData.put("project", asString(data.get("project")));
            contractData.put("department", asString(data.get("department")));
            contractData.put("priority", asString(data.get("priority")));
            contractData.put("confidentiality", asString(data.get("confidentiality")));
            contractData.put("workflow", data.get("workflow") != null ? data.get("workflow") : new java.util.HashMap<>());
            contractData.put("parties", data.get("parties") != null ? data.get("parties") : new java.util.ArrayList<>());
            contractData.put("payment", data.get("payment") != null ? data.get("payment") : new java.util.HashMap<>());
            contractData.put("clauses", data.get("clauses") != null ? data.get("clauses") : new java.util.HashMap<>());
            contractData.put("reminders", data.get("reminders") != null ? data.get("reminders") : new java.util.ArrayList<>());
            contractData.put("risk", data.get("risk") != null ? data.get("risk") : new java.util.HashMap<>());
            contractData.put("compliance", data.get("compliance") != null ? data.get("compliance") : new java.util.HashMap<>());

            // Chỉ update contract fields - KHÔNG touch metadata/content
            fileUpdateService.updateContractFields(
                fileId,
                contractData,
                "CONTRACT",
                "completed",
                LocalDateTime.now()
            );
            
            log.info("Updated contract for fileId={}", fileId);
        } catch (Exception e) {
            log.error("Error processing CONTRACT_SUMMARY_GENERATED: {}", e.getMessage(), e);
        }
    }

    private FileEntity getOrCreate(String fileId) {
        // Always fetch fresh from DB to get latest data from other events
        Optional<FileEntity> opt = fileRepository.findById(fileId);
        if (opt.isPresent()) {
            log.debug("Loading existing entity for fileId={}", fileId);
            return opt.get();
        }
        
        // Create new if not exists
        FileEntity f = new FileEntity();
        f.setId(fileId);
        f.setCreatedAt(LocalDateTime.now());
        f.setIsDeleted(false);
        log.debug("Creating new entity for fileId={}", fileId);
        return f;
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

    @SuppressWarnings("unchecked")
    private Map<String, String> asHashMap(Object o) {
        if (o == null) return null;
        if (o instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) o;
            Map<String, String> result = new java.util.HashMap<>();
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                result.put(entry.getKey(), entry.getValue() != null ? String.valueOf(entry.getValue()) : null);
            }
            return result;
        }
        return null;
    }

    @SuppressWarnings("unchecked")
    private Map<String, List<String>> asPermissionsMap(Object o) {
        if (o == null) return null;
        if (o instanceof Map) {
            Map<String, Object> map = (Map<String, Object>) o;
            Map<String, List<String>> result = new java.util.HashMap<>();
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                result.put(entry.getKey(), asList(entry.getValue()));
            }
            return result;
        }
        return null;
    }
}
