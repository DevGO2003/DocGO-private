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
        logger.info("[FILE_METADATA_RECORDED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<?, ?> payload = objectMapper.readValue(event, Map.class);
            Map<?, ?> data = (Map<?, ?>) payload.get("data");
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            FileEntity entity = getOrCreate(fileId);
            entity.setName(asString(or(data.get("name"), data.get("fileName"))));
            entity.setMimeType(asString(or(data.get("contentType"), data.get("mimeType"))));
            entity.setSize(asLong(data.get("size")));
            entity.setOwnerUserId(asString(data.get("ownerUserId")));
            entity.setStatus("uploaded");

            Map<?, ?> storage = (Map<?, ?>) data.get("storage");
            if (storage != null) {
                Map<?, ?> s3 = (Map<?, ?>) storage.get("s3");
                Map<?, ?> local = (Map<?, ?>) storage.get("local");
                entity.setS3((Map) s3);
                entity.setLocal((Map) local);
            }

            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved metadata fileId={}", fileId);
        } catch (Exception e) {
            logger.error("Error processing FILE_METADATA_RECORDED: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.file-plaintext-extracted}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleFilePlaintextExtracted(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        logger.info("[FILE_PLAINTEXT_EXTRACTED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<?, ?> payload = objectMapper.readValue(event, Map.class);
            Map<?, ?> data = (Map<?, ?>) payload.get("data");
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            FileEntity entity = getOrCreate(fileId);
            entity.setPlaintext(asString(data.get("plaintext")));

            Map<?, ?> ocr = (Map<?, ?>) data.get("ocr");
            if (ocr != null) entity.setOcr((Map) ocr);

            Map<?, ?> classification = (Map<?, ?>) data.get("classification");
            if (classification != null) {
                entity.setClassification((Map) classification);
                Object isContract = classification.get("isContract");
                if (Boolean.TRUE.equals(isContract) || "true".equalsIgnoreCase(asString(isContract))) {
                    entity.setDocumentType("CONTRACT");
                }
                Object subtype = classification.get("contractSubtype");
                if (subtype != null) {
                    entity.setContractType(asString(subtype));
                }
            }

            Map<?, ?> processing = (Map<?, ?>) data.get("processing");
            if (processing != null) entity.setProcessing((Map) processing);

            entity.setStatus("processed");
            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved plaintext fileId={}", fileId);
        } catch (Exception e) {
            logger.error("Error processing FILE_PLAINTEXT_EXTRACTED: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.contract-summary-generated}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleContractSummaryGenerated(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        logger.info("[CONTRACT_SUMMARY_GENERATED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<?, ?> payload = objectMapper.readValue(event, Map.class);
            Map<?, ?> data = (Map<?, ?>) payload.get("data");
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            FileEntity entity = getOrCreate(fileId);
            entity.setSummary(asString(data.get("summary")));
            // Ensure documentType is CONTRACT for contract summary events
            entity.setDocumentType("CONTRACT");

            Map<?, ?> meta = (Map<?, ?>) data.get("contractMetadata");
            if (meta != null) {
                entity.setEffectiveDate(parseDate(asString(meta.get("effectiveDate"))));
                entity.setExpiryDate(parseDate(asString(meta.get("expiryDate"))));
                entity.setTotalValue(asDouble(meta.get("totalValue")));
                entity.setCurrency(asString(meta.get("currency")));
                entity.setContractType(asString(meta.get("contractType")));
            }

            entity.setStatus("completed");
            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved summary fileId={}", fileId);
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

    private void touchUpdated(FileEntity e, Map<?, ?> payload) {
        e.setUpdatedAt(LocalDateTime.now());
        Map<?, ?> actor = (Map<?, ?>) payload.get("actor");
        if (actor != null) e.setUpdatedBy(asString(actor.get("userId")));
    }

    private Object or(Object a, Object b) { return a != null ? a : b; }
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
