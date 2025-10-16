package com.devgo2003.docgo.file_service.listener;

import com.devgo2003.docgo.file_service.dto.JsonAnalysisEventDto;
import com.devgo2003.docgo.file_service.service.IJsonAnalysisService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class JsonAnalysisKafkaListener {
    private static final Logger logger = LoggerFactory.getLogger(JsonAnalysisKafkaListener.class);
    
    private final IJsonAnalysisService jsonAnalysisService;
    private final ObjectMapper objectMapper;

    @Autowired
    public JsonAnalysisKafkaListener(IJsonAnalysisService jsonAnalysisService, ObjectMapper objectMapper) {
        this.jsonAnalysisService = jsonAnalysisService;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
        topics = "${app.kafka.topic.json-analysis-completed:json.analysis.completed}",
        groupId = "${app.kafka.group-id:file-service-group}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleJsonAnalysisCompleted(String eventJson) {
        try {
            logger.info("[JSON_ANALYSIS_COMPLETED] Received event: {}", eventJson);
            
            JsonAnalysisEventDto event = objectMapper.readValue(eventJson, JsonAnalysisEventDto.class);
            
            // Validate event type
            if ("JsonAnalysisCompleted".equals(event.getEventType()) || 
                "json.analysis.completed".equals(event.getEventType())) {
                logger.info("[JSON_ANALYSIS_COMPLETED] Processing for jobId: {}", 
                    event.getData().getJobId());
                
                jsonAnalysisService.processJsonAnalysisCompleted(event);
                
                logger.info("[JSON_ANALYSIS_COMPLETED] Successfully processed jobId: {}", 
                    event.getData().getJobId());
            } else {
                logger.debug("[JSON_ANALYSIS_COMPLETED] Ignoring event type: {}", event.getEventType());
            }
            
        } catch (Exception e) {
            logger.error("[JSON_ANALYSIS_COMPLETED] Error processing event: {}", e.getMessage(), e);
            // Không throw exception để tránh crash consumer
            // Có thể implement retry logic hoặc dead letter queue sau này
        }
    }
}

