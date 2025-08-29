package com.devgo2003.docgo.contract_service.service;

import com.devgo2003.docgo.contract_service.entity.Contract;
import com.devgo2003.docgo.contract_service.entity.ContractAttachment;
import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;

@Service
public class ContractKafkaService {

    private static final Logger logger = LoggerFactory.getLogger(ContractKafkaService.class);

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Value("${kafka.contract-events-topic:contract.events}")
    private String contractEventsTopic;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ContractService contractService;

    /**
     * Consume SummaryCreated events từ AI Processing Service
     */
    @KafkaListener(topics = "${kafka.ai-events-topic:ai.events}", groupId = "contract-management-service-group")
    public void handleSummaryCreated(@Payload String message, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        try {
            Map<String, Object> event = objectMapper.readValue(message, Map.class);
            String eventType = (String) event.get("eventType");
            
            if ("SummaryCreated".equals(eventType)) {
                logger.info("Received SummaryCreated event: {}", event);
                processSummaryCreated(event);
            }
        } catch (Exception e) {
            logger.error("Error processing SummaryCreated event: {}", e.getMessage(), e);
        }
    }

    /**
     * Xử lý SummaryCreated event và tạo/cập nhật hợp đồng
     */
    @Transactional
    private void processSummaryCreated(Map<String, Object> event) {
        try {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            Map<String, Object> actor = (Map<String, Object>) event.get("actor");
            
            String fileId = (String) data.get("fileId");
            String filename = (String) data.get("filename");
            String summary = (String) data.get("summary");
            
            logger.info("Processing contract for file: {} with summary: {}", filename, summary);
            
            // Tạo hợp đồng mới trong database
            Contract contract = new Contract();
            contract.setTitle("Hợp đồng từ file: " + filename);
            contract.setStatus(Contract.ContractStatus.DRAFT);
            contract.setSummary(summary);
            contract.setContractType("AUTO_GENERATED");
            contract.setAiProcessed(true);
            contract.setProcessingStatus(Contract.ProcessingStatus.COMPLETED);
            contract.setSystemId(fileId);
            
            // Tạo hợp đồng
            Contract savedContract = contractService.createContract(contract);
            
            logger.info("✅ Created contract with ID: {} for file: {}", savedContract.getId(), filename);
            
            // Lưu thông tin summary chi tiết vào bảng contract_summaries
            saveContractSummary(savedContract.getId(), data, event);
            
            // Publish contract-updated event
            publishContractUpdated(event, data, actor, fileId, savedContract.getId());
            
        } catch (Exception e) {
            logger.error("Error processing contract from summary: {}", e.getMessage(), e);
        }
    }

    /**
     * Lưu thông tin summary chi tiết vào database
     */
    private void saveContractSummary(Long contractId, Map<String, Object> data, Map<String, Object> event) {
        try {
            String fileId = (String) data.get("fileId");
            String filename = (String) data.get("filename");
            String summary = (String) data.get("summary");
            Integer summaryLength = (Integer) data.get("summaryLength");
            
            // Lấy key points từ data
            List<String> keyPoints = new ArrayList<>();
            if (data.get("keyPoints") instanceof List) {
                keyPoints = (List<String>) data.get("keyPoints");
            }
            
            // Lấy thông tin classification từ event
            String classification = "CONTRACT"; // Default
            Double classificationConfidence = 0.92; // Default
            List<String> categories = Arrays.asList("document", "contract"); // Default
            
            // Tìm classification event trong cùng correlation
            String correlationId = (String) event.get("correlationId");
            if (correlationId != null) {
                // Có thể tìm thêm thông tin classification từ các events khác
                // Hiện tại sử dụng default values
            }
            
            contractService.createOrUpdateContractSummary(
                contractId,
                fileId,
                filename,
                summary,
                summaryLength,
                keyPoints,
                "AI/OCR", // extractionMethod
                new java.math.BigDecimal("0.95"), // confidence
                classification,
                new java.math.BigDecimal(classificationConfidence.toString()),
                categories
            );
            
            logger.info("✅ Saved contract summary for contract ID: {} and file: {}", contractId, filename);
            
        } catch (Exception e) {
            logger.error("Error saving contract summary: {}", e.getMessage(), e);
        }
    }

    /**
     * Publish contract-updated event
     */
    private void publishContractUpdated(Map<String, Object> originalEvent, Map<String, Object> data, Map<String, Object> actor, String fileId, Long contractId) {
        try {
            Map<String, Object> contractUpdatedEvent = new HashMap<>();
            contractUpdatedEvent.put("eventVersion", "v1");
            contractUpdatedEvent.put("eventType", "ContractUpdated");
            contractUpdatedEvent.put("eventId", UUID.randomUUID().toString());
            contractUpdatedEvent.put("timestamp", ZonedDateTime.now().toString());
            contractUpdatedEvent.put("source", "contract-management-service");
            contractUpdatedEvent.put("correlationId", originalEvent.get("correlationId"));
            contractUpdatedEvent.put("actor", actor);
            
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("fileId", data.get("fileId"));
            eventData.put("filename", data.get("filename"));
            eventData.put("contractId", contractId.toString());
            eventData.put("status", "PROCESSED");
            eventData.put("summary", data.get("summary"));
            eventData.put("processedAt", ZonedDateTime.now().toString());
            eventData.put("processedBy", actor.get("userId"));
            
            contractUpdatedEvent.put("data", eventData);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("serviceVersion", "1.0.0");
            metadata.put("processingTime", ZonedDateTime.now().toString());
            contractUpdatedEvent.put("metadata", metadata);

            String payloadJson = objectMapper.writeValueAsString(contractUpdatedEvent);
            kafkaTemplate.send(contractEventsTopic, fileId, payloadJson);
            
            logger.info("✅ Published ContractUpdated event for file: {} with contract ID: {}", data.get("filename"), contractId);
            
        } catch (Exception e) {
            logger.error("❌ Failed to publish ContractUpdated event: {}", e.getMessage(), e);
        }
    }
}
