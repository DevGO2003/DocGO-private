package com.devgo2003.docgo.file_service.service;

import com.devgo2003.docgo.file_service.dto.JsonAnalysisEventDto;

public interface IJsonAnalysisService {
    /**
     * Process JSON analysis completed event from Kafka
     * @param event The JSON analysis completed event
     */
    void processJsonAnalysisCompleted(JsonAnalysisEventDto event);
}

