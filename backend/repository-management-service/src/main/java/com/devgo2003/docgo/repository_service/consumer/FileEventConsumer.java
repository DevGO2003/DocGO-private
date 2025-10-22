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

import jakarta.annotation.PostConstruct;
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
    
    @PostConstruct
    public void init() {
        log.info("FileEventConsumer initialized - ready to process Kafka events");
    }

    @KafkaListener(topics = "${app.kafka.topic.file-metadata-recorded}", 
                   groupId = "${spring.kafka.consumer.group-id}",
                   errorHandler = "kafkaErrorHandler")
    public void handleFileMetadataRecorded(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.debug("Processing FILE_METADATA_RECORDED event - size={}", event != null ? event.length() : 0);
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
                if (storageData != null) {
                    // Add location field and enrich s3 data
                    Map<String, Object> s3Data = asMap(storageData.get("s3"));
                    if (s3Data != null) {
                        String bucket = asString(s3Data.get("bucket"));
                        String region = asString(s3Data.get("region"));
                        String objectKey = asString(s3Data.get("objectKey"));
                        String url = asString(s3Data.get("url"));
                        
                        if (bucket != null) {
                            storageData.put("location", "s3://" + bucket + "/" + fileId);
                        }
                        
                        // Enrich s3 data with all available fields
                        Map<String, Object> enrichedS3 = new java.util.HashMap<>();
                        enrichedS3.put("bucket", bucket);
                        enrichedS3.put("region", region);
                        enrichedS3.put("objectKey", objectKey);
                        enrichedS3.put("url", url);
                        enrichedS3.put("contentType", asString(s3Data.get("contentType")));
                        enrichedS3.put("size", asLong(s3Data.get("size")));
                        enrichedS3.put("versionId", asString(s3Data.get("versionId")));
                        
                        // Add checksum if available
                        Map<String, Object> checksum = asMap(s3Data.get("checksum"));
                        if (checksum != null) {
                            enrichedS3.put("checksum", checksum);
                        }
                        
                        storageData.put("s3", enrichedS3);
                        log.debug("Enriched S3 storage for fileId={} with bucket={}, objectKey={}", 
                                  fileId, bucket, objectKey);
                    }
                    entity.setStorage(storageData);
                }
                
                Map<String, Object> metadataData = asMap(data.get("metadata"));
                if (metadataData == null) metadataData = new java.util.HashMap<>();
                
                // Build fileSystem metadata
                Map<String, Object> fileSystem = new java.util.HashMap<>();
                LocalDateTime now = LocalDateTime.now();
                fileSystem.put("dateAdded", now);
                fileSystem.put("dateModified", now);
                fileSystem.put("mediaFilename", entity.getName());
                fileSystem.put("originalFilename", asString(data.get("name")));
                fileSystem.put("originalMD5", asString(fileData != null ? fileData.get("md5") : null));
                fileSystem.put("originalFileSize", entity.getSize());
                fileSystem.put("originalMimeType", entity.getMimeType());
                fileSystem.put("archiveMD5", null);
                fileSystem.put("archiveFileSize", null);
                metadataData.put("fileSystem", fileSystem);
                
                // Build technical metadata with defaults
                Map<String, Object> technical = new java.util.HashMap<>();
                technical.put("encoding", "UTF-8");
                technical.put("lineEnding", "LF");
                technical.put("bom", false);
                technical.put("compression", "NONE");
                technical.put("pages", null);
                technical.put("wordCount", null);
                technical.put("characterCount", null);
                metadataData.put("technical", technical);
                
                entity.setMetadata(metadataData);
                log.debug("Built fileSystem and technical metadata for fileId={}", fileId);
                
                // Create initial overview with basic fields
                Map<String, Object> overviewMap = new java.util.HashMap<>();
                overviewMap.put("title", entity.getName());
                overviewMap.put("status", "uploaded");
                overviewMap.put("ownerUserId", entity.getOwnerUserId() != null ? entity.getOwnerUserId() : "system");
                overviewMap.put("region", "VN"); // Default region
                overviewMap.put("isNew", true); // New file
                overviewMap.put("language", "vi"); // Default language
                entity.setOverview(overviewMap);
                
                // Build audit metadata
                Map<String, Object> auditMap = new java.util.HashMap<>();
                LocalDateTime timestamp = LocalDateTime.now();
                String actor = entity.getOwnerUserId() != null ? entity.getOwnerUserId() : "system";
                
                auditMap.put("createdAt", timestamp);
                auditMap.put("createdBy", actor);
                auditMap.put("lastModifiedAt", timestamp);
                auditMap.put("lastModifiedBy", actor);
                auditMap.put("updatedAt", timestamp);
                auditMap.put("updatedBy", actor);
                auditMap.put("deletedAt", null);
                auditMap.put("deletedBy", null);
                auditMap.put("version", 1);
                auditMap.put("isDeleted", false);
                entity.setAudit(auditMap);
                
                fileRepository.save(entity);
                log.info("Created new entity for fileId={}", fileId);
            } else {
                // Entity đã tồn tại - chỉ update metadata fields, KHÔNG touch content/overview
                Map<String, Object> fileData = asMap(data.get("file"));
                Map<String, Object> storageData = asMap(data.get("storage"));
                if (storageData != null) {
                    // Add location field and enrich s3 data
                    Map<String, Object> s3Data = asMap(storageData.get("s3"));
                    if (s3Data != null) {
                        String bucket = asString(s3Data.get("bucket"));
                        String region = asString(s3Data.get("region"));
                        String objectKey = asString(s3Data.get("objectKey"));
                        String url = asString(s3Data.get("url"));
                        
                        if (bucket != null) {
                            storageData.put("location", "s3://" + bucket + "/" + fileId);
                        }
                        
                        // Enrich s3 data with all available fields
                        Map<String, Object> enrichedS3 = new java.util.HashMap<>();
                        enrichedS3.put("bucket", bucket);
                        enrichedS3.put("region", region);
                        enrichedS3.put("objectKey", objectKey);
                        enrichedS3.put("url", url);
                        enrichedS3.put("contentType", asString(s3Data.get("contentType")));
                        enrichedS3.put("size", asLong(s3Data.get("size")));
                        enrichedS3.put("versionId", asString(s3Data.get("versionId")));
                        
                        // Add checksum if available
                        Map<String, Object> checksum = asMap(s3Data.get("checksum"));
                        if (checksum != null) {
                            enrichedS3.put("checksum", checksum);
                        }
                        
                        storageData.put("s3", enrichedS3);
                        log.debug("Enriched S3 storage for update fileId={} with bucket={}, objectKey={}", 
                                  fileId, bucket, objectKey);
                    }
                }
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

    @KafkaListener(topics = "${app.kafka.topic.file-content-extracted}", 
                   groupId = "${spring.kafka.consumer.group-id}",
                   errorHandler = "kafkaErrorHandler")
    public void handleFileContentExtracted(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.debug("Processing FILE_CONTENT_EXTRACTED event - size={}", event != null ? event.length() : 0);
        try {
            Map<String, Object> payload = objectMapper.readValue(event, Map.class);
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            // Build content object
            String plaintext = asString(data.get("plaintext"));
            Map<String, Object> contentMap = new java.util.HashMap<>();
            contentMap.put("plaintext", plaintext);
            contentMap.put("extractedText", plaintext);
            contentMap.put("summary", asString(data.get("summary")));
            contentMap.put("keyTerms", asList(data.get("keyTerms")));
            contentMap.put("sections", asList(data.get("sections")));
            contentMap.put("ocr", data.get("ocr") != null ? data.get("ocr") : new java.util.HashMap<>());
            contentMap.put("classification", data.get("classification") != null ? data.get("classification") : new java.util.HashMap<>());
            contentMap.put("processing", data.get("processing") != null ? data.get("processing") : new java.util.HashMap<>());
            contentMap.put("jsonContent", data.get("jsonContent"));
            contentMap.put("jsonAnalysisStatus", asString(data.get("jsonAnalysisStatus")));
            
            // Update technical metadata with computed values from plaintext
            Map<String, Object> technical = new java.util.HashMap<>();
            technical.put("encoding", "UTF-8");
            technical.put("lineEnding", detectLineEnding(plaintext));
            technical.put("bom", false);
            technical.put("compression", "NONE");
            technical.put("pages", null); // null for non-PDF
            technical.put("wordCount", computeWordCount(plaintext));
            technical.put("characterCount", plaintext != null ? plaintext.length() : null);
            
            Map<String, Object> metadataUpdate = new java.util.HashMap<>();
            metadataUpdate.put("technical", technical);
            log.debug("Computed technical metadata: wordCount={}, characterCount={}", 
                      technical.get("wordCount"), technical.get("characterCount"));

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
                
                // Set region with default "VN" if null
                String region = asString(classification.get("region"));
                overviewMap.put("region", region != null ? region : "VN");
                
                // Get ownerUserId from existing entity
                FileEntity existingEntity = fileRepository.findById(fileId).orElse(null);
                if (existingEntity != null) {
                    overviewMap.put("ownerUserId", existingEntity.getOwnerUserId());
                    
                    // Calculate isNew based on creation time (< 24h)
                    LocalDateTime createdAt = existingEntity.getCreatedAt();
                    boolean isNew = createdAt != null && 
                        createdAt.isAfter(LocalDateTime.now().minusHours(24));
                    overviewMap.put("isNew", isNew);
                } else {
                    // Fallback if entity not found
                    overviewMap.put("ownerUserId", "system");
                    overviewMap.put("isNew", true);
                }
                
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

    @KafkaListener(topics = "${app.kafka.topic.contract-summary-generated}", 
                   groupId = "${spring.kafka.consumer.group-id}",
                   errorHandler = "kafkaErrorHandler")
    public void handleContractSummaryGenerated(@Payload String event, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        log.debug("Processing CONTRACT_SUMMARY_GENERATED event - size={}", event != null ? event.length() : 0);
        try {
            Map<String, Object> payload = objectMapper.readValue(event, Map.class);
            Map<String, Object> data = asMap(payload.get("data"));
            if (data == null) return;

            String fileId = asString(data.get("fileId"));
            if (fileId == null) return;

            // Build comprehensive contract data from summaryResult, contractMetadata, or data fields
            Map<String, Object> summaryResult = asMap(data.get("summaryResult"));
            if (summaryResult == null) {
                summaryResult = asMap(data.get("contractMetadata")); // Try contractMetadata
            }
            if (summaryResult == null) {
                summaryResult = data; // Fallback to data if no summaryResult/contractMetadata
            }
            
            log.debug("Processing contract summary for fileId={}, has summaryResult={}", 
                      fileId, summaryResult != data);
            
            Map<String, Object> contractData = new java.util.HashMap<>();
            
            // Basic contract fields
            contractData.put("effectiveDate", asString(summaryResult.get("effectiveDate")));
            contractData.put("expiryDate", asString(summaryResult.get("expiryDate")));
            contractData.put("totalValue", asDouble(summaryResult.get("totalValue")));
            contractData.put("currency", asString(summaryResult.get("currency")));
            contractData.put("summary", asString(summaryResult.get("summary")));
            contractData.put("project", asString(summaryResult.get("project")));
            contractData.put("department", asString(summaryResult.get("department")));
            contractData.put("priority", asString(summaryResult.get("priority")));
            contractData.put("confidentiality", asString(summaryResult.get("confidentiality")));
            
            // Workflow - default empty if not present
            Map<String, Object> workflow = asMap(summaryResult.get("workflow"));
            if (workflow == null) workflow = new java.util.HashMap<>();
            contractData.put("workflow", workflow);
            
            // Parties - extract and map properly
            List<Object> parties = asList(summaryResult.get("parties"));
            if (parties != null && !parties.isEmpty()) {
                log.debug("Mapping {} parties for contract", parties.size());
                contractData.put("parties", parties);
            } else {
                contractData.put("parties", new java.util.ArrayList<>());
            }
            
            // Payment - extract payment info
            Map<String, Object> payment = asMap(summaryResult.get("payment"));
            if (payment == null) payment = new java.util.HashMap<>();
            contractData.put("payment", payment);
            
            // Clauses - extract clauses
            Map<String, Object> clauses = asMap(summaryResult.get("clauses"));
            if (clauses == null) clauses = new java.util.HashMap<>();
            contractData.put("clauses", clauses);
            
            // Reminders - extract reminders
            List<Object> reminders = asList(summaryResult.get("reminders"));
            if (reminders == null) reminders = new java.util.ArrayList<>();
            contractData.put("reminders", reminders);
            
            // Risk analysis
            Map<String, Object> risk = asMap(summaryResult.get("risk"));
            if (risk == null) risk = new java.util.HashMap<>();
            contractData.put("risk", risk);
            
            // Compliance
            Map<String, Object> compliance = asMap(summaryResult.get("compliance"));
            if (compliance == null) compliance = new java.util.HashMap<>();
            contractData.put("compliance", compliance);
            
            log.info("Built contract data with {} parties, {} reminders, has payment={}, has risk={}, has compliance={}", 
                     parties != null ? parties.size() : 0,
                     reminders != null ? reminders.size() : 0,
                     !payment.isEmpty(), !risk.isEmpty(), !compliance.isEmpty());

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
    
    private String detectLineEnding(String text) {
        if (text == null) return "LF";
        if (text.contains("\r\n")) return "CRLF";
        if (text.contains("\n")) return "LF";
        return "LF";
    }
    
    private Integer computeWordCount(String text) {
        if (text == null || text.isEmpty()) return null;
        String[] words = text.trim().split("\\s+");
        return words.length > 0 && !words[0].isEmpty() ? words.length : null;
    }
}
