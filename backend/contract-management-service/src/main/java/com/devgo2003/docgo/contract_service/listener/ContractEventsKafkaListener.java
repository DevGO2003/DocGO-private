package com.devgo2003.docgo.contract_service.listener;

import com.devgo2003.docgo.contract_service.service.IContractService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class ContractEventsKafkaListener {
    private static final Logger logger = LoggerFactory.getLogger(ContractEventsKafkaListener.class);

    private final IContractService contractService;
    private final ObjectMapper objectMapper;

    @Autowired
    public ContractEventsKafkaListener(IContractService contractService, ObjectMapper objectMapper) {
        this.contractService = contractService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
        topics = "${app.kafka.topic.contract-summary-updated}",
        groupId = "${spring.kafka.consumer.group-id}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleContractSummaryUpdated(String eventJson) {
        try {
            logger.info("Received contract.summary.updated event: {}", eventJson);

            Map<String, Object> event = objectMapper.readValue(eventJson, new TypeReference<>() {});

            if (!"contract.summary.updated".equals(event.get("eventType"))) {
                logger.warn("Ignoring event with unexpected type: {}", event.get("eventType"));
                return;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> summaryData = (Map<String, Object>) event.get("data");

            if (summaryData == null) {
                logger.error("Event data is null. Cannot process summary.");
                return;
            }

            contractService.createOrUpdateContractFromSummary(summaryData);

            logger.info("Successfully processed contract.summary.updated event for contract number: {}", summaryData.get("contractNumber"));

        } catch (Exception e) {
            logger.error("Error processing contract.summary.updated event: {}", e.getMessage(), e);
        }
    }
}

