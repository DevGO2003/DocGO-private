package com.devgo2003.docgo.contract_service.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class AIEventsConsumer {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ContractEventPublisher contractEventPublisher;

    @Value("${app.kafka.topic.contract-events:contract.events}")
    private String contractEventsTopic;

    @KafkaListener(topics = "${app.kafka.topic.ai-events:ai.events}",
                   groupId = "${spring.kafka.consumer.group-id:contract-service-group}")
    public void consumeAIEvents(ConsumerRecord<String, String> record) {
        try {
            final String value = record.value();
            if (value == null || value.isBlank()) {
                return;
            }

            JsonNode root = objectMapper.readTree(value);
            String eventType = getText(root, "eventType");
            if (!"SummaryCreated".equals(eventType)) {
                return; // only interested in summary-created for now
            }

            JsonNode data = root.path("data");
            String fileId = getText(data, "fileId");
            String filename = getText(data, "filename");

            Map<String, Object> contractUpdated = new HashMap<>();
            contractUpdated.put("eventVersion", "v1");
            contractUpdated.put("eventType", "ContractUpdated");
            contractUpdated.put("eventId", UUID.randomUUID().toString().replace("-", ""));
            contractUpdated.put("timestamp", OffsetDateTime.now().toString());
            contractUpdated.put("source", "contract-management-service");
            contractUpdated.put("correlationId", getText(root, "correlationId"));
            contractUpdated.put("actor", root.path("actor"));

            Map<String, Object> payload = new HashMap<>();
            payload.put("fileId", fileId);
            payload.put("filename", filename);
            payload.put("summary", data.path("summary").asText(null));
            payload.put("keyPoints", data.path("keyPoints"));
            payload.put("status", "UPDATED");
            contractUpdated.put("data", payload);

            Map<String, Object> metadata = new HashMap<>();
            metadata.put("serviceVersion", "1.0.0");
            contractUpdated.put("metadata", metadata);

            contractEventPublisher.publishContractEvent(contractEventsTopic, fileId, contractUpdated);
            log.info("Published ContractUpdated for fileId={}, filename={}", fileId, filename);
        } catch (Exception e) {
            log.error("Error while consuming AI event: {}", e.getMessage(), e);
        }
    }

    private String getText(JsonNode node, String field) {
        if (node == null) return null;
        JsonNode n = node.path(field);
        return n.isMissingNode() || n.isNull() ? null : n.asText();
    }
}


