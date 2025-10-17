package com.devgo2003.docgo.file_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.devgo2003.docgo.file_service.entity.FileEntity;
import com.devgo2003.docgo.file_service.dto.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;

@Service
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(name = "spring.kafka.enabled", havingValue = "true", matchIfMissing = false)
public class ContractKafkaService {

    private static final Logger logger = LoggerFactory.getLogger(ContractKafkaService.class);

    @Autowired
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.contract-events-topic:contract.events}")
    private String contractEventsTopic;

    @Autowired
    private ObjectMapper objectMapper;
    
    @Autowired
    private FileService fileService;

    /**
     * Consume File Events từ Automation Service
     */
    @KafkaListener(topics = {
        "${app.kafka.topic.file-uploaded:file.uploaded}",
        "${app.kafka.topic.file-processed:file.processed}",
        "${app.kafka.topic.file-updated:file.updated}",
        "${app.kafka.topic.file-classified:file.classified}",
        "${app.kafka.topic.file-analyzed:file.analyzed}",
        "${app.kafka.topic.file-deleted:file.deleted}"
    }, groupId = "file-management-service-group")
    public void handleFileEvents(@Payload String message, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            String eventType = (String) event.get("eventType");
            
            logger.info("Received file event type: {} from topic: {}", eventType, topic);
            
            if ("FileUploaded".equals(eventType)) {
                processFileUploaded(event);
            } else if ("FileProcessed".equals(eventType)) {
                processFileProcessed(event);
            } else if ("FileUpdated".equals(eventType)) {
                processFileUpdated(event);
            } else if ("FileClassified".equals(eventType)) {
                processFileClassified(event);
            } else if ("FileAnalyzed".equals(eventType)) {
                processFileAnalyzed(event);
            } else if ("FileDeleted".equals(eventType)) {
                processFileDeleted(event);
            } else {
                logger.info("Unhandled file event type: {}", eventType);
            }
        } catch (Exception e) {
            logger.error("Error processing file event: {}", e.getMessage(), e);
        }
    }

    private void processFileUploaded(Map<String, Object> event) {
        try {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            String fileId = (String) data.get("id");
            
            logger.info("Processing FileUploaded event for file: {}", fileId);
            
            // Tạo FileEntity từ Kafka event
            FileEntity fileEntity = new FileEntity();
            fileEntity.setId(fileId);
            
            // Tạo Overview
            Overview overview = new Overview();
            overview.setTitle((String) data.get("filename"));
            overview.setStatus("UPLOADED");
            overview.setDocumentType("GENERAL_FILE");
            overview.setOwnerUserId("system");
            overview.setIsNew(true);
            fileEntity.setOverview(overview);
            
            // Tạo FileInfo
            FileInfo fileInfo = new FileInfo();
            fileInfo.setId(fileId);
            fileInfo.setName((String) data.get("filename"));
            fileInfo.setType((String) data.get("contentType"));
            fileInfo.setSize(((Number) data.get("size")).longValue());
            fileInfo.setVersion(1);
            fileEntity.setFile(fileInfo);
            
            // Tạo Storage
            Storage storage = new Storage();
            Map<String, Object> storageData = (Map<String, Object>) data.get("storage");
            if (storageData != null) {
                S3Info s3Info = new S3Info();
                s3Info.setUrl((String) storageData.get("url"));
                s3Info.setType((String) storageData.get("type"));
                storage.setS3(s3Info);
            }
            fileEntity.setStorage(storage);
            
            // Tạo Audit
            Audit audit = new Audit();
            audit.setCreatedAt(Instant.now().toString());
            audit.setCreatedBy("system");
            audit.setUpdatedAt(Instant.now().toString());
            audit.setUpdatedBy("system");
            audit.setIsDeleted(false);
            audit.setVersion(1);
            fileEntity.setAudit(audit);
            
            // Lưu vào MongoDB
            fileService.saveFile(fileEntity);
            
            logger.info("File entity saved to MongoDB for file: {}", fileId);
            
        } catch (Exception e) {
            logger.error("Error processing FileUploaded event: {}", e.getMessage(), e);
        }
    }

    private void processFileProcessed(Map<String, Object> event) {
        try {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            String fileId = (String) data.get("id");
            
            logger.info("Processing FileProcessed event for file: {}", fileId);
            
            // Tìm file entity hiện tại
            Optional<FileEntity> existingFile = fileService.getFileById(fileId);
            if (existingFile.isPresent()) {
                FileEntity fileEntity = existingFile.get();
                
                // Cập nhật Content block
                Content content = new Content();
                Map<String, Object> processing = (Map<String, Object>) data.get("processing");
                if (processing != null) {
                    Map<String, Object> ocr = (Map<String, Object>) processing.get("ocr");
                    if (ocr != null) {
                        OcrInfo ocrInfo = new OcrInfo();
                        ocrInfo.setText((String) ocr.get("text"));
                        ocrInfo.setStatus((String) ocr.get("status"));
                        content.setOcr(ocrInfo);
                    }
                    
                    Map<String, Object> classification = (Map<String, Object>) processing.get("classification");
                    content.setClassification(classification);
                    
                    ProcessingInfo processingInfo = new ProcessingInfo();
                    processingInfo.setStatus((String) processing.get("status"));
                    content.setProcessing(processingInfo);
                }
                fileEntity.setContent(content);
                
                // Cập nhật Audit
                if (fileEntity.getAudit() != null) {
                    fileEntity.getAudit().setUpdatedAt(Instant.now().toString());
                    fileEntity.getAudit().setUpdatedBy("system");
                }
                
                // Lưu lại
                fileService.saveFile(fileEntity);
                
                logger.info("File entity updated with processing data for file: {}", fileId);
            } else {
                logger.warn("File entity not found for processing update: {}", fileId);
            }
            
        } catch (Exception e) {
            logger.error("Error processing FileProcessed event: {}", e.getMessage(), e);
        }
    }

    private void processFileUpdated(Map<String, Object> event) {
        try {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            String fileId = (String) data.get("id");
            String updateType = (String) data.get("updateType");
            
            logger.info("Processing FileUpdated event for file: {} with updateType: {}", fileId, updateType);
            
            if ("contract_analysis".equals(updateType)) {
                Map<String, Object> contract = (Map<String, Object>) data.get("contract");
                logger.info("Contract analysis received: {}", objectMapper.writeValueAsString(contract));
                // TODO: Store contract analysis data
            }
            
        } catch (Exception e) {
            logger.error("Error processing FileUpdated event: {}", e.getMessage(), e);
        }
    }

    private void processFileClassified(Map<String, Object> event) {
        try {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            String fileId = (String) data.get("id");
            
            logger.info("Processing FileClassified event for file: {}", fileId);
            // TODO: Update file classification
            
        } catch (Exception e) {
            logger.error("Error processing FileClassified event: {}", e.getMessage(), e);
        }
    }

    private void processFileAnalyzed(Map<String, Object> event) {
        try {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            String fileId = (String) data.get("id");
            
            logger.info("Processing FileAnalyzed event for file: {}", fileId);
            // TODO: Store analysis results
            
        } catch (Exception e) {
            logger.error("Error processing FileAnalyzed event: {}", e.getMessage(), e);
        }
    }

    private void processFileDeleted(Map<String, Object> event) {
        try {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            String fileId = (String) data.get("id");
            
            logger.info("Processing FileDeleted event for file: {}", fileId);
            // TODO: Mark file as deleted
            
        } catch (Exception e) {
            logger.error("Error processing FileDeleted event: {}", e.getMessage(), e);
        }
    }

    /**
     * Xử lý SummaryCreated event và tạo/cập nhật hợp đồng
     */
    private void processSummaryCreated(Map<String, Object> event) {
        try {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            Map<String, Object> actor = (Map<String, Object>) event.get("actor");
            
            String fileId = (String) data.get("fileId");
            String filename = (String) data.get("filename");
            String summary = (String) data.get("summary");
            
            // TODO: Tạo hoặc cập nhật hợp đồng trong database
            // Hiện tại chỉ log và publish event
            
            logger.info("Processing contract for file: {} with summary: {}", filename, summary);
            
            // Publish contract-updated event
            publishContractUpdated(event, data, actor, fileId);
            
        } catch (Exception e) {
            logger.error("Error processing contract from summary: {}", e.getMessage(), e);
        }
    }

    /**
     * Publish contract-updated event
     */
    private void publishContractUpdated(Map<String, Object> originalEvent, Map<String, Object> data, Map<String, Object> actor, String fileId) {
        try {
            Map<String, Object> contractUpdatedEvent = new HashMap<>();
            contractUpdatedEvent.put("eventVersion", "v1");
            contractUpdatedEvent.put("eventType", "ContractUpdated");
            contractUpdatedEvent.put("eventId", UUID.randomUUID().toString());
            contractUpdatedEvent.put("timestamp", ZonedDateTime.now().toString());
            contractUpdatedEvent.put("source", "file-management-service");
            contractUpdatedEvent.put("correlationId", originalEvent.get("correlationId"));
            contractUpdatedEvent.put("actor", actor);
            
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("fileId", data.get("fileId"));
            eventData.put("filename", data.get("filename"));
            eventData.put("contractId", UUID.randomUUID().toString()); // TODO: Use actual contract ID
            eventData.put("status", "PROCESSED");
            eventData.put("summary", data.get("summary"));
            eventData.put("processedAt", ZonedDateTime.now().toString());
            eventData.put("processedBy", actor.get("userId"));
            
            contractUpdatedEvent.put("data", eventData);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("serviceVersion", "1.0.0");
            metadata.put("processingTime", ZonedDateTime.now().toString());
            contractUpdatedEvent.put("metadata", metadata);

            // Publish to contract events topic
            kafkaTemplate.send(contractEventsTopic, fileId, contractUpdatedEvent);
            
            logger.info("✅ Published ContractUpdated event for file: {}", data.get("filename"));
            
        } catch (Exception e) {
            logger.error("❌ Failed to publish ContractUpdated event: {}", e.getMessage(), e);
        }
    }
}
