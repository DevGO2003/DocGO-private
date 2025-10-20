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

            // Populate nested maps
            entity.setFile(asMap(data.get("file")));
            entity.setStorage(asMap(data.get("storage")));
            entity.setMetadata(asMap(data.get("metadata")));

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

            // Set content and overview
            entity.setContent(asMap(data.get("content")));
            entity.setOverview(asMap(data.get("overview")));

            // Update document type if available
            Map<String, Object> overview = entity.getOverview();
            if (overview != null && overview.get("documentType") != null) {
                entity.setDocumentType(asString(overview.get("documentType")));
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

            // Set contract-specific nested data
            entity.setContract(asMap(data.get("contract")));
            entity.setVersioning(asMap(data.get("versioning")));
            entity.setAudit(asMap(data.get("audit")));

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

    private LocalDateTime parseDate(String s) {
        if (s == null || s.isEmpty()) return null;
        try { return OffsetDateTime.parse(s).toLocalDateTime(); } catch (Exception ignored) {}
        try { return LocalDateTime.parse(s, DateTimeFormatter.ISO_LOCAL_DATE_TIME); } catch (Exception ignored) {}
        return null;
    }
}
