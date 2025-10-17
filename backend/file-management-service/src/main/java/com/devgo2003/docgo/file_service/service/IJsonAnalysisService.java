package com.devgo2003.docgo.file_service.service;

import com.devgo2003.docgo.file_service.entity.FileEntity;
import com.devgo2003.docgo.file_service.dto.JsonAnalysisEventDto;

public interface IJsonAnalysisService {
    
    /**
     * Phân tích JSON content và cập nhật FileEntity
     * @param fileEntity FileEntity cần cập nhật
     * @param jsonContent Nội dung JSON để phân tích
     * @return FileEntity đã được cập nhật
     */
    FileEntity analyzeJsonContent(FileEntity fileEntity, String jsonContent);
    
    /**
     * Xử lý JSON analysis event từ Kafka
     * @param fileId ID của file cần phân tích
     * @param jsonContent Nội dung JSON
     */
    void processJsonAnalysisEvent(String fileId, String jsonContent);
    
    /**
     * Xử lý JSON analysis completed event từ Kafka
     * @param event Event từ Kafka
     */
    void processJsonAnalysisCompleted(JsonAnalysisEventDto event);
}