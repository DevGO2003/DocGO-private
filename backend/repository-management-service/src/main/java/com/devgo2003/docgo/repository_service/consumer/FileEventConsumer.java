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
            
            // Basic file info
            entity.setName(asString(data.get("name")));
            entity.setMimeType(asString(data.get("contentType")));
            entity.setSize(asLong(data.get("size")));
            entity.setOwnerUserId(asString(data.get("ownerUserId")));
            entity.setStatus(asString(data.get("status")));
            entity.setVersion(asLong(data.get("version")));

            // Hash information
            Map<?, ?> hash = (Map<?, ?>) data.get("hash");
            if (hash != null) {
                entity.setHash((Map) hash);
            }

            // Permissions
            Map<?, ?> permissions = (Map<?, ?>) data.get("permissions");
            if (permissions != null) {
                entity.setPermissions((Map) permissions);
            }

            // Security
            Map<?, ?> security = (Map<?, ?>) data.get("security");
            if (security != null) {
                entity.setSecurity((Map) security);
            }

            // Storage information
            Map<?, ?> storage = (Map<?, ?>) data.get("storage");
            if (storage != null) {
                entity.setStorage((Map) storage);
                Map<?, ?> s3 = (Map<?, ?>) storage.get("s3");
                Map<?, ?> local = (Map<?, ?>) storage.get("local");
                entity.setS3((Map) s3);
                entity.setLocal((Map) local);
            }

            // File system metadata
            Map<?, ?> fileSystem = (Map<?, ?>) data.get("fileSystem");
            if (fileSystem != null) {
                entity.setFileSystem((Map) fileSystem);
            }

            // Technical metadata
            Map<?, ?> technical = (Map<?, ?>) data.get("technical");
            if (technical != null) {
                entity.setTechnical((Map) technical);
            }

            // Original document metadata
            Map<?, ?> originalDocument = (Map<?, ?>) data.get("originalDocument");
            if (originalDocument != null) {
                entity.setOriginalDocument((Map) originalDocument);
            }

            // Archived document metadata
            Map<?, ?> archivedDocument = (Map<?, ?>) data.get("archivedDocument");
            if (archivedDocument != null) {
                entity.setArchivedDocument((Map) archivedDocument);
            }

            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved metadata fileId={} with enhanced structure", fileId);
        } catch (Exception e) {
            logger.error("Error processing FILE_METADATA_RECORDED: {}", e.getMessage(), e);
        }
    }

    @KafkaListener(topics = "${app.kafka.topic.file-plaintext-extracted}", groupId = "${spring.kafka.consumer.group-id}")
    public void handleFilePlaintextExtracted(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        logger.info("[FILE_CONTENT_EXTRACTED] topic={} payloadSize={}", topic, event != null ? event.length() : 0);
        try {
            Map<?, ?> payload = objectMapper.readValue(event, Map.class);
            Map<?, ?> data = (Map<?, ?>) payload.get("data");
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            FileEntity entity = getOrCreate(fileId);
            
            // Content information
            entity.setPlaintext(asString(data.get("plaintext")));
            entity.setExtractedText(asString(data.get("extractedText")));
            entity.setSummary(asString(data.get("summary")));

            // Key terms and sections
            entity.setKeyTerms((Map) data.get("keyTerms"));
            entity.setSections((Map) data.get("sections"));

            // OCR information
            Map<?, ?> ocr = (Map<?, ?>) data.get("ocr");
            if (ocr != null) {
                entity.setOcr((Map) ocr);
            }

            // JSON content
            entity.setJsonContent((Map) data.get("jsonContent"));
            entity.setJsonAnalysisStatus(asString(data.get("jsonAnalysisStatus")));

            // Classification information
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

            // Processing status
            Map<?, ?> processing = (Map<?, ?>) data.get("processing");
            if (processing != null) {
                entity.setProcessing((Map) processing);
            }

            // Overview information
            Map<?, ?> overview = (Map<?, ?>) data.get("overview");
            if (overview != null) {
                entity.setOverview((Map) overview);
                // Update document type from overview
                String docType = asString(overview.get("documentType"));
                if (docType != null) {
                    entity.setDocumentType(docType);
                }
                String contractType = asString(overview.get("contractType"));
                if (contractType != null) {
                    entity.setContractType(contractType);
                }
            }

            entity.setStatus("processed");
            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved content fileId={} with enhanced structure", fileId);
        } catch (Exception e) {
            logger.error("Error processing FILE_CONTENT_EXTRACTED: {}", e.getMessage(), e);
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
            
            // Contract summary
            entity.setSummary(asString(data.get("summary")));
            entity.setDocumentType("CONTRACT");

            // Contract metadata
            Map<?, ?> contractMetadata = (Map<?, ?>) data.get("contractMetadata");
            if (contractMetadata != null) {
                entity.setEffectiveDate(parseDate(asString(contractMetadata.get("effectiveDate"))));
                entity.setExpiryDate(parseDate(asString(contractMetadata.get("expiryDate"))));
                entity.setTotalValue(asDouble(contractMetadata.get("totalValue")));
                entity.setCurrency(asString(contractMetadata.get("currency")));
                entity.setContractType(asString(contractMetadata.get("contractType")));
            }

            // Workflow information
            Map<?, ?> workflow = (Map<?, ?>) data.get("workflow");
            if (workflow != null) {
                entity.setWorkflow((Map) workflow);
            }

            // Parties information
            entity.setParties((Map) data.get("parties"));

            // Payment information
            Map<?, ?> payment = (Map<?, ?>) data.get("payment");
            if (payment != null) {
                entity.setPayment((Map) payment);
            }

            // Clauses information
            Map<?, ?> clauses = (Map<?, ?>) data.get("clauses");
            if (clauses != null) {
                entity.setClauses((Map) clauses);
            }

            // Reminders
            entity.setReminders((Map) data.get("reminders"));

            // Risk assessment
            Map<?, ?> risk = (Map<?, ?>) data.get("risk");
            if (risk != null) {
                entity.setRisk((Map) risk);
            }

            // Compliance information
            Map<?, ?> compliance = (Map<?, ?>) data.get("compliance");
            if (compliance != null) {
                entity.setCompliance((Map) compliance);
            }

            // Versioning information
            Map<?, ?> versioning = (Map<?, ?>) data.get("versioning");
            if (versioning != null) {
                entity.setVersioning((Map) versioning);
            }

            // Audit information
            Map<?, ?> audit = (Map<?, ?>) data.get("audit");
            if (audit != null) {
                entity.setAudit((Map) audit);
            }

            entity.setStatus("completed");
            touchUpdated(entity, payload);
            fileRepository.save(entity);
            logger.info("Saved contract summary fileId={} with enhanced structure", fileId);
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
