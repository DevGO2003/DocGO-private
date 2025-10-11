package com.devgo2003.docgo.document_service.service.impl;

import com.devgo2003.docgo.document_service.entity.Contract;
import com.devgo2003.docgo.document_service.enums.ContractStatus;
import com.devgo2003.docgo.document_service.enums.ContractType;
import com.devgo2003.docgo.document_service.entity.ContractAttachment;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;

/**
 * Service để publish các events liên quan đến Contract
 * Tách từ ContractKafkaServiceImpl để giảm kích thước file
 */
@Service
public class ContractEventPublisherServiceImpl {

    private static final Logger logger = LoggerFactory.getLogger(ContractEventPublisherServiceImpl.class);

    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;

    @Value("${kafka.contract-events-topic:contract.events}")
    private String contractEventsTopic;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Publish event khi tạo contract mới
     */
    @Transactional
    public void publishContractCreatedEvent(Contract contract) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractCreated");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("title", contract.getTitle());
            data.put("status", contract.getStatus());
            data.put("contractType", contract.getContractType());
            data.put("createdAt", contract.getCreatedAt());
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractCreated event for contract: {}", contract.getId());
        } catch (Exception e) {
            logger.error("Error publishing ContractCreated event for contract: {}", contract.getId(), e);
        }
    }

    /**
     * Publish event khi cập nhật contract
     */
    @Transactional
    public void publishContractUpdatedEvent(Contract contract, Map<String, Object> changes) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractUpdated");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("title", contract.getTitle());
            data.put("status", contract.getStatus());
            data.put("contractType", contract.getContractType());
            data.put("updatedAt", contract.getUpdatedAt());
            data.put("changes", changes);
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractUpdated event for contract: {}", contract.getId());
        } catch (Exception e) {
            logger.error("Error publishing ContractUpdated event for contract: {}", contract.getId(), e);
        }
    }

    /**
     * Publish event khi xóa contract
     */
    @Transactional
    public void publishContractDeletedEvent(Contract contract) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractDeleted");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("title", contract.getTitle());
            data.put("status", contract.getStatus());
            data.put("contractType", contract.getContractType());
            data.put("deletedAt", ZonedDateTime.now().toString());
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractDeleted event for contract: {}", contract.getId());
        } catch (Exception e) {
            logger.error("Error publishing ContractDeleted event for contract: {}", contract.getId(), e);
        }
    }

    /**
     * Publish event khi thay đổi trạng thái contract
     */
    @Transactional
    public void publishContractStatusChangedEvent(Contract contract, ContractStatus oldStatus, ContractStatus newStatus) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractStatusChanged");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("title", contract.getTitle());
            data.put("oldStatus", oldStatus);
            data.put("newStatus", newStatus);
            data.put("contractType", contract.getContractType());
            data.put("changedAt", ZonedDateTime.now().toString());
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractStatusChanged event for contract: {} from {} to {}", 
                contract.getId(), oldStatus, newStatus);
        } catch (Exception e) {
            logger.error("Error publishing ContractStatusChanged event for contract: {}", contract.getId(), e);
        }
    }

    /**
     * Publish event khi thêm attachment vào contract
     */
    @Transactional
    public void publishContractAttachmentAddedEvent(Contract contract, ContractAttachment attachment) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractAttachmentAdded");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("attachmentId", attachment.getId());
            data.put("attachmentName", attachment.getFileName());
            data.put("attachmentType", attachment.getFileType());
            data.put("attachmentSize", attachment.getFileSize());
            data.put("addedAt", ZonedDateTime.now().toString());
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractAttachmentAdded event for contract: {} and attachment: {}", 
                contract.getId(), attachment.getId());
        } catch (Exception e) {
            logger.error("Error publishing ContractAttachmentAdded event for contract: {} and attachment: {}", 
                contract.getId(), attachment.getId(), e);
        }
    }

    /**
     * Publish event khi xóa attachment khỏi contract
     */
    @Transactional
    public void publishContractAttachmentRemovedEvent(Contract contract, ContractAttachment attachment) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractAttachmentRemoved");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("attachmentId", attachment.getId());
            data.put("attachmentName", attachment.getFileName());
            data.put("attachmentType", attachment.getFileType());
            data.put("removedAt", ZonedDateTime.now().toString());
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractAttachmentRemoved event for contract: {} and attachment: {}", 
                contract.getId(), attachment.getId());
        } catch (Exception e) {
            logger.error("Error publishing ContractAttachmentRemoved event for contract: {} and attachment: {}", 
                contract.getId(), attachment.getId(), e);
        }
    }

    /**
     * Publish event khi contract sắp hết hạn
     */
    @Transactional
    public void publishContractExpiringEvent(Contract contract, int daysUntilExpiry) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractExpiring");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("title", contract.getTitle());
            data.put("status", contract.getStatus());
            data.put("contractType", contract.getContractType());
            data.put("daysUntilExpiry", daysUntilExpiry);
            data.put("expiryDate", contract.getExpiryDate());
            data.put("notifiedAt", ZonedDateTime.now().toString());
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractExpiring event for contract: {} with {} days until expiry", 
                contract.getId(), daysUntilExpiry);
        } catch (Exception e) {
            logger.error("Error publishing ContractExpiring event for contract: {}", contract.getId(), e);
        }
    }

    /**
     * Publish event khi contract hết hạn
     */
    @Transactional
    public void publishContractExpiredEvent(Contract contract) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractExpired");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("title", contract.getTitle());
            data.put("status", contract.getStatus());
            data.put("contractType", contract.getContractType());
            data.put("expiryDate", contract.getExpiryDate());
            data.put("expiredAt", ZonedDateTime.now().toString());
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractExpired event for contract: {}", contract.getId());
        } catch (Exception e) {
            logger.error("Error publishing ContractExpired event for contract: {}", contract.getId(), e);
        }
    }

    /**
     * Publish event khi contract được khôi phục
     */
    @Transactional
    public void publishContractRestoredEvent(Contract contract) {
        try {
            Map<String, Object> eventData = new LinkedHashMap<>();
            eventData.put("eventType", "ContractRestored");
            eventData.put("eventId", UUID.randomUUID().toString());
            eventData.put("timestamp", ZonedDateTime.now().toString());
            eventData.put("source", "document-management-service");
            eventData.put("correlationId", UUID.randomUUID().toString());
            
            Map<String, Object> actor = new HashMap<>();
            actor.put("userId", "system");
            actor.put("userRole", "system");
            actor.put("ip", "127.0.0.1");
            eventData.put("actor", actor);
            
            Map<String, Object> data = new HashMap<>();
            data.put("contractId", contract.getId());
            data.put("contractNumber", contract.getContractNumber());
            data.put("title", contract.getTitle());
            data.put("status", contract.getStatus());
            data.put("contractType", contract.getContractType());
            data.put("restoredAt", ZonedDateTime.now().toString());
            eventData.put("data", data);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("region", "VN");
            metadata.put("serviceVersion", "1.0.0");
            eventData.put("metadata", metadata);
            
            String eventJson = objectMapper.writeValueAsString(eventData);
            kafkaTemplate.send(contractEventsTopic, eventJson);
            
            logger.info("Published ContractRestored event for contract: {}", contract.getId());
        } catch (Exception e) {
            logger.error("Error publishing ContractRestored event for contract: {}", contract.getId(), e);
        }
    }
}
