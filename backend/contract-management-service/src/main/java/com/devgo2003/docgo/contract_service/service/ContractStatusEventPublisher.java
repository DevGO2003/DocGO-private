package com.devgo2003.docgo.contract_service.service;

import com.devgo2003.docgo.contract_service.entity.Contract;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContractStatusEventPublisher {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${app.kafka.topic.contract-events:contract.events}")
    private String contractEventsTopic;

    /**
     * Publish ContractCreated event
     */
    public void publishContractCreated(Contract contract, String correlationId, String userId, String userRole) {
        try {
            log.info("📢 [CONTRACT_CREATED_PUBLISH_START] Bắt đầu publish ContractCreated event - contractId: {}, correlationId: {}", 
                     contract.getId(), correlationId);
            
            Map<String, Object> contractCreatedEvent = createContractEventPayload(
                "ContractCreated", contract, correlationId, userId, userRole
            );
            
            String payloadJson = objectMapper.writeValueAsString(contractCreatedEvent);
            String key = contract.getId().toString();
            
            log.info("📤 [KAFKA_SEND] Gửi ContractCreated event lên Kafka topic: {} với key: {}", contractEventsTopic, key);
            kafkaTemplate.send(contractEventsTopic, key, payloadJson);
            
            log.info("✅ [CONTRACT_CREATED_PUBLISH_SUCCESS] Đã publish ContractCreated event thành công cho contract ID: {} với correlationId: {}", 
                     contract.getId(), correlationId);
            
        } catch (Exception e) {
            log.error("❌ [CONTRACT_CREATED_PUBLISH_FAILED] Không thể publish ContractCreated event: {} - contractId: {}, correlationId: {}", 
                      e.getMessage(), contract.getId(), correlationId, e);
        }
    }

    /**
     * Publish ContractUpdated event
     */
    public void publishContractUpdated(Contract contract, String correlationId, String userId, String userRole) {
        try {
            log.info("📢 [CONTRACT_UPDATED_PUBLISH_START] Bắt đầu publish ContractUpdated event - contractId: {}, correlationId: {}", 
                     contract.getId(), correlationId);
            
            Map<String, Object> contractUpdatedEvent = createContractEventPayload(
                "ContractUpdated", contract, correlationId, userId, userRole
            );
            
            String payloadJson = objectMapper.writeValueAsString(contractUpdatedEvent);
            String key = contract.getId().toString();
            
            log.info("📤 [KAFKA_SEND] Gửi ContractUpdated event lên Kafka topic: {} với key: {}", contractEventsTopic, key);
            kafkaTemplate.send(contractEventsTopic, key, payloadJson);
            
            log.info("✅ [CONTRACT_UPDATED_PUBLISH_SUCCESS] Đã publish ContractUpdated event thành công cho contract ID: {} với correlationId: {}", 
                     contract.getId(), correlationId);
            
        } catch (Exception e) {
            log.error("❌ [CONTRACT_UPDATED_PUBLISH_FAILED] Không thể publish ContractUpdated event: {} - contractId: {}, correlationId: {}", 
                      e.getMessage(), contract.getId(), correlationId, e);
        }
    }

    /**
     * Publish ContractDeleted event
     */
    public void publishContractDeleted(Contract contract, String correlationId, String userId, String userRole) {
        try {
            log.info("📢 [CONTRACT_DELETED_PUBLISH_START] Bắt đầu publish ContractDeleted event - contractId: {}, correlationId: {}", 
                     contract.getId(), correlationId);
            
            Map<String, Object> contractDeletedEvent = createContractEventPayload(
                "ContractDeleted", contract, correlationId, userId, userRole
            );
            
            String payloadJson = objectMapper.writeValueAsString(contractDeletedEvent);
            String key = contract.getId().toString();
            
            log.info("📤 [KAFKA_SEND] Gửi ContractDeleted event lên Kafka topic: {} với key: {}", contractEventsTopic, key);
            kafkaTemplate.send(contractEventsTopic, key, payloadJson);
            
            log.info("✅ [CONTRACT_DELETED_PUBLISH_SUCCESS] Đã publish ContractDeleted event thành công cho contract ID: {} với correlationId: {}", 
                     contract.getId(), correlationId);
            
        } catch (Exception e) {
            log.error("❌ [CONTRACT_DELETED_PUBLISH_FAILED] Không thể publish ContractDeleted event: {} - contractId: {}, correlationId: {}", 
                      e.getMessage(), contract.getId(), correlationId, e);
        }
    }

    /**
     * Publish ContractRestored event
     */
    public void publishContractRestored(Contract contract, String correlationId, String userId, String userRole) {
        try {
            log.info("📢 [CONTRACT_RESTORED_PUBLISH_START] Bắt đầu publish ContractRestored event - contractId: {}, correlationId: {}", 
                     contract.getId(), correlationId);
            
            Map<String, Object> contractRestoredEvent = createContractEventPayload(
                "ContractRestored", contract, correlationId, userId, userRole
            );
            
            String payloadJson = objectMapper.writeValueAsString(contractRestoredEvent);
            String key = contract.getId().toString();
            
            log.info("📤 [KAFKA_SEND] Gửi ContractRestored event lên Kafka topic: {} với key: {}", contractEventsTopic, key);
            kafkaTemplate.send(contractEventsTopic, key, payloadJson);
            
            log.info("✅ [CONTRACT_RESTORED_PUBLISH_SUCCESS] Đã publish ContractRestored event thành công cho contract ID: {} với correlationId: {}", 
                     contract.getId(), correlationId);
            
        } catch (Exception e) {
            log.error("❌ [CONTRACT_RESTORED_PUBLISH_FAILED] Không thể publish ContractRestored event: {} - contractId: {}, correlationId: {}", 
                      e.getMessage(), contract.getId(), correlationId, e);
        }
    }

    /**
     * Publish ContractStatusChanged event
     */
    public void publishContractStatusChanged(Contract contract, String oldStatus, String newStatus, 
                                           String correlationId, String userId, String userRole) {
        try {
            log.info("📢 [CONTRACT_STATUS_CHANGED_PUBLISH_START] Bắt đầu publish ContractStatusChanged event - contractId: {}, oldStatus: {}, newStatus: {}, correlationId: {}", 
                     contract.getId(), oldStatus, newStatus, correlationId);
            
            Map<String, Object> contractStatusChangedEvent = createContractEventPayload(
                "ContractStatusChanged", contract, correlationId, userId, userRole
            );
            
            // Thêm thông tin status change
            Map<String, Object> eventData = (Map<String, Object>) contractStatusChangedEvent.get("data");
            eventData.put("oldStatus", oldStatus);
            eventData.put("newStatus", newStatus);
            eventData.put("statusChangeReason", "Manual update");
            
            String payloadJson = objectMapper.writeValueAsString(contractStatusChangedEvent);
            String key = contract.getId().toString();
            
            log.info("📤 [KAFKA_SEND] Gửi ContractStatusChanged event lên Kafka topic: {} với key: {}", contractEventsTopic, key);
            kafkaTemplate.send(contractEventsTopic, key, payloadJson);
            
            log.info("✅ [CONTRACT_STATUS_CHANGED_PUBLISH_SUCCESS] Đã publish ContractStatusChanged event thành công cho contract ID: {} với correlationId: {}", 
                     contract.getId(), correlationId);
            
        } catch (Exception e) {
            log.error("❌ [CONTRACT_STATUS_CHANGED_PUBLISH_FAILED] Không thể publish ContractStatusChanged event: {} - contractId: {}, correlationId: {}", 
                      e.getMessage(), contract.getId(), correlationId, e);
        }
    }

    /**
     * Tạo contract event payload cơ bản
     */
    private Map<String, Object> createContractEventPayload(String eventType, Contract contract, 
                                                          String correlationId, String userId, String userRole) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventVersion", "v1");
        event.put("eventType", eventType);
        event.put("eventId", UUID.randomUUID().toString());
        event.put("timestamp", OffsetDateTime.now().toString());
        event.put("source", "contract-management-service");
        event.put("correlationId", correlationId);
        
        Map<String, Object> actor = new HashMap<>();
        actor.put("userId", userId != null ? userId : "system");
        actor.put("userRole", userRole != null ? userRole : "service");
        actor.put("ip", "internal");
        event.put("actor", actor);
        
        Map<String, Object> eventData = new HashMap<>();
        eventData.put("contractId", contract.getId().toString());
        eventData.put("contractNumber", contract.getContractNumber());
        eventData.put("title", contract.getTitle());
        eventData.put("status", contract.getStatus() != null ? contract.getStatus().toString() : "UNKNOWN");
        eventData.put("contractType", contract.getContractType());
        eventData.put("systemId", contract.getSystemId());
        eventData.put("createdAt", contract.getCreatedAt() != null ? contract.getCreatedAt().toString() : null);
        eventData.put("updatedAt", contract.getCreatedAt() != null ? contract.getCreatedAt().toString() : null);
        eventData.put("processedAt", OffsetDateTime.now().toString());
        eventData.put("processedBy", userId != null ? userId : "system");
        event.put("data", eventData);
        
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("serviceVersion", "1.0.0");
        metadata.put("processingTime", OffsetDateTime.now().toString());
        metadata.put("contractVersion", contract.getVersion() != null ? contract.getVersion().toString() : "1");
        event.put("metadata", metadata);
        
        return event;
    }
}
